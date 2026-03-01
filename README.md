# 🚀 Colección de Workflows n8n

Este repositorio es una biblioteca de flujos de trabajo (**n8n workflows**) diseñados para automatizar diversos procesos operativos, contables y de inteligencia artificial. Cada archivo `.json` representa un flujo independiente o parte de un proyecto específico.

---

## 📂 Estructura del Repositorio

Los flujos están organizados de la siguiente manera:

1. **Archivos en la raíz:** Flujos independientes y herramientas generales.
2. **Carpetas:** Proyectos consolidados que comprenden múltiples flujos interconectados.

---

## 🛠️ Flujos Independientes (Raíz)

### 🏠 AI Agent v4.json
**Objetivo:** Agente conversacional de ventas para el proyecto inmobiliario *Parque Vista Verde* (Z15, Guatemala).

**Qué hace:**
- Recibe mensajes vía webhook (ManyChat/WhatsApp) incluyendo texto, audio e imágenes.
- Transcribe audios y analiza imágenes con GPT-4o antes de procesarlos.
- Un agente **JUDGE** clasifica cada mensaje como `RESERVA` o `CONVERSACION` para enrutar el flujo.
- El agente principal (Sof-IA) responde en el idioma del usuario (multilingüe) con tono profesional y cálido.
- Un agente **RSVP** gestiona agendamiento estructurado: tipo (cita/llamada), fecha/hora, habitaciones e intención de compra.
- Registra y actualiza perfiles de prospectos en MongoDB (primera interacción, último mensaje, canal de ingreso).
- Persiste el historial de conversación con ventana de 40 mensajes en MongoDB.

**Valor:** Sistema de ventas 24/7 que califica leads automáticamente, persiste contexto de conversación y captura datos de reserva de forma estructurada, reduciendo la carga del equipo comercial.

---

### 🧠 COACH INMOBILIARIO.json
**Objetivo:** Asistente de coaching de ventas para el equipo asesor de *Parque Vista Verde*, que analiza conversaciones de prospectos y genera estrategias accionables.

**Qué hace:**
- Se ejecuta cada minuto verificando usuarios con más de 15 minutos de inactividad y sin análisis previo.
- Recupera el historial completo de chat de MongoDB (colecciones `chat_histories` y `chat_histories_lead`).
- Verifica si el usuario ya tiene una cita agendada para filtrar quiénes necesitan seguimiento.
- El agente de IA analiza la conversación y genera un JSON estructurado con:
  - **Análisis del prospecto:** necesidades, presupuesto, timeline, motivación, objeciones, decisores.
  - **Estrategia de venta:** modo cierre, guion sugerido, preguntas de calificación, argumentos clave, próximos pasos.
  - **Datos faltantes críticos** que el asesor debe obtener.
- Genera un email HTML profesional con el informe completo y lo envía automáticamente al equipo.

**Valor:** Convierte cada conversación en inteligencia de ventas accionable. El asesor recibe un briefing completo del prospecto antes de contactarlo, aumentando significativamente la tasa de conversión.

---

### 📄 CONTRACTS FROM SLACK.json
**Objetivo:** Captura automática de contratos PDF desde canales de Slack para su procesamiento y registro.

**Qué hace:**
- Monitorea un canal de Slack en busca de archivos PDF adjuntos.
- Descarga los contratos y extrae datos legales clave usando IA.
- Guarda la información estructurada en Airtable y/o Google Sheets.

**Valor:** Elimina el ingreso manual de datos de contratos, centraliza el registro legal y garantiza trazabilidad desde la recepción del documento.

---

### 🗄️ Company-Knowledge MongoDB.json
**Objetivo:** Gestión y sincronización de la base de conocimientos interna en MongoDB.

**Qué hace:**
- Indexa, actualiza y consulta documentos de conocimiento empresarial en MongoDB.
- Sirve como fuente de datos para agentes RAG (Retrieval-Augmented Generation).

**Valor:** Mantiene actualizada la base vectorial de conocimiento que alimenta a los agentes de IA, garantizando respuestas precisas y con contexto empresarial.

---

### 🗄️ Company-Knowledge Supabase.json
**Objetivo:** Gestión y sincronización de la base de conocimientos interna en Supabase (PostgreSQL + pgvector).

**Qué hace:**
- Versión alternativa del flujo de knowledge management, usando Supabase como backend vectorial.
- Permite búsqueda semántica sobre documentos empresariales.

**Valor:** Ofrece una alternativa gestionada en la nube para la base de conocimientos, con capacidades de búsqueda semántica integradas.

---

### 🔑 KeyWords Vista Verde.json
**Objetivo:** Análisis y extracción de palabras clave de las conversaciones del proyecto *Parque Vista Verde*.

