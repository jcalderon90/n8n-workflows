# 🏢 SPECTRUM VIVIENDA: Agente Unificado — Estado del Proyecto
> Última actualización: 2026-05-09 (Optimización UTMs CRM, Integración ManyChat y Saneamiento Global)

## 🎯 Objetivo General
Arquitectura de agente conversacional modular para SPECTRUM VIVIENDA. Un orquestador central (*Sof-IA*) delega tareas a sub-workflows especializados (Tools), con persistencia centralizada en MongoDB y sincronización diferida al CRM Dynamics 365 vía SOAP.

---

## 🛠️ Stack Tecnológico

| Componente | Detalle |
|---|---|
| **Orquestación** | n8n — workflows modulares vinculados via `Execute Workflow` |
| **Modelos IA** | `gpt-5-mini` (Orquestador), `gpt-4.1-mini` (Tools), `gpt-4o-mini` (Auditoría) |
| **Base de Datos** | MongoDB Atlas — colecciones `users`, `appointments`, `chat_histories`, `quality_logs` |
| **Vector Search** | MongoDB Atlas Vector Index (`spectrum_vector_index`) — Filtrado por proyecto |
| **Buffer/Cache** | Redis — Message Debouncing (agrupa mensajes rápidos) |
| **CRM** | Dynamics 365 via SOAP (Standardized Mappings) |
| **Canales** | ManyChat (WhatsApp, Instagram, Messenger) |

---

## 📦 Módulos (Workflows)

### 1. 🧠 Orquestador Central — `AGENT PRINCIPAL.json`
**Estado: ✅ Activo en n8n** | Última mod: 2026-05-09

- ✅ **Completado**: Implementación de **UTM Tracking** vía nodo `Extraer CAMPAIGN DATA`.
- ✅ **Completado**: Sincronización automática a ManyChat de `proyecto_interes` y `proyecto_utm_source`.
- ✅ **Completado**: Limpieza estructural y encadenamiento de nodos de actualización de leads.
- ✅ **Completado**: Jerarquía de proyectos establecida y estandarización a **tuteo**.

### 2. 👤 Captador de Leads — `Lead Collector.json`
**Estado: ✅ Activo en n8n** | Última mod: 2026-05-09

- ✅ **Completado**: Estandarización de **tuteo** ("identificá", "usá") para coherencia regional.
- ✅ **Completado**: Vinculación de credenciales de MongoDB y OpenAI.

### 3. 📚 Experto en Proyectos — `KB SEARCH.json`
**Estado: ✅ Activo en n8n** | Última mod: 2026-05-09

- ✅ **Completado**: Inclusión de todos los proyectos activos (PVV, PMAR, PPO, PPOL, PSB).
- ✅ **Completado**: Vinculación de credenciales y optimización de temperatura (0.1) para precisión.

### 4. 🔔 Notificaciones y Citas — `Notifications Master.json` & `RSVP.json`
**Estado: ✅ Activo en n8n** | Última mod: 2026-05-09

- ✅ **Completado**: Fix de **encoding de emojis** en correos (fuego, calendario, etc.).
- ✅ **Completado**: Estandarización de remitente a "Soporte RedTec" y vinculación de Gmail OAuth2.
- ✅ **Completado**: Tuteo en el flujo de agendamiento de citas.
- ✅ **Completado**: Implementación de regla estricta: El bot delega el envío de enlaces de reuniones virtuales al asesor humano.

### 5. 🔄 Sincronizador CRM — `Sync_CRM.json`
**Estado: ✅ Activo en n8n** | Última mod: 2026-05-09

- ✅ **Completado**: Lógica de propagación de UTMs robusta (prioriza raíz del usuario).
- ✅ **Completado**: Actualización de modelo de auditoría a `gpt-4o-mini`.

---

## 🚀 Punto Actual del Proyecto

El ecosistema está técnicamente finalizado. Se han resuelto las discrepancias de datos entre el orquestador y el sincronizador CRM. Las notificaciones internas están saneadas y el tono de voz es consistente en todos los puntos de contacto.

### ✅ Completado recientemente (2026-05-09)
- **Integración ManyChat-CRM:** El bot ahora inyecta datos directamente en los campos personalizados de ManyChat para seguimiento en vivo.
- **Resiliencia de Datos:** Los UTMs fluyen correctamente desde el primer mensaje hasta el XML de la SOAP API.
- **Matriz de Campañas:** Se validó y configuró la detección de orígenes (Web, City Core, Social Media, Fan Page, Mail, Bancos) basada en la matriz de marketing.
- **Saneamiento Visual:** Corrección de caracteres especiales y mejora de la legibilidad en notificaciones HTML.
- **Infraestructura:** Vinculación exitosa de credenciales de MongoDB, OpenAI y Gmail OAuth2 en todos los nodos.

### 🔜 Pendiente para Testing / Producción

| # | Tarea | Bloqueante | Estado |
|---|---|---|---|
| 1 | **Pruebas E2E** — Validar flujo completo desde link de WhatsApp hasta creación en CRM | Sí | ⏳ Pendiente |
| 2 | **URLs reales SEND MEDIA** — Cargar enlaces oficiales para Polanco y Sotobosque | No | ⏳ Esperando Assets |
| 3 | **Validación de Auditoría** — Revisar logs en `quality_logs` tras las primeras interacciones reales | No | ⏳ Pendiente |
| 4 | **Estrategia Multimedia** — Implementar envío de videos e imágenes en `Send Media.json` | No | ⏳ Planificando |



---
> **Nota de Seguridad:** Se respeta la prohibición de modificar la configuración del nodo SOAP API fuera de la interfaz de n8n por parte del usuario.
