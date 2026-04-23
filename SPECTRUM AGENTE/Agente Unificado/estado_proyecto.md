# 🏢 SPECTRUM VIVIENDA: Agente Unificado — Estado del Proyecto
> Última actualización: 2026-04-23 (Preparación para Pruebas E2E)

## 🎯 Objetivo General
Arquitectura de agente conversacional modular para SPECTRUM VIVIENDA. Un orquestador central (*Sof-IA*) delega tareas a sub-workflows especializados (Tools), con persistencia centralizada en MongoDB y sincronización diferida al CRM Dynamics 365 vía SOAP.

---

## 🛠️ Stack Tecnológico

| Componente | Detalle |
|---|---|
| **Orquestación** | n8n — workflows modulares vinculados via `Execute Workflow` |
| **Modelos IA** | `gpt-4.1-mini` (lógica principal y tools), `gpt-4o` (análisis de imágenes y audio) |
| **Base de Datos** | MongoDB Atlas — colecciones `users`, `appointments`, `chat_histories`, `chat_histories_lead`, `chat_histories_rsvp` |
| **Vector Search** | MongoDB Atlas Vector Index (`spectrum_vector_index`) — RAG por proyecto |
| **Buffer/Cache** | Redis — Message Debouncing (agrupa mensajes rápidos antes de procesar) |
| **CDN** | Cloudinary — renders, brochures, amenidades |
| **CRM** | Dynamics 365 via SOAP (endpoint: `crm.spectrum.com.gt:8055`) |
| **Canales** | ManyChat (WhatsApp, Instagram, Messenger) |
| **Notificaciones** | Gmail (HTML corporativo) vía OAuth |

---

## 📦 Módulos (Workflows)

### 1. 🧠 Orquestador Central — `Principal.json`
**Estado: ✅ Activo y funcional**

- Recibe Webhook de ManyChat, detecta tipo de entrada (texto/audio/imagen/archivo).
- Buffer Redis para agrupar mensajes rápidos del usuario.
- Consulta/crea perfil en MongoDB (`users`).
- **Agente Sof-IA** clasifica intención y delega a tools:
  - `lead_collector` — cuando faltan datos del lead
  - `kb_search` — cuando hay datos completos y proyecto activo
  - `rsvp` — cuando el usuario quiere agendar
  - `send_media` — cuando el usuario pide material visual
- **Memoria de Intención (`consulta_pendiente`):** guarda la consulta original del usuario mientras se capturan sus datos; la retoma automáticamente al completar el perfil.
- Parsea el JSON del LLM, actualiza MongoDB y envía respuesta a ManyChat.

**Cambios recientes:**
- **Reinicio de Análisis:** El nodo `DATA to UPDATE` resetea `conversation_analysis` a `false` en cada interacción, permitiendo que el flujo de sincronización detecte nuevos estados para procesar.
- **Mapeo de Intención:** Se asegura que el orquestador pase el contexto de proyecto correctamente a todas las tools.

---

### 2. 👤 Captador de Leads — `Lead Collector.json`
**Estado: ✅ Producción-Ready (Pendiente Pruebas E2E)**

- Recolecta Nombre, Correo y Teléfono de forma conversacional.
- En WhatsApp confirma el teléfono del sistema en lugar de pedirlo.
- **Mapeo de Proyecto Oficial:** Ahora traduce códigos internos (`pvv`, `pm`, `pp`) a los códigos del CRM (`PVV`, `PMAR`, `PPO`) antes del envío.
- Al completar datos: guarda `CRM_Data` en MongoDB (`users`) para sincronización diferida.
- **Nota:** El envío SOAP directo está activo para la creación inicial del lead.

---

### 3. 📚 Experto en Proyectos — `KB_Search.json`
**Estado: ✅ Activo**

- Búsqueda vectorial en MongoDB Atlas filtrando por código de proyecto (`pvv`, `pm`, `pp`).
- Responde únicamente con información del Knowledge Base (anti-alucinaciones).
- Modelo: `gpt-4.1-mini` (temperatura 0.1).

---

### 4. 🗓️ Motor de Citas — `RSVP.json`
**Estado: ✅ Activo**

- Identifica tipo de agendamiento: `cita_presencial`, `cita_virtual` o `llamada`.
- Crea/actualiza registros en colección `appointments`.
- Envía notificación HTML por correo al confirmar cita.
- Los datos de cita (`habitaciones`, `intencion`, `estado_civil`) se usan para enriquecer el CRM asíncronamente.

---

### 5. 🖼️ Entrega de Media — `Send Media.json`
**Estado: ✅ Activo e Integrado**

- Mapea solicitudes (`amenidades`, `renders`, `planos`, `brochure`) al recurso en Cloudinary según proyecto.
- Multi-canal: imagen nativa en Instagram/Facebook, link en WhatsApp.

---

### 6. 🔄 Sincronización CRM — `Sync_CRM.json`
**Estado: ✅ Producción-Ready (Pendiente Pruebas E2E)**

- Cronjob cada 10-15 minutos.
- **Lógica de Etiquetas Opcionales:** El payload SOAP ahora omite etiquetas vacías (como `_FechaCita` o `_NumeroHabitaciones`) si no hay datos, evitando errores de la API.
- **Mapeo de Catálogos CRM:** 
    - `Estado Civil`: Mapeado a `100000000-100000003`.
    - `Habitaciones`: Mapeado a `100000000-100000002`.
    - `Proyectos`: Mapeado a `PVV`, `PMAR`, `PPO`.
- **Enriquecimiento:** Incluye el `Resumen` de la conversación y las `Dudas` del cliente detectadas por la IA.
- **Audit de Calidad:** Genera logs de evaluación en la colección `quality_logs`.

---

### 7. 🔍 Auditor de Calidad — integrado en `Sync_CRM.json`
**Estado: ✅ Activo**

Evalúa la performance del agente por conversación y guarda el resultado en MongoDB.
**Colección:** `quality_logs`

---

## 📊 Modelo de Datos (MongoDB)

| Colección | Uso |
|---|---|
| `users` | Perfil del lead: datos, proyecto activo, `consulta_pendiente`, `CRM_Data`, flags |
| `appointments` | Citas agendadas: tipo, fecha, habitaciones, intención, estado_civil, contacto |
| `chat_histories` | Memoria conversacional del agente principal (ventana: 20) |
| `chat_histories_lead` | Memoria del Lead Collector (ventana: 10) |
| `chat_histories_rsvp` | Memoria del agente RSVP (ventana: 20) |
| `quality_logs` | Análisis de calidad del agente por conversación |

---

## 🚀 Roadmap

### ✅ Completado
- [x] Arquitectura modular con orquestador + tools.
- [x] Sincronización SOAP robusta con manejo de errores y etiquetas opcionales.
- [x] Mapeo de códigos de proyecto oficiales (`PVV`, `PMAR`, `PPO`).
- [x] Registro de auditoría de calidad de conversaciones.
- [x] Estandarización de modelos a `gpt-4.1-mini`.

### 🔜 Pendiente (Pruebas Mañana)
- [ ] Prueba E2E: Lead nuevo -> Lead Collector -> CRM Creation.
- [ ] Prueba E2E: Conversación -> Inactividad 15min -> Sync_CRM Enrichment.
- [ ] Prueba E2E: Agendamiento Cita -> Sync_CRM Data Update.
- [ ] Validar URLs reales de Cloudinary para renders/planos.
