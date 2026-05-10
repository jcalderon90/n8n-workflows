# 🤖 Informe Ejecutivo: Agente Unificado "Sof-IA"
> **Estatus:** Listo para Producción (Fase QA) | **Fecha:** 2026-05-09

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

## 4. ✅ Estado Actual del Proyecto
Tras las optimizaciones recientes, el sistema presenta el siguiente estatus técnico:

*   **Integración ManyChat:** 100% Funcional con inyección de campos personalizados.
*   **Lógica CRM:** Ajustada para priorizar datos de campaña sobre datos históricos.
*   **Formatos:** Notificaciones por correo corregidas (encoding de emojis y diseño HTML).
*   **Catálogo:** Todos los proyectos actuales de Spectrum están mapeados y operativos.
*   **Gestión de Citas:** Se implementó una regla de delegación; el bot gestiona la agenda pero aclara que el **asesor humano** es quien enviará el enlace de la reunión virtual por WhatsApp.

---

## 🚀 Próximos Pasos Recomendados
1.  **Validación E2E:** Realizar un ciclo completo desde un anuncio real hasta la entrada al CRM.
2.  **Asset Management:** Reemplazar URLs temporales de brochures por los archivos finales.
3.  **Monitoreo:** Revisar la colección `quality_logs` tras las primeras 24h de tráfico real.
4.  **Estrategia Multimedia:** Escalar `Send Media.json` para soportar el envío proactivo de videos y renders en formato imagen.


---
*Este informe fue generado para el equipo de Spectrum Vivienda como resumen de la implementación del Agente Unificado.*
