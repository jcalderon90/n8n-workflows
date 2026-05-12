# 🏢 SPECTRUM VIVIENDA: Agente Unificado — Estado del Proyecto
> Última actualización: 2026-05-12 (Corrección de errores en AGENT PRINCIPAL y Sync_CRM)

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
**Estado: ✅ Activo y Multitenant** | Última mod: 2026-05-12

- ✅ **Completado**: Nodo `Get Account Credentials` para búsqueda dinámica de API Keys en MongoDB.
- ✅ **Completado**: Nodo `RESPOND TO MANYCHAT` convertido a dinámico (HTTP Request con Header Auth).
- ✅ **Completado**: Búsqueda de usuarios en MongoDB ahora segmentada por `manychat_id` + `page_id`.
- ✅ **Completado**: Reemplazo de nodos nativos por `httpRequest` usando endpoint `setCustomFieldByName` para compatibilidad multitenant.
- ✅ **Completado**: Fix nodos `UPDATE - UTM Source` y `UPDATE - Proyecto Interes` — URL corregida de `setCustomField` a `setCustomFieldByName` (error `field_id cannot be blank`).

### 2. 👤 Captador de Leads — `Lead Collector.json`
**Estado: ✅ Activo y Multitenant** | Última mod: 2026-05-12

- ✅ **Completado**: Recepción de `page_id` en el trigger `START`.
- ✅ **Completado**: Actualización de nodo `Update User` para persistir el `page_id` en MongoDB.

### 3. 📚 Experto en Proyectos — `KB SEARCH.json`
**Estado: ✅ Activo en n8n** | Última mod: 2026-05-09

- ✅ **Completado**: Inclusión de todos los proyectos activos (PVV, PMAR, PPO, PPOL, PSB).
- ✅ **Completado**: Vinculación de credenciales y optimización de temperatura (0.1) para precisión.

### 4. 🔔 Notificaciones y Citas — `Notifications Master.json` & `RSVP.json`
**Estado: ✅ Activo en n8n** | Última mod: 2026-05-11

- ✅ **Completado**: Fix de encoding de emojis y estandarización de tuteo.

### 5. 🎞️ Envío de Media — `Send Media.json`
**Estado: ✅ Multitenant Ready** | Última mod: 2026-05-11

- ✅ **Completado**: Recepción de `manychat_api` como input.
- ✅ **Completado**: Nodo de envío actualizado a `httpRequest` con Header `Authorization` dinámico.

### 6. 🔄 Sincronizador CRM — `Sync_CRM.json`
**Estado: ✅ Activo y Auditado** | Última mod: 2026-05-12

- ✅ **Completado**: Inclusión de `page_id` en `quality_logs` para trazabilidad completa por cuenta.
- ✅ **Completado**: Sincronización de Custom Fields hacia ManyChat usando API Keys dinámicas.
- ✅ **Completado**: Fix nodo `Body` — eliminado salto de línea dentro de expresión `$('Loop Over Users')` que causaba `invalid syntax`.
- ✅ **Completado**: Fix nodo `UPDATE - Proyecto Interes Manychat` — migrado a `setCustomFieldByName` con `field_name` hardcodeado, eliminando dependencia de lookup dinámico de `field_id`.
- ℹ️ **Nota**: Nodo `Campos Usuario` se mantiene en el flujo (sin uso activo) para referencia futura.

### 7. 🛠️ Utilidad de Vectorización — `Vectorizar los KBs.json`
**Estado: ⚙️ En Uso (Manual)** | Última mod: 2026-05-12

- ✅ **Completado**: Estructura para carga masiva de chunks en MongoDB Atlas (`documents`).
- ✅ **Completado**: Configuración de metadatos (proyecto, categoría, tags) para búsqueda filtrada.
- ℹ️ **Nota**: Workflow de ejecución manual para actualización de base de conocimientos.

---

## 🚀 Punto Actual del Proyecto

El sistema es ahora **100% Multitenant** y ha sido verificado técnicamente (nodos de actualización migrados a `setCustomFieldByName` para evitar errores de `field_id`).

### ✅ Completado recientemente (2026-05-12)
- **Corrección de API ManyChat (AGENT PRINCIPAL):** Nodos `UPDATE - UTM Source` y `UPDATE - Proyecto Interes` migrados a `setCustomFieldByName`.
- **Corrección Sync_CRM:** Fix de syntax error en nodo `Body` y migración a `setCustomFieldByName`.
- **Sincronización de KBs:** Estandarización de nombres de archivos en documentación (`KB PPOL.json`, `KB PSB.json`).
- **Trazabilidad de Auditoría:** Los logs de calidad ahora permiten filtrar por proyecto y cuenta de origen.

### 🔜 Próximos pasos

| # | Tarea | Bloqueante | Estado |
|---|---|---|---|
| 1 | **Población MongoDB** — Crear registros en `manychat_settings` para cada `page_id` activo | Sí | ⏳ Pendiente |
| 2 | **Pruebas E2E Multicuenta** — Validar flujo desde Instagram y WhatsApp simultáneamente | Sí | ⏳ Pendiente |
| 3 | **Monitoreo inicial** — Revisar la colección `quality_logs` tras las primeras 24h | No | ⏳ Pendiente |

---
