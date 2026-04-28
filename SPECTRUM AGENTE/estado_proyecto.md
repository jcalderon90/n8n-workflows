# 🏢 SPECTRUM VIVIENDA: Agente Unificado — Estado del Proyecto
> Última actualización: 2026-04-27 (Post-Estandarización y Preparación de KB)

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

### 1. 🧠 Orquestador Central — `Principal.json`
**Estado: ✅ Optimizado y Corregido**

- **Sof-IA Prompt:** Se corrigió el mapeo de intención para usar códigos en **MAYÚSCULAS**.
- **Fix JSON:** Corregido error de sintaxis en el esquema de salida del bot (`estado_proyecto`).
- **Limpieza de Tools:** Eliminada duplicidad de `send_media`.
- **Lógica de Mapeo:** Traduce automáticamente nombres de proyectos (Vista Verde, Polanco, etc.) a sus códigos oficiales (`PVV`, `PPOL`, etc.).

### 2. 👤 Captador de Leads — `Lead Collector.json`
**Estado: ✅ Validado**

- Envío de datos a Dynamics 365 respetando el nodo SOAP manual.
- Mapeo directo del campo `proyecto` recibido del orquestador.

### 3. 📚 Experto en Proyectos — `KB_Search.json`
**Estado: ✅ Alineado con RAG**

- Filtrado por metadato `proyecto` en uppercase.
- Reglas estrictas de no-alucinación basadas en el contexto recuperado.

### 4. 🗓️ Motor de Citas — `RSVP.json`
**Estado: ✅ Operativo**

- Captura de datos de agendamiento y guardado en `appointments`.
- Enriquecimiento de CRM detectando intención de compra y estado civil.

### 5. 🔄 Sincronización CRM — `Sync_CRM.json`
**Estado: ✅ Robusto**

- Manejo de etiquetas XML opcionales para evitar errores de SOAP API.
- Actualización de flags en MongoDB para evitar duplicidad de análisis (`conversation_analysis`).

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

## 🚀 Punto Actual del Proyecto
El proyecto se encuentra en el **punto de cierre técnico**. La lógica está 100% alineada entre el Orquestador, las Tools y los archivos de datos.

### 🔜 Acciones Inmediatas (Manuales)
1.  **Vectorización:** Cargar los 5 archivos JSON en la colección `documents` de MongoDB Atlas.
2.  **Limpieza:** Vaciar datos viejos de `documents` antes de la nueva carga.
3.  **Pruebas E2E:** Validar flujo completo: *Consulta -> Captura de Datos -> Respuesta KB -> Sincronización CRM.*

---
> **Nota de Seguridad:** Se respeta la prohibición de modificar la configuración del nodo SOAP API fuera de la interfaz de n8n por parte del usuario.
