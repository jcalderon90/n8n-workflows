# 🤖 Informe Ejecutivo: Agente Unificado "Sof-IA"
> **Estatus:** Producción Activa (Routing Dinámico) | **Fecha:** 2026-05-13

## 1. 🧠 Filosofía del Sistema (Sof-IA)
Sof-IA no es un chatbot tradicional de árbol de decisiones; es un **Orquestador de Inteligencia Artificial**. Su función principal es actuar como la puerta de entrada única para todos los canales de Spectrum (WhatsApp, Messenger, Instagram), clasificando la intención del usuario y delegando la conversación a "herramientas" o sub-workflows especializados.

### Características de Comportamiento:
*   **Tono de Voz:** Cercano, profesional y regionalizado (uso de tuteo: *"puedes"*, *"cuéntame"*).
*   **Persistencia:** Capacidad de recordar el historial previo gracias a la integración con MongoDB.
*   **Validación:** No permite que un lead avance a etapas críticas (como agendar cita) sin haber capturado antes los datos mínimos de contacto.

---

## 2. 🛠️ Arquitectura de Especialistas
El sistema se divide en módulos independientes que Sof-IA utiliza según sea necesario:

| Módulo | Función Principal |
|---|---|
| **Lead Collector** | Captura de datos (Nombre, Email, Teléfono). Valida duplicados en tiempo real. |
| **KB Search** | Consultas a la Base de Conocimiento de los 5 proyectos (PVV, PMAR, PPO, PPOL, PSB). |
| **RSVP Agent** | Gestión de citas. Captura intenciones de compra, tipo de cita y número de habitaciones. |
| **Send Media** | Entrega automatizada de brochures, planos y renders mediante enlaces directos. |

---

## 3. 🔄 Sincronización y Datos (El Cerebro)
El sistema está diseñado para que la operación humana sea mínima y la calidad del dato sea máxima:

*   **Atribución (UTM Tracking):** Detecta automáticamente el origen del lead (Web, Facebook, Instagram, Fan Page, Mail, Bancos) basándose en el mensaje inicial.
*   **Sincronización CRM:** Un proceso en segundo plano cada 15 minutos consolida la información y la inyecta en el CRM de Spectrum vía SOAP, incluyendo un resumen ejecutivo de la charla para el asesor humano.
*   **Auditoría de Calidad:** Cada sincronización genera un log de calidad (`quality_logs`) que califica la interacción del bot.

---

## 4. ✅ Estado Actual del Proyecto (Post-Reunión Mayo 13)
Tras las optimizaciones recientes, el sistema presenta el siguiente estatus técnico:

*   **Infraestructura Multitenant:** 100% Funcional. Enrutamiento dinámico por canal activado.
*   **Gestión de Canales:** Los leads de Instagram y Messenger son asignados a su proyecto automáticamente por `page_id`. WhatsApp mantiene calificación manual.
*   **Sincronización CRM:** Lógica de UTMs afinada para priorizar datos de campaña sobre datos históricos.
*   **Paridad Servidor/Local:** Verificada vía MCP. El orquestador y los sub-flujos locales reflejan 100% la lógica en producción.

---

## 🚀 Próximos Pasos (Iniciativas Estratégicas Activas)
1.  **Mejoras en Sync_CRM (P1):** Enriquecer el resumen de conversación que viaja al CRM, extrayendo explícitamente presupuesto, tipo de unidad e intención del lead para que los asesores tengan contexto completo.
2.  **Tracking UTMs (P1):** Consolidar la captura del medio de captación y poblar el campo `_UTMCampaing` con el formato `"Chatbot - [medio]"`.
3.  **Integración de Citas Web (P2):** Recibir los leads del nuevo formulario de citas de Tribal vía Webhook en lugar de un mensaje pre-llenado de WhatsApp.
4.  **Expansión de Tráfico (P2):** Finalizar configuraciones para recibir tráfico de Sotobosque y Polanco una vez aprobados.
5.  **Investigación Zapier (P3):** Evaluar migrar del Web Service SOAP actual a una integración Zapier directa al CRM para mayor agilidad en la gestión de campos.
6.  **Calidad Continua (P4):** Aseguramiento de calidad diario (QA) de las conversaciones para iterar y mejorar las habilidades de Sof-IA.


---
*Este informe fue generado para el equipo de Spectrum Vivienda como resumen de la implementación del Agente Unificado.*
