# Estrategia de Captación y Enrutamiento por WhatsApp

## Objetivo
Implementar un sistema robusto para identificar el Proyecto de interés y el Origen (UTM Source) de un lead basándose en el "pre-filled text" de WhatsApp, mitigando el riesgo de que el lead modifique el texto antes de enviarlo.

## Problema con los Enlaces wa.me
Es imposible forzar o bloquear el texto en WhatsApp; el usuario puede agregar o borrar partes del mensaje. Si se usan reglas de "Exact Match" en ManyChat, el enrutamiento fallará a la menor modificación del texto.

## Solución Recomendada: Extracción por Substrings en n8n
Centralizar la lógica en n8n mediante un nodo **Code (JavaScript)** inmediatamente después de recibir el Webhook de ManyChat. Este nodo no busca coincidencias exactas, sino que busca "palabras clave" dentro de la cadena (independientemente de qué texto haya agregado el usuario).

---

## Implementación Paso a Paso

### 1. Configuración en ManyChat
ManyChat debe actuar solo como pasarela.
- El trigger (Default Reply o Trigger por defecto) debe enviar la solicitud HTTP (Webhook) hacia n8n.
- El body del webhook debe contener el mensaje íntegro (ej. usando la variable de ManyChat `{{last_input_text}}`).

### 2. Nodo Code en `AGENT PRINCIPAL.json`
Insertar un nodo "Code" (JavaScript) con el nombre `Extraer Proyecto y UTM` inmediatamente después del Webhook de entrada (o del nodo `Create Body` si existe).

**Código JavaScript a implementar:**
```javascript
// 1. OBTENER EL TEXTO Y LIMPIARLO
// Ajustar ruta según estructura del JSON entrante ($input.item.json.body.last_input_text)
let message_text = $input.item.json.body?.last_input_text || $input.item.json.last_input_text || "";
message_text = message_text.toLowerCase();

// 2. VARIABLES POR DEFECTO
let proyecto = null; // Si es null, el bot debe preguntar al lead qué proyecto le interesa
let utm_source = "100000004"; // Valor en CRM para "WhatsApp" (Genérico)
let tag_medio = "Organico WhatsApp";

// 3. DETECTAR PROYECTO
if (message_text.includes("vista verde") || message_text.includes("pvv")) {
    proyecto = "PVV";
} else if (message_text.includes("mariscal") || message_text.includes("pmar")) {
    proyecto = "PMAR";
} else if (message_text.includes("portales") || message_text.includes("ppo")) {
    proyecto = "PPO";
} else if (message_text.includes("polanco") || message_text.includes("ppol")) {
    proyecto = "PPOL";
} else if (message_text.includes("soto bosque") || message_text.includes("sotobosque") || message_text.includes("psb")) {
    proyecto = "PSB";
}

// 4. DETECTAR ORIGEN (UTM Source / Tag)
if (message_text.includes("anuncio")) {
    tag_medio = "City Core";
    utm_source = "100000012"; // Reemplazar con ID CRM correcto para City Core
} else if (message_text.includes("redes sociales")) {
    tag_medio = "Social Media";
    utm_source = "100000012"; // Reemplazar con ID CRM correcto
} else if (message_text.includes("fan page")) {
    tag_medio = "Fan Page";
} else if (message_text.includes("email")) {
    tag_medio = "Mail";
} else if (message_text.includes("banco")) {
    tag_medio = "Banco";
} else if (message_text.includes("quiero información del") || message_text.includes("quiero información de")) {
    tag_medio = "Web";
}

// 5. INYECTAR VARIABLES AL FLUJO
return {
    ...$input.item.json,
    extracted_campaign_data: {
        proyecto_detectado: proyecto,
        tag_medio: tag_medio,
        utm_source_crm: utm_source
    }
};
```

### 3. Persistencia y Lógica Subsecuente
- **Actualizar Nodos de MongoDB:** Modificar los nodos `Insert User` / `Update User` para que utilicen los valores inyectados (`$json.extracted_campaign_data.proyecto_detectado`, etc.).
- **Modificar System Prompt de Sof-IA (`AGENT PRINCIPAL.json`):**
  Añadir una regla condicional: *"Si el campo `proyecto_detectado` viene vacío o null, la primera acción obligatoria del bot es preguntarle al prospecto cuál de los 5 proyectos (Vista Verde, Mariscal, Portales, Polanco, Soto Bosque) le interesa, antes de intentar cargar cualquier Knowledge Base."*
