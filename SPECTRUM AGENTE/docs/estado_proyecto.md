# 🏢 SPECTRUM VIVIENDA: Agente Unificado — Estado del Proyecto
> Última actualización: 2026-05-13 (Post-reunión de equipo — Asignación dinámica de proyecto por canal)

## 🎯 Objetivo General
Arquitectura de agente conversacional modular para SPECTRUM VIVIENDA. Un orquestador central (*Sof-IA*) delega tareas a sub-workflows especializados (Tools), con persistencia centralizada en MongoDB y sincronización diferida al CRM Dynamics 365 vía SOAP.

---

## 🛠️ Stack Tecnológico

| Componente | Detalle |
|---|---|
| **Orquestación** | n8n — workflows modulares vinculados via `Execute Workflow` |
| **Modelos IA** | `gpt-5-mini` (Orquestador), `gpt-4.1-mini` (Tools), `gpt-4o-mini` (Auditoría) |
| **Base de Datos** | MongoDB Atlas — colecciones `users`, `appointments`, `chat_histories`, `quality_logs`, `manychat_settings`, `analytics_logs` |
| **Vector Search** | MongoDB Atlas Vector Index (`spectrum_vector_index`) — Filtrado por proyecto |
| **Buffer/Cache** | Redis — Message Debouncing (agrupa mensajes rápidos) |
| **CRM** | Dynamics 365 via SOAP (Standardized Mappings) |
| **Canales** | ManyChat (6 cuentas: PVV, PMAR, PPO, PPOL, PSB + GAROO) |

---

## 📦 Módulos (Workflows)

### 1. 🧠 Orquestador Central — `AGENT PRINCIPAL.json`
**Estado: ✅ Activo — Multitenant con routing por canal** | Última mod: 2026-05-13

- ✅ **Completado**: Sincronización paramétrica con servidor (expresiones =URL y variables de input).
- ✅ **Completado**: Búsqueda de usuarios segmentada por `manychat_id` + `page_id`.
- ✅ **Completado**: Reemplazo de nodos nativos por `httpRequest` usando `setCustomFieldByName`.
- ✅ **Completado**: Asignación dinámica de proyecto por `page_id` para Instagram/Messenger.
- ✅ **Completado**: "Regla de Oro" (pregunta de proyecto) solo se aplica en WhatsApp.
- ✅ **Completado**: Nodo `CONTEXT 1` prioriza `Get Account Credentials → proyecto` para canales no-WhatsApp.

### 2. 👤 Captador de Leads — `Lead Collector.json`
**Estado: ✅ Activo y Auditado al 100%** | Última mod: 2026-05-13

- ✅ **Completado**: Implementación de controles defensivos para inputs nulos en la lógica de nombres (e.g. `($json.nombre || '').split(" ")[0]`).
- ✅ **Completado**: Recepción y persistencia de `page_id` en MongoDB.

### 3. 📚 Experto en Proyectos — `KB SEARCH.json`
**Estado: ✅ Activo y Auditado al 100%** | Última mod: 2026-05-13

- ✅ **Completado**: Inclusión de todos los proyectos activos (PVV, PMAR, PPO, PPOL, PSB).

### 4. 🔔 Notificaciones y Citas — `Notifications Master.json` & `RSVP.json`
**Estado: ✅ Activo y Auditado al 100%** | Última mod: 2026-05-13

### 5. 🎞️ Envío de Media — `Send Media.json`
**Estado: ✅ Activo y Auditado al 100%** | Última mod: 2026-05-13

### 6. 🔄 Sincronizador CRM — `Sync_CRM.json`
**Estado: ✅ Activo y Auditado al 100%** | Última mod: 2026-05-13

- ✅ **Completado**: Homologación con el servidor de la propiedad `temperature: 0.3` en OpenAI.
- ✅ **Completado**: Fix nodo `UPDATE - Proyecto Interes Manychat` — migrado a `setCustomFieldByName`.
- ⏳ **Pendiente**: Mejorar resúmenes para incluir presupuesto, tipo de unidad y requisitos del lead.
- ⏳ **Pendiente**: Poblar campo `_UTMCampaing` con formato `"Chatbot - [medio]"`.

### 7. 🛠️ Utilidad de Vectorización — `Vectorizar los KBs.json`
**Estado: ✅ Auditado al 100% (ID: LLiVnT0M6xvDKive)** | Última mod: 2026-05-13

