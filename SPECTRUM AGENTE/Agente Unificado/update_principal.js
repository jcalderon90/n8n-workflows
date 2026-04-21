const fs = require('fs');

const path = './Principal.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Check if send_media is already there
if (data.nodes.some(n => n.name === 'send_media')) {
    console.log('send_media tool already exists.');
    process.exit(0);
}

const sendMediaNode = {
    "parameters": {
        "description": "=Usa esta tool cuando el usuario pida explícitamente contenido multimedia \ncomo fotos, imágenes, planos, renders, brochure o amenidades del proyecto.\n\nParámetros requeridos:\n- tipo_media: la palabra clave de lo que pide (brochure, amenidades, renders, planos)\n- proyecto: el código del proyecto (pvv, pm, pp)\n- canal: el canal por donde escribe el usuario\n- manychat_id: ID del usuario",
        "workflowId": {
            "__rl": true,
            "value": "NtTiyrNy2LHimE7u",
            "mode": "list",
            "cachedResultUrl": "/workflow/NtTiyrNy2LHimE7u",
            "cachedResultName": "SEND MEDIA"
        },
        "workflowInputs": {
            "mappingMode": "defineBelow",
            "value": {
                "tipo_media": "={{ $fromAI('tipo_media', '', 'string') }}",
                "proyecto": "={{ $fromAI('proyecto', '', 'string') || $('User Data').item.json.proyecto }}",
                "canal": "={{ $('User Data').item.json.input_channel }}",
                "manychat_id": "={{ $('User Data').item.json.manychat_id }}"
            },
            "matchingColumns": [],
            "schema": [
                {
                    "id": "tipo_media",
                    "displayName": "tipo_media",
                    "required": true,
                    "defaultMatch": false,
                    "display": true,
                    "canBeUsedToMatch": true,
                    "type": "string"
                },
                {
                    "id": "proyecto",
                    "displayName": "proyecto",
                    "required": true,
                    "defaultMatch": false,
                    "display": true,
                    "canBeUsedToMatch": true,
                    "type": "string"
                },
                {
                    "id": "canal",
                    "displayName": "canal",
                    "required": true,
                    "defaultMatch": false,
                    "display": true,
                    "canBeUsedToMatch": true,
                    "type": "string"
                },
                {
                    "id": "manychat_id",
                    "displayName": "manychat_id",
                    "required": true,
                    "defaultMatch": false,
                    "display": true,
                    "canBeUsedToMatch": true,
                    "type": "string"
                }
            ],
            "attemptToConvertTypes": false,
            "convertFieldsToString": false
        }
    },
    "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
    "typeVersion": 2.2,
    "position": [-336, -96],
    "id": "428800ba-74b6-455b-b996-5bce2b8346ea",
    "name": "send_media"
};

data.nodes.push(sendMediaNode);

// Update connection to PRINCIPAL
if (!data.connections['send_media']) {
    data.connections['send_media'] = {
        "ai_tool": [[
            { "node": "PRINCIPAL", "type": "ai_tool", "index": 0 }
        ]]
    };
}

// Ensure the principal agent prompt knows about send_media
const principalNode = data.nodes.find(n => n.name === 'PRINCIPAL');
if (principalNode && principalNode.parameters && principalNode.parameters.options && principalNode.parameters.options.systemMessage) {
    let prompt = principalNode.parameters.options.systemMessage;

    if (!prompt.includes('send_media')) {
        // Add to tools variables list string inside TOOLS DISPONIBLES
        prompt = prompt.replace(
            "## TOOLS DISPONIBLES ##\n",
            "## TOOLS DISPONIBLES ##\n\n**send_media**\n- Función: Enviar imágenes, material gráfico, renders, planos, brochure o amenidades por ManyChat automáticamente.\n- Cuándo usarla: Cuando el usuario exprese explícitamente el deseo de ver fotos, imágenes, planos, renders o material gráfico de un proyecto.\n- Qué devuelve: Un mensaje de confirmación que fue enviado con éxito.\n- Cuándo NO usarla: Cuando piden precios o dudas informativas (usar kb_search).\n"
        );
        prompt = prompt.replace(
            "- Si llamaste a `rsvp`, `herramientas_usadas` DEBE incluir \"rsvp\".",
            "- Si llamaste a `rsvp`, `herramientas_usadas` DEBE incluir \"rsvp\".\n- Si llamaste a `send_media`, `herramientas_usadas` DEBE incluir \"send_media\"."
        );
        principalNode.parameters.options.systemMessage = prompt;
    }
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Successfully updated Principal.json with send_media tool.');
