# 🏢 SPECTRUM VIVIENDA: Agente Unificado (Estado del Proyecto)

## 🎯 Objetivo General
Migrar la lógica avanzada y segmentada del flujo monolítico (`flujo de muestra.json`) hacia una arquitectura moderna, orientada a Agentes, escalable y modular ("Agente Unificado"). Esto se logra separando las responsabilidades en herramientas (Tools) especializadas bajo el mando de un único Agente Orquestador.

## 🏗️ Arquitectura Actual (Componentes)
El ecosistema actual en n8n se compone de 7 piezas fundamentales integradas dinámicamente:

1. **`Principal.json` (El Orquestador - *Sof-IA*)**
   - **Función:** Actúa como recepcionista central. Clasifica la intención del usuario y "llama" a diferentes herramientas.
   - **Integración:** Entiende saludos, filtra por canal (WhatsApp/IG/Messenger), graba la base en MongoDB y gestiona el flujo de "Consultas Pendientes" para "acordarse" de responder la pregunta de alguien justo después de obligarle a identificarse.

2. **`Lead Collector.json` (Tool)**
   - **Función:** Extrae el nombre, teléfono y correo del usuario conversacionalmente.
   - **Integración:** Bloquea gentilmente el avance de un usuario anónimo asegurando que el CRM tenga su información antes de usar tokens respondiendo dudas sobre los proyectos en el RAG.

3. **`KB_Search.json` (Tool)**
   - **Función:** Base de datos Vectorial Inteligente (RAG sobre MongoDB).
   - **Integración:** El Agente asume el rol de experto inmobiliario, respondiendo únicamente dudas técnicas (layout, amenidades, financiamiento) respecto al proyecto específicamente seleccionado por el lead (`pvv`, `pm`, `pp`).

4. **`RSVP.json` (Tool)**
   - **Función:** Motor estructurado de Citas y Cualificación Avanzada de Leads.
   - **Integración:** Recoge parámetros críticos antes de asentar la cita: tipo (presencial/virtual/llamada), fecha y hora dictadas, interés financiero (Vivir vs Invertir) y el canal preferido para contacto posterior. Inserta su propio registro atómico en `appointments`.

5. **`Send Media.json` (Tool)**
   - **Función:** Módulo de entrega automatizada de material audiovisual (Imágenes, renders, planos, brochure).
   - **Integración:** Interpreta solicitudes directas de multimedia en la conversación, mapea el proyecto deseado al repositorio central, e invoca nativamente los endpoints de *Messenger / WhatsApp / Instagram* enviando ficheros ricos para retención visual directa en la App del prospecto.

6. **`Sync_CRM.json` (Motor Pasivo de Sincronización)**
   - **Función:** Gestor asíncrono de inyección a CRM por inactividad.
   - **Integración:** Cronjob agendado que se activa a los 15 minutos en *Schedule Trigger*. Realiza un barrido en MongoDB en busca de prospectos "en pausa", evalúa la conversación total y extrae mediante LLM sub-objetos `Resumen` y `Dudas` finales, construyendo una única llamada XML (SOAP) integral para el CRM de Spectrum.

7. **`Notifications.json` (Sub-Workflow de Escalación)**
   - **Función:** Enrutador y Notificador a Soporte en Vivo (Red de Seguridad).
   - **Integración:** Se lanza de fondo si el Orquestador o un Tool determina que el usuario no puede ser atendido por la IA o solicita expresamente comunicación.

---

## 🚀 Últimos Cambios Implementados (Migración Fina)
Para alcanzar el nivel de madurez, trazabilidad y analítica de datos del antiguo *flujo de muestra*, se incorporaron los siguientes hitos de inteligencia de negocio:

1. **Adopción de Sub-agentes Completamente Acoplados:**
   - La inclusión de las tools `RSVP`, `Send Media`, `KB_Search` y `Lead Collector` quedó asegurada dentro del bucle del Agente en `Principal.json`. Se inyectaron correctamente las descripciones de las tools para garantizar invocaciones precisas por parte del LLM.
2. **Sincronización SOAP Madura y Diferida:**
   - En lugar de enviar fragmentos instantáneos, se habilitó `Sync_CRM` que recopila la interacción completa del prospecto, resume la conversación con OpenAI, empaqueta todos sus datos calificados e inyecta la venta con contexto rico al CRM vía `CreacionClientePotencialBot` en una única llamada eficiente.
3. **Métricas Estrictas Forenses y Analíticas (Response Time BI):**
   - El orquestador inyecta variables de bitácora detallada y latencia de respuesta tabulada vía `$now.toMillis()` en la base `analytics_logs` de control corporativo.
4. **Sincronización con Servidor de Producción:**
   - Se validaron satisfactoriamente mediante auditoría MCP los componentes frente al servidor activo `agentsprod.redtec.ai`, alineando por completo los requerimientos.

---

## ⏸️ Casos Pendientes / "Nice-to-Have" (Por Autorización)
Se establecen funcionalidades que previenen alucinaciones y expanden la capacidad analítica que se explorarán para el pipeline a futuro:

1. **Web Search Fallback (Contexto de Economía/Área)**
   - Conexión del agente secundario a motores tipo *Perplexity* o *Tavily*. Garantiza que el bot brinde respuestas educadas macro-económicas (ej. "Tasa de crédito FHA promedio") previniendo una alucinación originada porque el Vector RAG no posee data genérica fuera del proyecto inmobiliario base en curso.
