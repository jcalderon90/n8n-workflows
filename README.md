# 🚀 Colección de Workflows n8n

Este repositorio es una biblioteca de flujos de trabajo (**n8n workflows**) diseñados para automatizar diversos procesos operativos, contables y de inteligencia artificial. Cada archivo `.json` representa un flujo independiente o parte de un proyecto específico.

---

## 📂 Estructura del Repositorio

Los flujos están organizados de la siguiente manera:

1. **Archivos en la raíz:** Flujos independientes y herramientas generales.
2. **Carpetas:** Proyectos consolidados que comprenden múltiples flujos interconectados.

---

## 🛠️ Flujos Independientes (Raíz)

| Archivo | Resumen de Funcionalidad |
| :--- | :--- |
| `AI Agent v3.json` | Agente avanzado para "Parque Vista Verde". Clasifica intenciones (RESERVA vs. CONVERSACIÓN) y extrae datos de prospectos multilingües. |
| `COACH INMOBILIARIO.json` | Analiza historiales de chat para generar estrategias tácticas y guiones de venta para asesores inmobiliarios. |
| `CONTRACTS FROM SLACK.json` | Captura contratos PDF de Slack, extrae datos legales con IA y los guarda en Airtable/Google Sheets. |
| `Company-Knowledge MongoDB.json` | Sincronización y gestión de base de conocimientos interna en MongoDB. |
| `Company-Knowledge Supabase.json` | Sincronización y gestión de base de conocimientos interna en Supabase. |
| `KeyWords Vista Verde.json` | Análisis y procesamiento de palabras clave para el proyecto inmobiliario. |
| `LAW CLERK INCOMING MAILS.json` | Extrae datos de timecards desde correos de "Lawclerk" y los registra en Airtable para facturación legal. |
| `LEGAL ASSISTANT.json` | Asistente de IA especializado en tareas de redacción y apoyo legal. |
| `Meta Campañas.json` | Captura y procesamiento de leads en tiempo real provenientes de Meta (Facebook/Instagram Lead Ads). |
| `Municipalidad.json` | Asistente ciudadano con RAG (MongoDB Atlas) para la Municipalidad de Pérez Zeledón. |
| `Oakland Mall Bot DEMO.json` | Demo de bot multicanal (ManyChat/Telegram) con RAG para consulta de locales e información de centro comercial. |
| `ORDENES DE SHOPIFY.json` | Procesamiento automático de pedidos y sincronización con sistemas de inventario. |
| `RECORDATORIO CITA.json` | Sistema automático de confirmación y recordatorios de citas vía WhatsApp/Email. |
| `TRACKING INCOMING PAYMENTS.json` | Monitoreo de pagos Zelle vía Gmail y conciliación automática con casos legales en Airtable. |
| `TRACKING INCOMING PAYMENTS - OUTLOOK.json` | Variante del tracking de pagos optimizada para notificaciones recibidas en Outlook. |
| `YouTube Video Summarizer - RapidAPI.json` | Transcribe videos y genera resúmenes educativos estructurados directamente en Google Docs. |

---

## 📁 Proyectos Organizados (Carpetas)

### 💰 Facturación: Mundo Verde (Odoo)

*Ubicación: `/Facturas - Mundo Verde - Odoo/`*

Suite integral para automatizar el ciclo de cuentas por pagar y sincronización con Odoo ERP.

| Archivo | Función |
| :--- | :--- |
| `Mundo Verde - MATCH ODOO.json` | Flujo principal que conecta facturas con Órdenes de Compra en Odoo vía API. |
| `MUNDO VERDE - FACTURAS CORREO.json` | Monitorea bandejas de entrada para extraer facturas PDF/XML automáticamente. |
| `MUNDO VERDE - FORMULARIO.json` | Recibe datos estructurados de facturación desde formularios externos (Typeform/Tally). |
| `Mundo verde - Asignar Cuenta Analitica.json` | Clasifica gastos automáticamente en Odoo basándose en el proveedor o concepto. |
| `INGRESA CONCEPTO DETALLE FACTURA.json` | Procesa y desglosa los conceptos de la factura para su registro individual. |
| `Mundo Verde - Matchear Tablas.json` | Compara datos entre hojas de cálculo y registros de Odoo para asegurar integridad. |
| `Mundo Verde - REPORTE FACTURAS SIN MATCHEAR.json` | Genera una lista de discrepancias para revisión manual de contabilidad. |
| `Mundo Verde - REPORTE FACTURAS SIN CONFIRMAR.json` | Alertas sobre facturas que requieren aprobación final en el ERP. |
| `Mundo Verde - ERROR HANDLER.json` | Gestión centralizada de errores para todos los flujos del proyecto. |

---

### 🌿 Proyecto Magdalena (GIS & Monitoreo)

*Ubicación: `/Magdalena/`*

Ecosistema de flujos para la gestión de datos agrícolas, monitoreo de fincas y análisis geográfico.

| Archivo | Función |
| :--- | :--- |
| `LOAD POLYGONS TO DATABASE.json` | Importa archivos geográficos (KML/GeoJSON) de parcelas a la base de datos SQL. |
| `ITERAR POLYGONS.json` / `ITERAR DATA.json` | Motores de procesamiento masivo para actualizar estados de múltiples parcelas. |
| `CRITICAL STATUS REPORT.json` | Genera informes consolidados sobre alertas fitosanitarias o de riego detectadas. |
| `Send Critical Notification.json` | Lógica de envío de alertas (Push/Email) ante eventos de riesgo en campo. |
| `Ver Polygons Data por Finca.json` | API interna para consultar la información de polígonos de una finca específica. |
| `Eliminar Polygons Data por Finca.json` | Utilidad de mantenimiento para limpieza selectiva de datos geográficos. |
| `CONNECTING n8n to Sheet.json` | Sincronización bidireccional entre la base de datos GIS y Google Sheets. |

---

### 🔔 Recordatorios de Pagos

*Ubicación: `/Recordatorios de Pagos/`*

Sistema de seguimiento automático para la gestión de cobranza.

| Archivo | Función |
| :--- | :--- |
| `Recuerdo de Pago.json` | Flujo recurrente que envía notificaciones de cobro según fechas de vencimiento. |
| `ACTIVAR O DESACTIVAR.json` | Interfaz lógica para pausar o reanudar el envío de alertas a clientes específicos. |
| `Pagos Form.json` | Registra nuevos compromisos de pago o abonos recibidos a través de un formulario. |

---

### 📱 Holdmin (Social Media)

*Ubicación: `/Holdmin/`*

| Archivo | Función |
| :--- | :--- |
| `Social_Media_30Posts.json` | Genera una parrilla de 30 publicaciones (texto e ideas visuales) usando GPT-4 para planificación mensual. |

---

## 🚀 Instrucciones de Uso

1. **Importación:** En n8n, crea un nuevo workflow y selecciona `Import from File...` seleccionando el archivo `.json` deseado.
2. **Configuración:** Reemplaza las credenciales marcadas (iconos naranjas) con tus propias llaves (OpenAI, Google, Odoo, etc.).
3. **Activación:** Asegúrate de configurar los Webhooks o Triggers antes de activar el flujo.

---

*Colección mantenida para la optimización de procesos operativos.*
