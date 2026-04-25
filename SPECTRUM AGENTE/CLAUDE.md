# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Spectrum Vivienda — Agente Unificado (Sof-IA)**: A modular conversational AI agent built on n8n. An orchestrator delegates tasks to specialized sub-workflows (tools), persists state in MongoDB, and syncs leads to Dynamics 365 CRM via SOAP.

---

## Workflow Files

All live n8n workflow exports are in `Agente Unificado/`. They are JSON files imported/exported directly from the n8n instance.

| File | Role |
|---|---|
| `Principal.json` | Orchestrator — receives ManyChat webhooks, buffers via Redis, runs Sof-IA agent |
| `Lead Collector.json` | Captures Name, Email, Phone conversationally; sends SOAP lead creation |
| `KB_Search.json` | Vector search on MongoDB Atlas filtered by project code |
| `RSVP.json` | Appointment scheduling (presencial / virtual / llamada) |
| `Send Media.json` | Delivers Cloudinary assets (renders, planos, brochure, amenidades) |
| `Sync_CRM.json` | Cron every 10-15 min — enriches CRM with AI summary + quality audit |
| `escalation.json` | Human escalation sub-flow |

Knowledge Bases (per-project vector chunks) are in `KBs/`.

---

## Patching Workflow JSON

When surgical changes to `Principal.json` or other workflows are needed, use or create a Node.js helper script (see `fix_rsvp.js`, `update_principal.js`) and run it from `Agente Unificado/`:

```bash
node fix_rsvp.js
node update_principal.js
```

After running a patch script, import the updated JSON into n8n via the UI (or n8n API).

---

## Architecture

### Data Flow

```
ManyChat (WhatsApp/IG/FB)
  → Webhook → Principal.json
      → Redis buffer (debounce fast messages)
      → MongoDB users (get/create profile)
      → Sof-IA LLM (gpt-4.1-mini)
          → lead_collector  (missing contact data)
          → kb_search       (project questions, complete profile)
          → rsvp            (scheduling requests)
          → send_media      (photo/brochure requests)
      → Update MongoDB + reply via ManyChat
```

```
Sync_CRM.json (cron)
  → Find users: last_interaction < 15 min ago AND conversation_analysis != true
  → Information Extractor (LLM) → Resumen + Dudas
  → SOAP POST → Dynamics 365 CRM
  → Mark conversation_analysis = true
  → Quality audit → quality_logs collection
```

The orchestrator resets `conversation_analysis` to `false` on every new user message (in the `DATA to UPDATE` node), enabling the sync to detect new conversations.

### MongoDB Collections

| Collection | Purpose |
|---|---|
| `users` | Lead profile: proyecto, CRM_Data, consulta_pendiente, conversation_analysis |
| `appointments` | Scheduled visits: type, date, habitaciones, intencion, estado_civil |
| `chat_histories` | Main agent memory (window: 20) |
| `chat_histories_lead` | Lead Collector memory (window: 10) |
| `chat_histories_rsvp` | RSVP agent memory (window: 20) |
| `quality_logs` | Per-conversation AI quality evaluation |

### Key Flags on `users`

- `consulta_pendiente`: stores user's original query while Lead Collector runs; orchestrator retakes it automatically after profile is complete.
- `conversation_analysis`: `false` = needs sync, `true` = already synced. Reset to `false` by orchestrator on every new message.
- `CRM_Data`: SOAP payload staging area written by Lead Collector; consumed by Sync_CRM.

---

## CRM SOAP API (Dynamics 365)

**Endpoint:** `POST https://crm.spectrum.com.gt:8055/Spectrum_WS_GeneracionLead/Service.asmx`  
**SOAPAction:** `http://tempuri.org/CreacionClientePotencialBot`  
**Content-Type:** `text/xml; charset=utf-8`

### Critical Typos (use exactly as-is — the CRM API has these bugs)

- Email field: `<_CorreEletronico>` (not `_CorreoElectronico`)
- Campaign field: `<_UTMCampaing>` (not `_UTMCampaign`)

### Optional Fields Rule

Omit a field entirely from the XML when it has no value. Only `_Comentarios` may be sent empty as `<_Comentarios/>`. In n8n expressions:

```
{{ $json.valor ? '<_Etiqueta>' + $json.valor + '</_Etiqueta>' : '' }}
```

### Project Code Mapping (internal → CRM)

| Internal | CRM Code | Project |
|---|---|---|
| `pvv` | `PVV` | Parque Vista Verde |
| `pm` | `PMAR` | Parque Mariscal |
| `pp` | `PPO` | Parque Portales |

### Catalog Values

**Estado Civil:** Soltero=`100000000`, Casado=`100000001`, Divorciado=`100000002`, Unido=`100000003`  
**Habitaciones:** 1=`100000000`, 2=`100000001`, 3=`100000002`  
**UTMSource:** WhatsApp=`100000004`, Facebook=`100000005`, Instagram=`100000012`  
**MetodocontactoPref:** Correo=`2`, Llamada=`3`, WhatsApp=`4`, Cualquiera=`5`  
**MotivoInteres:** Info=`100000000`, Inversión=`100000001`, Listo comprar=`100000002`, Habitar=`100000003`  
**TipoCita:** Presencial=`100000000`, Llamada/Virtual=`100000001`  
**OrigenCliente:** always `100000001`

---

## AI Models

| Context | Model |
|---|---|
| Orchestrator + all tools (default) | `gpt-4.1-mini` |
| Image / audio analysis | `gpt-4o` |

KB_Search uses temperature `0.1` to minimize hallucinations.

---

## n8n Skills Available

Skills in `Agente Unificado/.skills/` provide guided patterns:

- `spectrum-agente-unificado` — business rules and CRM mappings for this project
- `n8n-workflow-patterns` — architectural patterns
- `n8n-expression-syntax` — `{{ }}` expression validation
- `n8n-code-javascript` — Code node patterns (`$input`, `$json`, `$node`)
- `n8n-node-configuration` — required fields per node type
- `n8n-validation-expert` — interpreting validation errors

---

## Known Bugs

- **`Sync_CRM.json` `_EstadoCivil` mapping:** currently uses `100000001–100000005`. Correct range is `100000000–100000003`. Fix before production.
- Cloudinary URLs for renders/planos are not yet validated — confirm real URLs before going live.