**Qué hace:**
- Procesa transcripciones o textos del proyecto inmobiliario.
- Identifica y agrupa palabras clave relevantes (amenidades, precios, ubicación, objeciones frecuentes).

**Valor:** Proporciona insights sobre los temas más consultados por los prospectos, orientando la optimización del agente y la estrategia de contenidos.

---

### ⚖️ LAW CLERK INCOMING MAILS.json
**Objetivo:** Automatización del registro de timecards de asistentes legales (lawclerks) para facturación.

**Qué hace:**
- Monitorea la bandeja de entrada de correos de "Lawclerk".
- Extrae automáticamente los datos de horas trabajadas (timecard) usando IA.
- Registra la información en Airtable para su posterior procesamiento de facturación.

**Valor:** Elimina el ingreso manual de horas, reduce errores de facturación y acelera el ciclo de cobro del despacho legal.

---

### ⚖️ LEGAL ASSISTANT.json
**Objetivo:** Asistente de IA para soporte en tareas legales de redacción y consulta.

**Qué hace:**
- Agente conversacional especializado en terminología y redacción legal.
- Asiste al equipo legal con borradores, resúmenes y consultas de documentos.

**Valor:** Acelera tareas repetitivas de redacción y consulta legal, liberando tiempo de los abogados para trabajo de mayor valor.

---

### 📊 Meta Campañas.json
**Objetivo:** Captura y procesamiento de leads en tiempo real desde campañas de Meta (Facebook/Instagram).

**Qué hace:**
- Recibe leads instantáneamente a través del webhook de Meta Lead Ads.
- Procesa y normaliza los datos del lead (nombre, correo, teléfono, campaña de origen).
- Distribuye el lead al CRM o sistema de seguimiento correspondiente.

**Valor:** Garantiza que ningún lead de Meta se pierda por captura manual tardía, reduciendo el tiempo de respuesta al prospecto a segundos.

---

### 🏛️ Municipalidad.json
**Objetivo:** Asistente ciudadano con IA y RAG para la Municipalidad de Pérez Zeledón.

**Qué hace:**
- Bot conversacional que responde preguntas de ciudadanos sobre trámites, servicios y regulaciones municipales.
- Utiliza RAG (Retrieval-Augmented Generation) con MongoDB Atlas Vector Search.
- Mantiene historial de conversación por sesión.

**Valor:** Descongestiona la atención al ciudadano en horario de oficina, brindando respuestas precisas 24/7 sobre servicios municipales sin necesidad de personal adicional.

---

### 🛍️ Oakland Mall Bot DEMO.json
**Objetivo:** Demo de bot multicanal con IA para consulta de locales e información de un centro comercial.

**Qué hace:**
- Integrado con ManyChat (Instagram/Facebook) y Telegram.
- Responde preguntas sobre locales disponibles, horarios, eventos y servicios del mall.
- Usa RAG para acceder a la base de conocimiento del centro comercial.

**Valor:** Demuestra la capacidad de desplegar un asistente de IA multicanal para retail/commercial real estate, con consultas en lenguaje natural sobre disponibilidad de locales.

---

### 📦 ORDENES DE SHOPIFY.json
**Objetivo:** Procesamiento automático de pedidos de Shopify y sincronización con sistemas de inventario.

**Qué hace:**
- Recibe eventos de nuevos pedidos desde el webhook de Shopify.
- Procesa y transforma los datos del pedido.
- Sincroniza la información con sistemas de inventario o fulfillment externos.

**Valor:** Automatiza el pipeline de pedidos desde la tienda online hasta el almacén, reduciendo errores de procesamiento y tiempos de despacho.

---

### 📅 RECORDATORIO CITA.json
**Objetivo:** Sistema automático de seguimiento y confirmación de citas agendadas.

**Qué hace:**
- Monitorea citas próximas en la base de datos (MongoDB/CRM).
- Envía recordatorios automáticos vía WhatsApp y/o Email en tiempos predefinidos antes de la cita.
- Gestiona confirmaciones y cancelaciones de los prospectos.

**Valor:** Reduce la tasa de no-shows en citas comerciales, mejorando la eficiencia del equipo de ventas y optimizando el uso de tiempo de los asesores.

---

### 💳 TRACKING INCOMING PAYMENTS.json
**Objetivo:** Monitoreo y conciliación automática de pagos Zelle recibidos via Gmail.

**Qué hace:**
- Escanea correos de confirmación de pagos Zelle en Gmail.
- Extrae monto, remitente y referencia del pago usando IA.
- Concilia el pago con el caso legal correspondiente en Airtable.
- Genera alertas para el equipo cuando se recibe un pago.

**Valor:** Elimina la revisión manual de correos bancarios, automatiza la conciliación de pagos con expedientes legales y reduce el riesgo de pagos no registrados.

---

### 💳 TRACKING INCOMING PAYMENTS - OUTLOOK.json
**Objetivo:** Variante del flujo de tracking de pagos, optimizada para notificaciones en Outlook.

