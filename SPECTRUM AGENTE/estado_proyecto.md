# 🏢 SPECTRUM VIVIENDA: Agente Unificado — Estado del Proyecto
> Última actualización: 2026-05-11 (Implementación Multitenancy ManyChat y Saneamiento Global)

## 🎯 Objetivo General
Arquitectura de agente conversacional modular para SPECTRUM VIVIENDA. Un orquestador central (*Sof-IA*) delega tareas a sub-workflows especializados (Tools), con persistencia centralizada en MongoDB y sincronización diferida al CRM Dynamics 365 vía SOAP.

---

## 🛠️ Stack Tecnológico

| Componente | Detalle |
|---|---|
| **Orquestación** | n8n — workflows modulares vinculados via `Execute Workflow` |
| **Modelos IA** | `gpt-5-mini` (Orquestador), `gpt-4.1-mini` (Tools), `gpt-4o-mini` (Auditoría) |
| **Base de Datos** | MongoDB Atlas — colecciones `users`, `appointments`, `chat_histories`, `quality_logs`, `manychat_settings` |
| **Vector Search** | MongoDB Atlas Vector Index (`spectrum_vector_index`) — Filtrado por proyecto |
| **Buffer/Cache** | Redis — Message Debouncing (agrupa mensajes rápidos) |
| **CRM** | Dynamics 365 via SOAP (Standardized Mappings) |
| **Canales** | ManyChat (Múltiples cuentas: WhatsApp, Instagram, Messenger) |

---

## 📦 Módulos (Workflows)

### 1. 🧠 Orquestador Central — `AGENT PRINCIPAL.json`
**Estado: 🔄 En Migración a Multitenant** | Última mod: 2026-05-11

- ✅ **Completado**: Nodo `Get Account Credentials` para búsqueda dinámica de API Keys en MongoDB.
- ✅ **Completado**: Nodo `RESPOND TO MANYCHAT` convertido a dinámico (HTTP Request con Header Auth).
- ✅ **Completado**: Búsqueda de usuarios en MongoDB ahora segmentada por `manychat_id` + `page_id`.
- ⏳ **Pendiente**: Reemplazar nodos nativos de ManyChat (`Proyecto Interes` y `UTM Source`) por nodos `httpRequest` para soportar tokens dinámicos.

### 2. 👤 Captador de Leads — `Lead Collector.json`
**Estado: 🔄 En Migración a Multitenant** | Última mod: 2026-05-11

- ✅ **Completado**: Recepción de `page_id` en el trigger `START`.
- ⏳ **Pendiente**: Actualizar nodo `Update User` para incluir el campo `page_id` en la persistencia de MongoDB.

### 3. 📚 Experto en Proyectos — `KB SEARCH.json`
**Estado: ✅ Activo en n8n** | Última mod: 2026-05-09

- ✅ **Completado**: Inclusión de todos los proyectos activos (PVV, PMAR, PPO, PPOL, PSB).
- ✅ **Completado**: Vinculación de credenciales y optimización de temperatura (0.1) para precisión.

### 4. 🔔 Notificaciones y Citas — `Notifications Master.json` & `RSVP.json`
**Estado: ✅ Activo en n8n** | Última mod: 2026-05-11

- ✅ **Completado**: Fix de encoding de emojis y estandarización de tuteo.
- ⚠️ **Nota**: Estos flujos no requieren cambios de multitenancy ya que la respuesta final la da el Orquestador o no envían mensajes a ManyChat.

### 5. 🎞️ Envío de Media — `Send Media.json`
**Estado: ✅ Multitenant Ready** | Última mod: 2026-05-11

- ✅ **Completado**: Recepción de `manychat_api` como input.
- ✅ **Completado**: Nodo de envío actualizado a `httpRequest` con Header `Authorization` dinámico.

### 6. 🔄 Sincronizador CRM — `Sync_CRM.json`
**Estado: ⏳ Pendiente de Revisión** | Última mod: 2026-05-09

- ⏳ **Pendiente**: Validar que el `page_id` se incluya en los logs de auditoría para trazabilidad multi-cuenta.

---

## 🚀 Punto Actual del Proyecto

Se ha implementado el 80% de la lógica de **Multitenancy**. El bot ahora identifica de qué página de ManyChat viene el mensaje y recupera la API Key correspondiente desde la nueva colección `manychat_settings`. 

### ✅ Completado recientemente (2026-05-11)
- **Identificación de Origen:** El flujo ahora segmenta usuarios por `page_id`, permitiendo que un mismo usuario tenga perfiles distintos en WhatsApp, Instagram o diferentes cuentas de FB.
- **Respuestas Dinámicas:** La respuesta principal (`RESPOND TO MANYCHAT`) ya no depende de una credencial estática de n8n.
- **Soporte Tool Media:** El envío de brochures ya es compatible con múltiples tokens.

### 🔜 Próximos pasos (Continuar en otra PC)

| # | Tarea | Bloqueante | Estado |
|---|---|---|---|
| 1 | **Reemplazar Nodos de Actualización** — Cambiar nodos nativos de ManyChat en `AGENT PRINCIPAL` por `httpRequest` (Ver `nodos_manychat_http.json`) | Sí | ⏳ Pendiente |
| 2 | **Persistencia Page_ID** — Actualizar nodo `Update User` en `Lead Collector` para guardar el `page_id` | Sí | ⏳ Pendiente |
| 3 | **Población MongoDB** — Crear registros en `manychat_settings` para cada `page_id` activo | Sí | ⏳ Pendiente |
| 4 | **Pruebas E2E Multicuenta** — Validar flujo desde Instagram y WhatsApp simultáneamente | Sí | ⏳ Pendiente |

---
> **Nota de Seguridad:** Se ha dejado el archivo `nodos_manychat_http.json` en la raíz con el código listo para copiar/pegar en la nueva instancia de n8n.
