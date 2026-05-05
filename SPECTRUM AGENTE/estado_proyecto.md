# 🏢 SPECTRUM VIVIENDA: Agente Unificado — Estado del Proyecto
> Última actualización: 2026-05-04 (Correcciones de bugs reportadas por QA — prompts actualizados)

## 🎯 Objetivo General
Arquitectura de agente conversacional modular para SPECTRUM VIVIENDA. Un orquestador central (*Sof-IA*) delega tareas a sub-workflows especializados (Tools), con persistencia centralizada en MongoDB y sincronización diferida al CRM Dynamics 365 vía SOAP.

---

## 🛠️ Stack Tecnológico

| Componente | Detalle |
|---|---|
| **Orquestación** | n8n — workflows modulares vinculados via `Execute Workflow` |
| **Modelos IA** | `gpt-5.4-mini` (Orquestador), `gpt-4.1-mini` (Tools), `gpt-4o` (Media) |
| **Base de Datos** | MongoDB Atlas — colecciones `users`, `appointments`, `chat_histories`, `quality_logs` |
| **Vector Search** | MongoDB Atlas Vector Index (`spectrum_vector_index`) — Filtrado por campo `proyecto` |
| **Buffer/Cache** | Redis — Message Debouncing (agrupa mensajes rápidos) |
| **CRM** | Dynamics 365 via SOAP (Standardized Mappings) |
| **Canales** | ManyChat (WhatsApp, Instagram, Messenger) |

---

## 📦 Módulos (Workflows)

> Los archivos locales fueron sincronizados vía MCP desde n8n el 2026-05-01. Cada archivo contiene el JSON idéntico al servidor.

### 1. 🧠 Orquestador Central — `AGENT PRINCIPAL.json`
**Estado: ✅ Activo en n8n** | ID: `iXaptKTUXaXrP7aF` | 59 nodos | Última mod: 2026-05-05

- Clasifica intenciones y delega a sub-workflows (tools).
- Mapea nombres de proyectos a códigos oficiales en mayúsculas (`PVV`, `PPOL`, etc.).
- ✅ **Completado**: Lógica de notificación única por transición de estado y reseteo de flag `conversation_analysis`.
- ✅ **Completado**: Corrección de ambigüedad Zona 15 (PVV vs PSB).

### 2. 👤 Captador de Leads — `Lead Collector.json`
**Estado: ✅ Activo en n8n** | ID: `SHPFhvoal7k1Rqf9` | 15 nodos | Última mod: 2026-05-04

- Captura nombre, correo y teléfono del lead.
- Escribe en MongoDB (`users`) y sincroniza al CRM vía SOAP.
- ⚠️ **Pendiente aplicar en n8n**: Agregar confirmaciones válidas de teléfono ("simon", "simón", "va", "ya", etc.) en ESCENARIO 3.

### 3. 📚 Experto en Proyectos — `KB SEARCH.json`
**Estado: ✅ Activo en n8n** | ID: `D3LKuNi6CmMIdvzg` | 8 nodos | Última mod: 2026-04-30 | ⚠️ Pendiente vectorización

- Búsqueda vectorial en MongoDB Atlas con filtro por `proyecto`.
- Requiere que los KBs estén cargados en la colección `documents`.

### 4. 🗓️ Motor de Citas — `RSVP.json`
**Estado: ✅ Activo en n8n** | ID: `TjFPzHs5aimxILH7` | 22 nodos | Última mod: 2026-04-30

- Gestiona citas presenciales, virtuales y llamadas.
- Escribe en colección `appointments` y enriquece datos del lead.

### 5. 📤 Envío de Media — `Send Media.json`
**Estado: ✅ Activo en n8n** | ID: `NtTiyrNy2LHimE7u` | 4 nodos | Última mod: 2026-04-30 | ⚠️ URLs placeholder en PMAR y PPO

- Envía brochures, renders y planos vía ManyChat API.
- PVV tiene URLs reales; PMAR y PPO usan URLs de prueba.

### 6. 🔔 Notificaciones — `Notifications Master.json`
**Estado: ✅ Activo en n8n** | ID: `r1Jf5vwrkBrT4dEu` | 8 nodos | Última mod: 2026-04-30 | ⚠️ Gmail hardcodeado a jorge.calderon@garooinc.com