**Qué hace:**
- Mismo proceso que la versión Gmail pero conectado a buzones Microsoft Outlook.
- Procesa notificaciones bancarias y concilia con registros en Airtable.

**Valor:** Permite usar el mismo sistema de conciliación de pagos para equipos que trabajan en el ecosistema Microsoft 365.

---

### 🎬 YouTube Video Summarizer - RapidAPI.json
**Objetivo:** Generación automática de resúmenes educativos a partir de videos de YouTube.

**Qué hace:**
- Recibe una URL de YouTube y obtiene la transcripción a través de RapidAPI.
- Procesa la transcripción con IA para generar un resumen estructurado (puntos clave, conceptos principales, notas de estudio).
- Guarda el resumen formateado directamente en Google Docs.

**Valor:** Transforma contenido audiovisual largo en material de estudio escrito y estructurado en segundos, ideal para equipos de formación o creadores de contenido educativo.

---

## 📁 Proyectos Organizados (Carpetas)

---

### 💰 Facturación: Mundo Verde (Odoo)

*Ubicación: `/Facturas - Mundo Verde - Odoo/`*

Suite integral para automatizar el ciclo completo de cuentas por pagar y sincronización con el ERP Odoo. Cubre desde la recepción de facturas hasta la generación de reportes de discrepancias.

| Archivo | Función | Valor |
| :--- | :--- | :--- |
| `Mundo Verde - MATCH ODOO.json` | Flujo principal que conecta facturas recibidas con Órdenes de Compra en Odoo vía API. Valida montos, proveedores y conceptos. | Elimina la conciliación manual factura-PO, reduciendo errores contables y tiempo de cierre. |
| `MUNDO VERDE - FACTURAS CORREO.json` | Monitorea buzones de entrada para detectar y extraer facturas PDF/XML automáticamente usando IA. | Captura facturas sin intervención humana, independientemente del canal de envío del proveedor. |
| `MUNDO VERDE - FORMULARIO.json` | Recibe datos estructurados de facturación desde formularios externos (Typeform/Tally) cuando no hay archivo. | Alternativa estandarizada para proveedores que no envían PDF, garantizando datos completos. |
| `Mundo verde - Asignar Cuenta Analitica.json` | Clasifica automáticamente los gastos en centros de costo de Odoo basándose en proveedor y concepto. | Elimina la clasificación contable manual, acelerando el proceso de aprobación de facturas. |
| `INGRESA CONECEPTO DETALLE FACTURA.json` | Procesa y desglosa los conceptos de cada factura para su registro individual en Odoo. | Garantiza que cada línea de factura quede correctamente registrada en el ERP. |
| `INGRESA CONCEPTO DETALLE FACTURA 2.json` | Versión alternativa/actualizada del flujo de ingreso de conceptos de factura. | Permite pruebas A/B o migración controlada entre versiones del proceso de ingreso. |
| `Mundo Verde - Matchear Tablas.json` | Compara datos entre hojas de cálculo de control y registros de Odoo para asegurar integridad. | Detecta discrepancias entre el control interno y el ERP antes de que se conviertan en problemas. |
| `Mundo Verde - REPORTE FACTURAS SIN MATCHEAR.json` | Genera automáticamente una lista de facturas sin conciliar para revisión del equipo contable. | Permite al equipo contable actuar sobre excepciones, no sobre el flujo normal. |
| `Mundo Verde - REPORTE FACTURAS SIN CONFIRMAR.json` | Genera alertas sobre facturas que aún requieren aprobación final en Odoo. | Elimina facturas "olvidadas" en cola de aprobación, acelerando el cierre del período. |
| `Mundo Verde - ERROR HANDLER.json` | Centraliza y notifica los errores de cualquier flujo del proyecto Mundo Verde. | Un único punto de gestión de errores reduce el tiempo de diagnóstico y corrección de fallas. |

---

### 🌿 Proyecto Magdalena (GIS & Monitoreo Agrícola)

*Ubicación: `/Magdalena/`*

Ecosistema de flujos para la gestión de datos agrícolas, monitoreo remoto de fincas mediante índices espectrales (NDVI/NDWI) y generación de alertas ante condiciones críticas de cultivo.

