# 🏢 SPECTRUM VIVIENDA: Agente Unificado — Estado del Proyecto
> Última actualización: 2026-05-13 (Sesión de mantenimiento — Split nombre/apellido, URLs rotas Send Media, notificaciones Andy)

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
**Estado: ✅ Activo — Optimización "Hot Lead" implementada** | Última mod: 2026-05-13

- ✅ **Completado**: Sincronización paramétrica con servidor (expresiones =URL y variables de input).
- ✅ **Completado**: Búsqueda de usuarios segmentada por `manychat_id` + `page_id`.
- ✅ **Completado**: Reemplazo de nodos nativos por `httpRequest` usando `setCustomFieldByName`.
- ✅ **Completado**: Asignación dinámica de proyecto por `page_id` para Instagram/Messenger.
- ✅ **Completado**: "Regla de Oro" (pregunta de proyecto) solo se aplica en WhatsApp — corregido en system prompt + `manychat_settings` MongoDB.
- ✅ **Completado**: Nodo `CONTEXT 1` prioriza `Get Account Credentials → proyecto` para canales no-WhatsApp.
- ✅ **Completado**: Fix bug Instagram/Messenger — bot ya no pregunta "¿cuál proyecto?" cuando el canal pre-asigna el proyecto.
- ✅ **Completado**: **Optimización de Conversión (Hot Leads):** Se eliminó el saludo genérico para mensajes de alta intención, delegando inmediatamente al `lead_collector` para acelerar el embudo.

### 2. 👤 Captador de Leads — `Lead Collector.json`
**Estado: ✅ Activo** | Última mod: 2026-05-13

- ✅ **Completado**: Implementación de controles defensivos para inputs nulos en la lógica de nombres.
- ✅ **Completado**: Recepción y persistencia de `page_id` en MongoDB.
- ✅ **Completado**: **Split inteligente de nombre** — Lead Agent extrae `primer_nombre` y `apellidos` por separado. Se persisten en MongoDB y se usan directamente en el XML SOAP (`_Nombre`, `_Apellido`), resolviendo apellidos compuestos y combinaciones de 2 nombres + 2 apellidos.

### 3. 📚 Experto en Proyectos — `KB SEARCH.json`
**Estado: ✅ Activo y Auditado al 100%** | Última mod: 2026-05-13

- ✅ **Completado**: Inclusión de todos los proyectos activos (PVV, PMAR, PPO, PPOL, PSB).

### 4. 🔔 Notificaciones y Citas — `Notifications Master.json` & `RSVP.json`
**Estado: ✅ Activo y Auditado al 100%** | Última mod: 2026-05-13

- ✅ **Completado**: Agregado `aduarte@spectrum.com.gt` (Andy Duarte) como destinatario CC en los 4 tipos de alerta: Nuevo Lead, Interés en Precios, Nueva Cita y Escalación.

### 5. 🎞️ Envío de Media — `Send Media.json`
**Estado: ✅ Activo y Auditado al 100%** | Última mod: 2026-05-13

- ✅ **Completado**: URLs de prueba (`link-de-prueba.com`) reemplazadas por `null` en los 5 proyectos. Solo PVV/amenidades tiene URL real activa.
- ✅ **Completado**: Lógica de fallback para media no disponible — nodo `IF Media Disponible` bifurca el flujo: si no hay URL, el agente ofrece al usuario 3 alternativas (asesor personal, visita a sala de ventas, llamada).
- ⏳ **Pendiente**: Reemplazar `null` con las URLs reales cuando los archivos de brochures/renders/planos estén listos por proyecto.

### 6. 🔄 Sincronizador CRM — `Sync_CRM.json`
**Estado: ✅ Activo** | Última mod: 2026-05-13