- Maneja 4 tipos de alerta: `nuevo_lead`, `interes_precios`, `cita`, `escalacion`.
- En producción debe enviar al destinatario correcto de Spectrum, no a Jorge.

### 7. 🔄 Sincronización CRM — `Sync_CRM.json`
**Estado: ⛔ INACTIVO en n8n** | ID: `TTVNRX38pPoPmK2X` | 29 nodos | Última mod: 2026-04-30

- Schedule cada 10 min. Sincroniza leads maduros al CRM SOAP.
- Desactivado intencionalmente — activar solo cuando el sistema esté en producción.

### Workflows de soporte (en n8n, fuera de esta carpeta)

| Workflow | ID | Estado | Función |
|---|---|---|---|
| `SPECTRUM - VIVIENDA - ORQUESTADOR` | `Rubf8G68RUyrUlkP` | ✅ Activo | Orquestador principal (ManyChat → Agent) |
| `SPECTRUM - Error Handler` | `1vyPDStd2kybsWQD` | ✅ Activo | Manejo global de errores |
| `Company-Knowledge MongoDB - CHUNKS - FILTER` | `LLiVnT0M6xvDKive` | ⛔ Inactivo | Vectorización de KBs (uso manual) |
| `LEAD CONVERSATIONS REPORT` | `QFTI5yoJLhCuGHFb` | ⛔ Inactivo | Reporte de conversaciones |

---

## 📂 Knowledge Base (KBs)
Se han estandarizado los 5 archivos JSON de la carpeta `/KBs`:

- [x] **PVV** (Parque Vista Verde)
- [x] **PMAR** (Parque Mariscal)
- [x] **PPO** (Parque Portales)
- [x] **PPOL** (Polanco) - *NUEVO*
- [x] **PSB** (Sotobosque) - *NUEVO*

**Mejoras en KB:**
*   **Metadata:** Campo `"proyecto"` unificado en mayúsculas.
*   **Script Comercial:** Se agregó una entrada dedicada para "Medidas de Balcón" con un guion emocional y comercial estandarizado para todos los proyectos.

---

## 🔢 Proceso de Vectorización de KBs

**Workflow en n8n:** `Company-Knowledge MongoDB - CHUNKS - FILTER` (ID: `LLiVnT0M6xvDKive`)
**Carpeta:** Knowledge Bases
**Trigger:** Manual (ejecutar a mano por proyecto)

### Flujo interno

```
Manual Trigger
    → LISTA de CHUNKS      ← array hardcodeado con los chunks del KB
    → Split Out            ← separa cada chunk en un item independiente
    → Default Data Loader  ← texto del documento = "pregunta. respuesta"
                              metadata = id, categoria, tags, pregunta, respuesta, proyecto
    → Embeddings OpenAI    ← genera el vector (modelo text-embedding)
    → MongoDB Atlas        ← inserta en colección `documents`
                              índice: spectrum_vector_index
                              embedding field: spectrum_embedding
```

### Estructura de cada chunk (lo que va en LISTA de CHUNKS)

```json
{
  "id": "pvv_resumen_general",
  "proyecto": "PVV",
  "categoria": "proyecto",
  "tags": ["resumen", "vista verde", "zona 10"],
  "pregunta": "¿Qué es Parque Vista Verde?",
  "respuesta": "Parque Vista Verde es..."
}
```

El campo `proyecto` debe ir en **MAYÚSCULAS** — es el filtro que usa `KB SEARCH.json` para recuperar solo los chunks del proyecto correcto.

### Proceso para cargar cada KB

1. Abrir el nodo **LISTA de CHUNKS** en el workflow
2. Reemplazar el array con el contenido del archivo `/KBs/KB [PROYECTO].json`
3. Click **Execute workflow**
4. Repetir para cada proyecto

### Proyectos y sus códigos

| Archivo local | Código `proyecto` |
|---|---|
| `KB PVV.json` | `PVV` |
| `KB PMAR.json` | `PMAR` |
| `KB PPO.json` | `PPO` |
| `KB PL.json` | `PPOL` |
| `KB SB.json` | `PSB` |

### Advertencia: sin limpieza automática

