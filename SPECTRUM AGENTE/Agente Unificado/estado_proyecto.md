# 🏢 SPECTRUM VIVIENDA: Agente Unificado — Estado del Proyecto
> Última actualización: 2026-04-22

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
- REGLA RETOMO CASO A reforzada: el agente genera su propia respuesta conectando con `consulta_pendiente` en lugar de copiar el mensaje del `lead_collector`.
- Capitalización automática del nombre del lead en mensajes.

---

### 2. 👤 Captador de Leads — `Lead Collector.json`
**Estado: ✅ Activo**

- Recolecta Nombre, Correo y Teléfono de forma conversacional.
- En WhatsApp confirma el teléfono del sistema en lugar de pedirlo.
- Validación de formato de correo electrónico.
- Al completar datos: guarda `CRM_Data` en MongoDB (`users`) para sincronización diferida.
- **Nota:** El nodo de envío SOAP directo (`GENERAR LEAD CONTACT`) está **deshabilitado**. El CRM se alimenta exclusivamente vía `Sync_CRM.json`.
- Memoria conversacional: colección `chat_histories_lead` (ventana: 10 mensajes).

---

### 3. 📚 Experto en Proyectos — `KB_Search.json`
**Estado: ✅ Activo — mejorado hoy**

- Búsqueda vectorial en MongoDB Atlas filtrando por código de proyecto (`pvv`, `pm`, `pp`).
- Responde únicamente con información del Knowledge Base (anti-alucinaciones).
- Modelo: `gpt-4.1-mini` (temperatura 0.1).

**Cambios recientes:**
- CTAs actualizados: presentan las 3 opciones directamente (presencial/virtual/llamada) en lugar de preguntas sí/no ambiguas.
- Formato de amenidades: instrucción explícita de lista vertical con bullet `•` (prohibido colapsar en línea).
- Eliminado el bloque hardcodeado "Usuario acepta el CTA" que cortocircuitaba el RSVP.

---

### 4. 🗓️ Motor de Citas — `RSVP.json`
**Estado: ✅ Activo — mejorado hoy**

- Identifica tipo de agendamiento: `cita_presencial`, `cita_virtual` o `llamada`.
- Si el usuario pide llamada, ofrece primero la opción de cita virtual.
- Recolección secuencial (un dato por mensaje).
- Crea/actualiza registros en colección `appointments`.
- Envía notificación HTML por correo al confirmar cita.
- Memoria conversacional: colección `chat_histories_rsvp` (ventana: 20 mensajes).

**Orden de recolección (cita_presencial / cita_virtual):**
1. `fecha_hora` → ISO 8601, lunes–sábado 9:00–18:00
2. `numero_habitaciones` → 1, 2 o 3
3. `intencion_compra` → Vivir (V) / Invertir (I)
4. `estado_civil` → Pregunta: *"¿Vivirías solo/a o lo compartirías con alguien?"*
5. `metodo_contacto_pref` → correo / llamada / WhatsApp

**Cambios recientes:**
- `estado_civil` ahora se pregunta explícitamente (antes solo por inferencia).
- Mensaje de cierre post-cita incluye el canal de contacto elegido y próximos pasos.

---

### 5. 🖼️ Entrega de Media — `Send Media.json`
**Estado: ✅ Activo — simplificado hoy**

- Mapea solicitudes (`amenidades`, `renders`, `planos`, `brochure`) al recurso en Cloudinary según proyecto.
- Multi-canal: imagen nativa en Instagram/Facebook, link en WhatsApp.
- Nodo START renombrado de `START Send Media` a `START` (estandarizado).

**Estado de URLs por proyecto:**
| Proyecto | amenidades | renders | planos | brochure |
|---|---|---|---|---|
| PVV (Vista Verde) | ✅ Cloudinary real | ⚠️ Placeholder | ⚠️ Placeholder | ⚠️ Placeholder |
| PMAR (Mariscal) | ⚠️ Placeholder | ⚠️ Placeholder | ⚠️ Placeholder | ⚠️ Placeholder |
| PPO (Portales) | ⚠️ Placeholder | ⚠️ Placeholder | ⚠️ Placeholder | ⚠️ Placeholder |

---

### 6. 🔄 Sincronización CRM — `Sync_CRM.json`
**Estado: ✅ Activo — SOAP habilitado**

- Cronjob cada 15 minutos.
- Filtra usuarios con `CRM_Data` existente, `conversation_analysis: false` e inactivos por 15+ min.
- Genera `Resumen` y `Dudas` de la conversación con LLM.
- Guarda resumen en MongoDB (`conversation_ressume`).
- Construye envelope SOAP con datos de `CRM_Data` y envía al endpoint de Spectrum.
- Marca `conversation_analysis: true` al finalizar (evita reprocesamiento).
- Después del SOAP lanza el **Quality Auditor** para análisis de calidad del agente.

**Flujo final (secuencial):**
```
Schedule → Time-15min → Find Users to Sync → Loop Over Users
  → Find Appointment → Manychat User ID
  → Chat Lead / Chat RSVP / Chat (paralelo) → LEAD / RSVP / PRINCIPAL
  → Merge → Aggregate → Messages → Information Extractor
  → EXTRACTOR RESPONSE → Update Conversation Analysis
  → Body → PARSE BODY → GENERAR LEAD CONTACT → XML BODY
  → Quality Auditor → Build Quality Log → Insert quality_logs
  → No Operation → Loop Over Users
```