- ✅ **Completado**: Homologación con el servidor de la propiedad `temperature: 0.3` en OpenAI.
- ✅ **Completado**: Fix nodo `UPDATE - Proyecto Interes Manychat` — migrado a `setCustomFieldByName`.
- ✅ **Completado**: **Tracking Multicanal:** Implementada lógica para detectar leads provenientes de FB Messenger e Instagram y asignarles por defecto el tag "Social Media" y medio "Redes sociales Orgánico".
- ✅ **Completado**: Mejorar resúmenes para incluir presupuesto, tipo de unidad y requisitos del lead.
- ✅ **Completado**: Poblar campo `_UTMCampaing` con formato `"Cliente atendido desde chatbot a través de [medio]"`.
- ✅ **Completado**: Fix `_Nombre`/`_Apellido` — Body XML usa `primer_nombre`/`apellidos` con fallback al split de `nombre`.
- ⏳ **Pendiente**: **QA Sincronización:** Validar con equipo CRM/Andy que el campo `_UTMCampaing` se está reflejando correctamente en la base de datos de producción con el nuevo formato estricto tras las siguientes ejecuciones.

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
- **Split inteligente de nombre/apellido:** El Lead Agent extrae `primer_nombre` y `apellidos` por separado vía LLM. Propagado en `Lead Collector`, `AGENT PRINCIPAL` y `Sync_CRM`. Resuelve apellidos compuestos (ej. "García López") y combinaciones de 2 nombres + 2 apellidos en el XML SOAP.
- **Fix URLs rotas Send Media:** URLs placeholder eliminadas, reemplazadas por `null`. IF branching implementado: si no hay archivo disponible, el agente ofrece 3 alternativas al usuario (asesor, cita presencial, llamada).
- **Notificaciones Andy Duarte:** `aduarte@spectrum.com.gt` agregado como destinatario CC en los 4 tipos de alerta del `Notifications Master`.
- **Auditoría MCP Paridad Total:** 100% de paridad local ↔ producción en `agentsprod.redtec.ai`.
- **Reestructuración "AI-Ready":** Repositorio organizado — docs en `/docs`, herramientas en `/scripts`.
- **Integración MCP:** Directorio de IDs y configuraciones MCP en `GEMINI.md`.
- **Población `manychat_settings`:** 6 cuentas registradas con `page_id`, `api_key` y `proyecto`.
- **Routing por canal:** Instagram/Messenger asignan proyecto automáticamente vía `page_id`; WhatsApp mantiene la Regla de Oro interactiva.
- **Bypass de Saludo para Leads Calientes:** Reducción de fricción al detectar interés inmediato, saltando el saludo de Sof-IA y activando extracción de datos directa.
- **Migración a n8n Workflow SDK:** Core workflows (`AGENT PRINCIPAL`, `Lead Collector`, `Sync_CRM`) migrados al formato SDK en producción para mayor robustez, control de versiones y despliegue programático.
- **Fix bug Instagram/Messenger:** Corregidos dos puntos — `manychat_settings` con `proyecto` por `page_id` + system prompt de Sof-IA con condición de canal para la Regla de Oro. Bot ya no pregunta "¿cuál proyecto?" en IG/Messenger.
- **Verificación tareas P1:** Confirmado en código que resúmenes Sync_CRM (Presupuesto, Dormitorios, Requisitos, Resumen, Dudas) y `_UTMCampaing` están completamente implementados.
- **Templates prellenados por fuente:** CSV de URLs entregado por Dayrin. Verificado que `Extraer CAMPAIGN DATA` detecta correctamente los 6 tipos de fuente × 5 proyectos. Parte técnica completa.

---

## 🔜 Próximos Pasos (Post-reunión 2026-05-13)

### 🔴 P1 — Inmediato ✅ Cerrado

| # | Tarea | Responsable | Estado |
|---|---|---|---|
| 1 | **Mejorar resúmenes Sync_CRM** — Incluir presupuesto, tipo de unidad, requisitos | Jorge | ✅ Completado |
| 2 | **Mapeo UTM Campaign** — Poblar `_UTMCampaing` con `"Cliente atendido desde chatbot a través de [medio]"` | Jorge | ✅ Completado |
| 3 | **Fix canal Instagram/Messenger** — Bot no debe preguntar proyecto en IG/Messenger | Jorge | ✅ Completado |

### 🟡 P2 — Corto plazo (1-2 semanas)

| # | Tarea | Responsable | Bloqueante |
|---|---|---|---|
| 3 | **Webhook formulario citas web** — Endpoint para recibir datos de cita desde Tribal | Jorge + Tribal | Tribal entregue form actualizado |
| 4 | **Templates prellenados por fuente** — Textos específicos para QR/web/anuncios | Jorge + Dayrin + Normita | ✅ Técnico completo. Pendiente: Dayrin embebe URLs en materiales, Normita genera QR codes |
| 5 | **URLs media por proyecto** — Subir brochures/renders/planos y llenar `null` en `Send Media.json` | Jorge + Dayrin | Archivos listos por proyecto |
| 6 | **Lanzamiento Sotobosque/Polanco** — Activar routing cuando Harim apruebe | Jorge + Harim | Aprobación de tráfico |

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
| **Andy Duarte** (`aduarte@spectrum.com.gt`) | QA + administración CRM — crea campos, revisa conversaciones, recibe todas las alertas del chatbot |
| **Dayrin** | Marketing — URLs de campañas, contenido |
| **Normita** | Operaciones — generación de QR codes |
| **Tribal** | Agencia — formulario web, integración Zapier |

---
