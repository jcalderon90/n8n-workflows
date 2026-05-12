# Spectrum Agente Unificado — Gemini CLI Guide

Este archivo es leído automáticamente por Gemini CLI. Contiene las instrucciones para trabajar correctamente en este proyecto de automatización inmobiliaria.

---

## Reglas de uso de Skills

**Antes de cualquier tarea, lee los skills relevantes según la situación:**

### Siempre leer (en todo trabajo sobre este proyecto)
- `.skills/spectrum-agente-unificado/SKILL.md` — Arquitectura del sistema, mapeos CRM, catálogos y reglas de negocio de Spectrum Vivienda.

**Regla de búsqueda en archivos JSON de n8n:**
Usa siempre los scripts de `scripts/` en lugar de leer o buscar en el JSON completo:

```bash
# Ver todos los nodos de un workflow
./scripts/list-nodes.sh "AGENT PRINCIPAL.json"

# Extraer un nodo completo por nombre (reemplaza grep + leer ±80 líneas)
./scripts/get-node.sh "AGENT PRINCIPAL.json" "Prepare Update"

# Extraer un parámetro específico de un nodo
./scripts/get-node-param.sh "AGENT PRINCIPAL.json" "PRINCIPAL" "systemMessage"

# Buscar qué nodos contienen una keyword (expresión, campo, valor)
./scripts/search-nodes.sh "AGENT PRINCIPAL.json" "consulta_pendiente"
```

Si el nodo no está en el índice (Sección 6 del SKILL.md), usa `list-nodes.sh` primero.

### Leer según la tarea

| Situación | Skill a leer |
|---|---|
| Crear o diseñar un workflow nuevo | `.skills/n8n-workflow-patterns/SKILL.md` |
| Configurar parámetros de un nodo | `.skills/n8n-node-configuration/SKILL.md` |
| Escribir código en un nodo Code (JS) | `.skills/n8n-code-javascript/SKILL.md` |
| Escribir expresiones `{{ }}` | `.skills/n8n-expression-syntax/SKILL.md` |
| Interpretar errores de validación | `.skills/n8n-validation-expert/SKILL.md` |
| Usar herramientas MCP de n8n | `.skills/n8n-mcp-tools-expert/SKILL.md` |
| Escribir código Python en un nodo Code | `.skills/n8n-code-python/SKILL.md` |

---

## Arquitectura del Proyecto (resumen)

```
Agente Unificado/
├── AGENT PRINCIPAL.json       ← Orquestador: clasifica intenciones, delega a tools
├── Lead Collector.json        ← Captura y persiste datos del lead en MongoDB
├── KB SEARCH.json             ← Búsqueda en base de conocimiento por proyecto
├── RSVP.json                  ← Gestión de citas y disponibilidad
├── Send Media.json            ← Envío de archivos/brochures por WhatsApp
├── Sync_CRM.json              ← Sincronización diferida al CRM SOAP (cada 10-15 min)
└── Notifications Master.json  ← Notificaciones internas al equipo
```

**Persistencia:** MongoDB Atlas — colecciones `users`, `appointments`, `chat_histories*`, `quality_logs`

**CRM:** SOAP API Dynamics 365 — ver reglas completas en `.skills/spectrum-agente-unificado/SKILL.md`

---

## KBs disponibles

```
KBs/
├── KB PPOL.json  ← Polanco (PPOL)
├── KB PSB.json   ← Sotobosque (PSB)
├── KB PPO.json   ← Parque Portales (PPO)
├── KB PVV.json   ← Parque Vista Verde (PVV)
└── KB PMAR.json  ← Parque Mariscal (PMAR)
```

---

## Reglas críticas (nunca olvidar)

1. **Typos obligatorios en el XML del CRM:** `<_CorreEletronico>` y `<_UTMCampaing>` — así están definidos en la API, no corregir.
2. **Etiquetas opcionales:** Si un campo es nulo o vacío, omitir la etiqueta XML completa usando ternario: `{{ $json.valor ? '<_Tag>' + $json.valor + '</_Tag>' : '' }}`.
3. **Flag `conversation_analysis`:** El orquestador debe resetearlo a `false` con cada nuevo mensaje. El Sync_CRM lo marca `true` tras sincronizar.
4. **No duplicar leads:** Verificar existencia en MongoDB antes de crear un documento nuevo.