**⚠️ Pendiente confirmar:** URL del endpoint (`crm.spectrum.com.gt:8055`) sin sufijo `_Dev`. Validar con Spectrum que es el endpoint productivo.

---

### 7. 🔍 Auditor de Calidad — integrado en `Sync_CRM.json`
**Estado: ✅ Activo (nuevo)**

Corre **después del SOAP** al final de cada ciclo de sincronización. Evalúa la performance del agente por conversación y guarda el resultado en MongoDB.

**Colección:** `quality_logs`

| Campo | Descripción |
|---|---|
| `manychat_id` | ID del usuario analizado |
| `nombre` / `proyecto` | Datos del lead |
| `fecha_analisis` | Timestamp del análisis |
| `resumen_conversacion` | Resumen generado por el Information Extractor |
| `funnel_stage` | Etapa donde quedó el lead (nuevo/identificado/consultando/en_rsvp/cita_confirmada/escalado) |
| `intencion_detectada` | Qué buscaba el usuario |
| `tools_correctas` | Evaluación del uso de tools |
| `errores_detectados` | Errores de lógica del agente |
| `oportunidades_perdidas` | Conversiones no realizadas |
| `tono_agente` | Tono de las respuestas |
| `puntuacion` | Score 1–10 |
| `recomendacion` | Sugerencia accionable para el desarrollador |

**Query de consulta para el desarrollador:**
```js
db.quality_logs.find().sort({ fecha_analisis: -1 }).limit(10)
```

---

### 8. 🚨 Notificador — `Notifications.json`
**Estado: ✅ Activo**

- Enrutador de alertas para el equipo de ventas.
- Tipos: Nuevo Lead, Interés en Precios, Cita Confirmada, Escalación Humana.
- Genera correos HTML con diseño corporativo (datos del lead + contexto).

---

### 9. ↗️ Escalación — `escalation.json`
**Estado: ⚠️ Presente — no documentado aún**

- Archivo detectado en el directorio pero no revisado en detalle.
- Pendiente: revisar función, conexiones y si está integrado al flujo principal.

---

## 📊 Modelo de Datos (MongoDB)

| Colección | Uso |
|---|---|
| `users` | Perfil del lead: datos, proyecto activo, `consulta_pendiente`, `CRM_Data`, flags |
| `appointments` | Citas agendadas: tipo, fecha, habitaciones, intención, estado_civil, contacto |
| `chat_histories` | Memoria conversacional del agente principal (ventana: 20) |
| `chat_histories_lead` | Memoria del Lead Collector (ventana: 10) |
| `chat_histories_rsvp` | Memoria del agente RSVP (ventana: 20) |
| `documents` | Vector Store para RAG (filtrado por campo `proyecto`) |
| `quality_logs` | Análisis de calidad del agente por conversación (nuevo) |

---

## 🔑 Credenciales en uso

| Credential | Usado en |
|---|---|
| `Spectrum - Parque Verde` | Lead Collector, KB_Search, Sync_CRM, RSVP |
| `Spectrum - Parque Portales` | Principal (LLM extractors) |
| `Vectorizer Agent - Knowledge Bases` | KB_Search (embeddings) |
| `SPECTRUM - CENTRALIZADO` | MongoDB (todos los módulos) |
| `Manychat` | Principal (respuestas y media) |
| `Redis GarooVPS` | Principal (buffer) |
| `Soporte Garoo` | RSVP (Gmail) |

---

## 🚀 Roadmap

### ✅ Completado
- [x] Arquitectura modular con orquestador + tools
- [x] Memoria de intención (`consulta_pendiente`)
- [x] Buffer Redis para mensajes rápidos
- [x] RSVP con persistencia en MongoDB y notificación por correo
- [x] RAG vectorial por proyecto
- [x] Sincronización SOAP al CRM (Sync_CRM activo)
- [x] `estado_civil` recolectado en flujo RSVP
- [x] CTAs mejorados en KB_Search (3 opciones claras: presencial/virtual/llamada)
- [x] Formato vertical de amenidades (bullet `•` por ítem)
- [x] REGLA RETOMO: bot conecta confirmación de datos con consulta original
- [x] Mensaje de cierre post-cita incluye canal de contacto y próximos pasos
- [x] Capitalización automática del nombre del lead
- [x] **Auditor de Calidad** por conversación → colección `quality_logs` en MongoDB

### 🔜 Pendiente
- [ ] Cargar URLs reales en `Send Media.json` para PMAR y PPO (renders, planos, brochure)
- [ ] Confirmar URL productiva del endpoint SOAP con Spectrum (sin `_Dev`)
- [ ] Documentar y conectar `escalation.json` al flujo principal si aplica
- [ ] Prueba end-to-end del flujo completo con los cambios de hoy
- [ ] Web Search Fallback (Tavily/Perplexity) para dudas macroeconómicas
- [ ] Lógica de Memoria de Largo Plazo entre sesiones
- [ ] Dashboard o query estándar para consultar `quality_logs` (Power BI / Metabase)
