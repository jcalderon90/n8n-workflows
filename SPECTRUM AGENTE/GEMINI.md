# GEMINI.md

This file provides guidance to Gemini CLI when working with code in this repository.

---

## Skills requeridos

Antes de cualquier tarea en este proyecto, lee los skills que apliquen:

| Situación | Skill |
|---|---|
| Siempre (arquitectura, CRM, catálogos) | `Agente Unificado/.skills/spectrum-agente-unificado/SKILL.md` |
| Crear o diseñar un workflow nuevo | `.skills/n8n-workflow-patterns/SKILL.md` |
| Configurar parámetros de un nodo | `.skills/n8n-node-configuration/SKILL.md` |
| Código en nodo Code (JS) | `.skills/n8n-code-javascript/SKILL.md` |
| Expresiones `{{ }}` | `.skills/n8n-expression-syntax/SKILL.md` |
| Interpretar errores de validación | `.skills/n8n-validation-expert/SKILL.md` |
| Usar herramientas MCP de n8n | `.skills/n8n-mcp-tools-expert/SKILL.md` |

**Regla de búsqueda en archivos JSON de n8n:**
Antes de hacer cualquier búsqueda en un archivo `.json` de workflow, consulta la **Sección 6** del SKILL.md para localizar el nodo exacto por nombre y línea aproximada. Luego busca directamente con:
```bash
grep -n '"name": "NOMBRE_NODO"' ARCHIVO.json
```
No hagas búsquedas por keywords en el JSON completo si el índice ya tiene el nodo.

---

## Arquitectura del sistema

Agente conversacional inmobiliario para **SPECTRUM VIVIENDA**. El orquestador central (*Sof-IA*) recibe mensajes desde ManyChat (WhatsApp, Instagram, Messenger), clasifica la intención y delega a sub-workflows especializados (tools). La persistencia es MongoDB Atlas y la sincronización al CRM es diferida via SOAP.

```
Agente Unificado/
├── AGENT PRINCIPAL.json       ← Orquestador: clasifica intenciones, delega a tools
├── Lead Collector.json        ← Captura y persiste datos del lead en MongoDB
├── KB SEARCH.json             ← RAG por proyecto (Vector Search en MongoDB)
├── RSVP.json                  ← Gestión de citas; escribe en colección `appointments`
├── Send Media.json            ← Envío de brochures/archivos por WhatsApp
├── Sync_CRM.json              ← Sincronización diferida al CRM SOAP (cada 10-15 min)
└── Notifications Master.json  ← Notificaciones internas al equipo
```

### Colecciones MongoDB
- `users` — datos del lead
- `appointments` — citas agendadas
- `chat_histories*` — historial de conversación por contacto
- `quality_logs` — auditoría de calidad post-sync

### Modelos IA
- `gpt-5.4-mini` — Orquestador (`AGENT PRINCIPAL.json`)
- `gpt-5-mini` — Tools especializadas (`KB SEARCH.json`)
- `gpt-4o` — Procesamiento de media (`Send Media.json`)

---

## Knowledge Bases (KBs)

Los archivos en `/KBs` se cargan en MongoDB Atlas (colección `documents`) para la búsqueda vectorial. El índice se llama `spectrum_vector_index`. El filtro es por el campo `"proyecto"` en **MAYÚSCULAS**.

| Archivo | Código de proyecto |
|---|---|
| `KB PVV.json` | `PVV` |
| `KB PMAR.json` | `PMAR` |
| `KB PPO.json` | `PPO` |
| `KB PPOL.json` | `PPOL` |
| `KB PSB.json` | `PSB` |

---

## Reglas críticas del CRM SOAP

**Endpoint:** `https://crm.spectrum.com.gt:8055/Spectrum_WS_GeneracionLead/Service.asmx`  
**SOAPAction:** `http://tempuri.org/CreacionClientePotencialBot`

### Typos obligatorios en el XML (así está definido en la API — no corregir)
- Email: `<_CorreEletronico>` (sin "o" en *Correo*, sin "c" en *Electrónico*)
- Campaña UTM: `<_UTMCampaing>` (sin "i" en *Campaign*)

### Etiquetas opcionales
Omitir la etiqueta completa si el valor es nulo. Solo `_Comentarios` puede enviarse vacío:
```
{{ $json.valor ? '<_Tag>' + $json.valor + '</_Tag>' : '' }}
```

### Catálogos de referencia rápida
Ver `spectrum-soap-api.md` para los códigos completos. Valores más usados:

| Campo | Valor | Label |
|---|---|---|
| `_OrigenCliente` | `100000001` | Chat (siempre fijo) |
| `_UTMSource` WhatsApp | `100000004` | — |
| `_UTMSource` Instagram | `100000012` | — |
| `_MetodocontactoPref` WhatsApp | `4` | ⚠️ Entero simple, no el catálogo CRM |
| `_EstadoCivil` Soltero | `100000000` | — |
| `_MotivoInteres` Inversión | `100000001` | — |
| `_Apellido` no disponible | `"N/A"` | Campo requerido |
| `_TelefonoMovil` | `+502XXXXXXXX` | Siempre con código de país |
| `_FechaCita` | ISO 8601 UTC | Ej: `2026-05-10T15:00:00.000Z` |

---

## Control de flujo y sincronización

- **`conversation_analysis` flag:** El orquestador lo resetea a `false` con cada mensaje nuevo. `Sync_CRM.json` lo marca `true` tras sincronizar.
- **Anti-duplicados:** Verificar existencia en MongoDB antes de crear un nuevo documento de lead.
- **Sync_CRM trigger:** Schedule cada 10-15 min. Filtra leads con `last_interaction` < 15 min atrás y `conversation_analysis != true`.

---

## Referencia de documentos del proyecto

- `estado_proyecto.md` — Estado actual de cada módulo y acciones pendientes
- `spectrum-soap-api.md` — Catálogo completo de códigos de la API SOAP
- `flujos de muestra/` — Flujos de referencia para entender patrones aplicados
