# 🏢 SPECTRUM VIVIENDA: Agente Unificado (Estado del Proyecto)

## 🎯 Objetivo General
Migrar la lógica avanzada y segmentada del flujo monolítico (`flujo de muestra.json`) hacia una arquitectura moderna, orientada a Agentes, escalable y modular ("Agente Unificado"). Esto se logra separando las responsabilidades en herramientas (Tools) especializadas bajo el mando de un único Agente Orquestador.

## 🏗️ Arquitectura Actual (Componentes)
El ecosistema actual en n8n se compone de 5 piezas fundamentales:

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

5. **`escalation.json` (Sub-Workflow)**
   - **Función:** Enrutador y Notificador a Soporte en Vivo (Red de Seguridad).
   - **Integración:** Se lanza de fondo si el Orquestador o un Tool determina que el usuario no puede ser atendido por la IA o solicita expresamente comunicación con un asesor vía mail.

---

## 🚀 Últimos Cambios Implementados (Migración Fina)
Para alcanzar el nivel de madurez, trazabilidad y analítica de datos del antiguo *flujo de muestra*, se incorporaron los siguientes hitos de inteligencia de negocio:

1. **Métricas Estrictas de CRM (`Principal.json`):**
   - Se afinó el tracking de inserción (`DATA to CREATE`) y actualización (`DATA to UPDATE`) a MongoDB para inyectar automáticamente variables forenses: `first_interaction`, `last_interaction` y textualmente la `last_message`. Esto evita que un asesor empiece su guardia leyendo toda una bitácora entera.
2. **Intercepción de Escalación / Fallback Eficiente:**
   - Creación del hook manual en `Principal.json`. Un filtro evalúa en salida limpia si el agente arroja la intención explícita `transferir == 1`. Si la cumple, pasa toda la variable de contacto (`nombre`, `correo`, `proyecto`) y la ejecuta en background enviándola por GMail (Soporte Ejecutivo).
3. **Bandera Final de Conversión (`RSVP.json`):**
   - El objetivo primario de "Sof-IA" es recolectar Citas. Para que el comercial entienda si funcionó, se adjuntó una acción de `Update` al finalizar el RSVP que impacta a la tabla origen `users` y marca el campo exitoso definitivo: `has_reservation = true`.

---

## ⏸️ Casos Pendientes / "Nice-to-Have" (Por Autorización)
Se establecieron dos funcionalidades que el marco anterior dominaba, pero se postergan para la segunda iteración del proyecto con aprobación superior:

1. **Send Media Tool (Módulo de Medios)**
   - Sub-rutina con *HTTP Requests API ManyChat* que permita al LLM enviar de vuelta proactivamente visuales crudos a la red del cliente (Ej: PDFs de brochures y Mapas 2D cuando hay peticiones visuales).
2. **Web Search Fallback (Contexto de Economía/Área)**
   - Conexión del agente secundario (KB) a motores tipo *Perplexity* o *Tavily*. Garantiza que el bot brinde respuestas educadas macro-económicas (ej. "Tasa de crédito FHA promedio") previniendo una alucinación originada porque el Vector no posee data genérica fuera del proyecto en curso.
