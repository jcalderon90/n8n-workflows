# 🏢 SPECTRUM VIVIENDA: Agente Unificado — Estado del Proyecto
> Última actualización: 2026-04-30 (Sincronización con n8n, limpieza de archivos, vectorización documentada)

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

> Los archivos locales están sincronizados con n8n. El nombre de cada archivo coincide exactamente con el nombre del workflow en el servidor.

### 1. 🧠 Orquestador Central — `AGENT PRINCIPAL.json`
**Estado: ✅ Activo en n8n**

- Clasifica intenciones y delega a sub-workflows (tools).
- Mapea nombres de proyectos a códigos oficiales en mayúsculas (`PVV`, `PPOL`, etc.).
- Modelo: `gpt-4.1-mini`.

### 2. 👤 Captador de Leads — `LEAD COLLECTOR.json`
**Estado: ✅ Activo en n8n**

- Captura nombre, correo y teléfono del lead.
- Escribe en MongoDB (`users`) y sincroniza al CRM vía SOAP.

### 3. 📚 Experto en Proyectos — `KB SEARCH.json`
**Estado: ✅ Activo en n8n** ⚠️ Pendiente vectorización

- Búsqueda vectorial en MongoDB Atlas con filtro por `proyecto`.
- Requiere que los KBs estén cargados en la colección `documents`.

### 4. 🗓️ Motor de Citas — `RSVP.json`
**Estado: ✅ Activo en n8n**

- Gestiona citas presenciales, virtuales y llamadas.
- Escribe en colección `appointments` y enriquece datos del lead.

### 5. 📤 Envío de Media — `SEND MEDIA.json`
**Estado: ✅ Activo en n8n** ⚠️ URLs placeholder en PMAR y PPO

- Envía brochures, renders y planos vía ManyChat API.
- PVV tiene URLs reales; PMAR y PPO usan URLs de prueba.

### 6. 🔔 Notificaciones — `Notifications Master.json`
**Estado: ✅ Activo en n8n** ⚠️ Gmail hardcodeado a jorge.calderon@garooinc.com

- Maneja 4 tipos de alerta: `nuevo_lead`, `interes_precios`, `cita`, `escalacion`.
- En producción debe enviar al destinatario correcto de Spectrum, no a Jorge.

### 7. 🔄 Sincronización CRM — `Sync_CRM.json`
**Estado: ⛔ INACTIVO en n8n**

- Schedule cada 10 min. Sincroniza leads maduros al CRM SOAP.
- Desactivado intencionalmente — activar solo cuando el sistema esté en producción.

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

**Workflow en n8n:** `Company-Knowledge MongoDB - CHUNKS - FILTER`
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

Los 7 workflows están activos en n8n y sincronizados localmente. El proyecto está listo para la fase de pruebas, bloqueado únicamente por la vectorización de los KBs.

### ✅ Completado
- Workflows sincronizados desde n8n al repositorio local
- Archivos renombrados para coincidir exactamente con n8n
- KBs estandarizados (5 proyectos, metadatos en mayúsculas)
- Proceso de vectorización documentado
- Archivos obsoletos eliminados (`fix_rsvp.js`, `update_principal.js`, `.claude/` vacío)

### 🔜 Pendiente antes de producción

| # | Tarea | Bloqueante |
|---|---|---|
| 1 | **Vectorizar KBs** — cargar los 5 JSONs en MongoDB `documents` | Sí — sin esto KB SEARCH no funciona |
| 2 | **Fix Gmail Notifications Master** — quitar override hardcodeado | Sí — notificaciones van al destino equivocado |
| 3 | **URLs reales SEND MEDIA** — reemplazar placeholders de PMAR y PPO | Sí — envío de media falla para esos proyectos |
| 4 | **Activar Sync_CRM** — encender el workflow en n8n | Sí — sin esto no hay sincronización al CRM |
| 5 | **Pruebas E2E** — flujo completo: mensaje → lead → KB → cita → CRM | Sí — validación final antes de go-live |

---
> **Nota de Seguridad:** Se respeta la prohibición de modificar la configuración del nodo SOAP API fuera de la interfaz de n8n por parte del usuario.