- ✅ **Completado**: Verificación de correspondencia con flujo remoto en n8n a través de MCP.

---

## 🏗️ Infraestructura Multitenant

### Cuentas ManyChat configuradas (`manychat_settings`)

| Cuenta | `page_id` | `proyecto` | Tráfico aprobado |
|---|---|---|---|
| PVV | `113631858496836` | `PVV` | ⏳ Pendiente |
| PMAR | `576411852216119` | `PMAR` | ✅ Aprobado |
| PPO | `113179411695050` | `PPO` | ⏳ Pendiente |
| PPOL | `4901825` | `PPOL` | ⏳ Pendiente |
| PSB | `497971190077209` | `PSB` | ⏳ Pendiente |
| GAROO | `962079940550460` | — | N/A (interno) |

> **Nota:** Solo Parque Mariscal (PMAR) tiene tráfico aprobado al chatbot por decisión de Harim. Sotobosque y Polanco son los próximos en la cola de lanzamiento.

---

## 🚀 Punto Actual del Proyecto

El sistema es **100% Multitenant**, con **routing dinámico por canal** y ha sido **validado en producción** con paridad total entre local y servidor.

### ✅ Completado recientemente (2026-05-13)
- **Auditoría MCP Paridad Total:** 100% de paridad local ↔ producción en `agentsprod.redtec.ai`.
- **Reestructuración "AI-Ready":** Repositorio organizado — docs en `/docs`, herramientas en `/scripts`.
- **Integración MCP:** Directorio de IDs y configuraciones MCP en `GEMINI.md`.
- **Población `manychat_settings`:** 6 cuentas registradas con `page_id`, `api_key` y `proyecto`.
- **Routing por canal:** Instagram/Messenger asignan proyecto automáticamente vía `page_id`; WhatsApp mantiene la Regla de Oro interactiva.
- **Publicación a producción:** Workflow publicado y activo con `activeVersionId` sincronizado.

---

## 🔜 Próximos Pasos (Post-reunión 2026-05-13)

### 🔴 P1 — Inmediato (esta semana)

| # | Tarea | Responsable | Estado |
|---|---|---|---|
| 1 | **Mejorar resúmenes Sync_CRM** — Incluir presupuesto, tipo de unidad, requisitos | Jorge | ⏳ Pendiente |
| 2 | **Mapeo UTM Campaign** — Poblar `_UTMCampaing` con `"Chatbot - [medio]"` | Jorge | ⏳ Pendiente |

### 🟡 P2 — Corto plazo (1-2 semanas)

| # | Tarea | Responsable | Bloqueante |
|---|---|---|---|
| 3 | **Webhook formulario citas web** — Endpoint para recibir datos de cita desde Tribal | Jorge + Tribal | Tribal entregue form actualizado |
| 4 | **Templates prellenados por fuente** — Textos específicos para QR/web/anuncios | Jorge + Dayrin + Normita | Dayrin entregue URLs |
| 5 | **Lanzamiento Sotobosque/Polanco** — Activar routing cuando Harim apruebe | Jorge + Harim | Aprobación de tráfico |

### 🟢 P3 — Mediano plazo (2-4 semanas)

| # | Tarea | Responsable | Bloqueante |
|---|---|---|---|
| 6 | **Investigar Zapier → CRM** — Evaluar como alternativa al SOAP web service | Jorge + Tribal | Sesión de capacitación Tribal |
| 7 | **Auditoría campos CRM** — Crear campos dedicados (presupuesto, tipo unidad, etc.) | Andy + Jorge | Resultado investigación Zapier |

### 🔵 P4 — Continuo

| # | Tarea | Responsable |
|---|---|---|
| 8 | **QA diario de conversaciones** — Andy revisa calidad y datos al CRM | Andy |
| 9 | **Monitoreo `analytics_logs`** — Tiempos de respuesta y acciones del orquestador | Jorge |

---

## 👥 Equipo

| Persona | Rol |
|---|---|
| **Harim** | Director del proyecto — aprobaciones de tráfico y estrategia |
| **Jorge** | Implementación técnica — chatbot, workflows, integraciones |
| **Andy** | QA + administración CRM — crea campos, revisa conversaciones |
| **Dayrin** | Marketing — URLs de campañas, contenido |
| **Normita** | Operaciones — generación de QR codes |
| **Tribal** | Agencia — formulario web, integración Zapier |

---