| Archivo | Función | Valor |
| :--- | :--- | :--- |
| `LOAD POLYGONS TO DATABASE.json` | Importa archivos geográficos (KML/GeoJSON) de parcelas y polígonos de finca a la base de datos SQL/MongoDB. | Digitaliza el inventario geográfico de fincas para su monitoreo automatizado. |
| `ITERAR POLYGONS.json` | Motor de procesamiento masivo que itera sobre todos los polígonos registrados para actualizar sus métricas satelitales. | Permite el monitoreo a escala de cientos de parcelas sin intervención manual. |
| `ITERAR DATA.json` | Procesa y actualiza en batch los datos agronómicos (NDVI, NDWI, métricas de cambio) de cada polígono. | Mantiene actualizada la capa de datos analíticos que alimenta las alertas automáticas. |
| `CRITICAL STATUS NOTIFICACTIONS.json` | Agente de IA especialista en agronomía que analiza polígonos en estado crítico, diagnostica la causa probable (déficit hídrico, plagas, estrés nutricional) y genera recomendaciones inmediatas. Responde vía webhook. | Transforma datos satelitales crudos en diagnósticos accionables, permitiendo intervención temprana antes de pérdidas de cosecha. |
| `CRITICAL STATUS REPORT.json` | Genera informes consolidados sobre todos los polígonos con alertas fitosanitarias o de riego detectadas en el período. | Visión ejecutiva del estado de salud de las fincas para toma de decisiones gerenciales. |
| `Send Critical Notification.json` | Lógica de envío de alertas (Push/Email/WhatsApp) cuando un polígono entra en estado de riesgo crítico. | Notificación proactiva al equipo de campo para intervención inmediata en tiempo real. |
| `Ver Polygons Data por Finca.json` | API interna (webhook) que retorna los datos y métricas actuales de todos los polígonos de una finca específica. | Permite a aplicaciones externas o dashboards consultar el estado actualizado de cualquier finca. |
| `Eliminar Polygons Data por Finca.json` | Utilidad de mantenimiento para eliminar selectivamente datos geográficos de una finca del sistema. | Gestión del ciclo de vida de datos, permitiendo actualizar o migrar información de fincas. |
| `CONNECTING n8n to Sheet.json` | Sincronización bidireccional entre la base de datos GIS y Google Sheets para reportes y seguimiento manual. | Permite al equipo agronómico acceder y actualizar datos desde una interfaz familiar (Google Sheets). |

---

### 🔔 Recordatorios de Pagos

*Ubicación: `/Recordatorios de Pagos/`*

Sistema de seguimiento automático para la gestión de cobranza. Envía recordatorios escalonados y permite control granular sobre el estado de cada cliente.

| Archivo | Función | Valor |
| :--- | :--- | :--- |
| `Recuerdo de Pago.json` | Flujo recurrente que consulta pagos próximos a vencer y envía notificaciones de cobro según fechas configuradas. | Reduce la morosidad automatizando el proceso de cobranza preventiva sin necesidad de personal dedicado. |
| `ACTIVAR O DESACTIVAR.json` | Interfaz lógica para pausar o reanudar el envío de alertas a clientes específicos (ej. cliente en proceso de disputa o con acuerdo especial). | Control fino de excepciones: evita molestar a clientes en situaciones sensibles manteniendo automatización para el resto. |
| `Pagos Form.json` | Registra nuevos compromisos de pago o confirmaciones de abonos recibidos a través de un formulario web. | Centraliza el registro de compromisos de pago, manteniendo el sistema de cobranza sincronizado con la realidad. |

---

### 📱 Holdmin (Social Media)

*Ubicación: `/Holdmin/`*

| Archivo | Función | Valor |
| :--- | :--- | :--- |
| `Social_Media_30Posts.json` | Genera automáticamente una parrilla editorial de 30 publicaciones para redes sociales (texto e ideas visuales) usando GPT-4, optimizada para planificación mensual. | Reduce a minutos el trabajo de planificación mensual de contenido, garantizando consistencia de marca y variedad temática. |

---

## 🚀 Instrucciones de Uso

1. **Importación:** En n8n, crea un nuevo workflow y selecciona `Import from File...` seleccionando el archivo `.json` deseado.
2. **Configuración:** Reemplaza las credenciales marcadas (iconos naranjas) con tus propias llaves de API (OpenAI, Google, Odoo, MongoDB, etc.).
3. **Activación:** Asegúrate de configurar los Webhooks o Triggers antes de activar el flujo.

### 🔐 Credenciales Comunes Requeridas

| Servicio | Flujos que lo usan |
| :--- | :--- |
| OpenAI API | AI Agent v4, Coach Inmobiliario, Oakland Mall, Municipalidad, YouTube Summarizer, Magdalena |
| MongoDB | AI Agent v4, Coach Inmobiliario, Company-Knowledge MongoDB, Magdalena |
| Gmail / Google OAuth | Coach Inmobiliario, Tracking Payments, YouTube Summarizer |
| ManyChat / Meta | AI Agent v4, Meta Campañas, Oakland Mall Bot |
| Airtable | Contracts from Slack, Law Clerk, Tracking Payments |
| Odoo API | Mundo Verde (todos los flujos) |
| Supabase | Company-Knowledge Supabase |

---

*Colección mantenida para la optimización de procesos operativos. Última actualización: Marzo 2026.*