El workflow hace `insert` directo. Si se corre dos veces para el mismo proyecto, los chunks se duplican en MongoDB. Antes de cada carga, eliminar los documentos existentes del proyecto:

```js
// Filtro para borrar en MongoDB Atlas (colección documents)
{ "metadata.proyecto": "PVV" }
```

---

## 🚀 Punto Actual del Proyecto

Los 7 workflows están sincronizados desde n8n vía MCP al repositorio local (2026-05-01). 6 de los 7 están activos; Sync_CRM está inactivo intencionalmente. El proyecto está listo para la fase de pruebas, bloqueado únicamente por la vectorización de los KBs.

### ✅ Completado
- Workflows sincronizados desde n8n vía MCP (descarga directa del servidor, 2026-05-01)
- Archivos locales contienen la versión exacta del servidor de n8n
- KBs estandarizados (5 proyectos, metadatos en mayúsculas)
- Proceso de vectorización documentado
- Archivos obsoletos eliminados (`fix_rsvp.js`, `update_principal.js`, `.claude/` vacío)
- IDs de workflows documentados para referencia directa
- **Auditoría profunda de Workflows completada y bugs corregidos (2026-05-01)**:
  - Códigos de proyecto erróneos (`pm`, `pp`) en descriptions de *kb_search* y *rsvp* corregidos.
  - Bloque duplicado de *send_media* eliminado del system prompt de *PRINCIPAL*.
  - Variante "Parque Sotobosque" agregada a los mapeos para evitar ambigüedades.
  - Fallback silencioso a "PVV" eliminado en nodo *Proyecto* (ahora queda vacío para activar la pregunta al usuario).
  - Remitente de correos estandarizado a "SPECTRUM VIVIENDA".
  - Nombres de nodos con encoding corrupto corregidos (ej. *Payload Escalación*).
  - Riesgo de formato `_Proyecto` en CRM descartado (API sí acepta códigos "PVV", etc.).
- **Bugs de QA identificados y prompts corregidos (2026-05-04)**:
  - "simon" y modismos guatemaltecos ahora reconocidos como confirmación en Lead Collector (ESCENARIO 3).
  - Ambigüedad de Zona 15 resuelta en AGENT PRINCIPAL: "zona 15" ya no mapea directamente a PVV; pregunta específicamente entre PVV y PSB.
  - Formato de nombres de proyecto actualizado a "Nombre - Zona X" en respuestas del bot.
  - Excepción añadida al RETOMO CASO A para manejar consultas con "zona 15".

### 🔜 Pendiente antes de producción

| # | Tarea | Bloqueante | Estado |
|---|---|---|---|
| 1 | **Vectorizar KBs** — cargar los 5 JSONs en MongoDB `documents` | Sí — sin esto KB SEARCH no funciona | ✅ Completado (2026-05-02) |
| 2 | **Fix Gmail Notifications Master** — quitar override `true ? jorge.calderon...` | Sí — notificaciones van al destino equivocado | ⏸️ Pausado (en pruebas) |
| 3 | **Fix Gmail RSVP** — quitar destinatario hardcodeado a `jorge.calderon...` | Sí — confirmaciones de cita no llegan a Spectrum | ⏸️ Pausado |
| 4 | **Fix SEND MEDIA** — agregar mapping de PPOL y PSB faltantes | Sí — leads piden estos proyectos y no existen | ⏸️ Pausado |
| 5 | **URLs reales SEND MEDIA** — reemplazar placeholders de PMAR y PPO | Sí — envío de media falla para esos proyectos | ⏸️ Pausado (esperando URLs) |
| 6 | **Revisar Lead Collector SOAP** — evaluar si el nodo SOAP debe seguir `disabled: true` o no | No — actualmente Sync_CRM procesa luego en batch | ⏸️ Pausado |
| 7 | **Activar Sync_CRM** — encender el workflow en n8n | Sí — sin esto no hay sincronización al CRM | ⏸️ Pausado |
| 8 | **Pruebas E2E** — flujo completo: mensaje → lead → KB → cita → CRM | Sí — validación final antes de go-live | ⏳ Pendiente |

---
> **Nota de Seguridad:** Se respeta la prohibición de modificar la configuración del nodo SOAP API fuera de la interfaz de n8n por parte del usuario.
 API fuera de la interfaz de n8n por parte del usuario.
