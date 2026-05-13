const fs = require('fs');

const path = './Agente Unificado/AGENT PRINCIPAL.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Add new Node
const extractNodeId = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"; 
const extractNode = {
  "parameters": {
    "jsCode": "let message_text = $input.item.json.current_body?.last_input_text || $input.item.json.last_input_text || \"\";\nmessage_text = message_text.toLowerCase();\n\nlet proyecto = null;\nlet utm_source = \"100000004\";\nlet tag_medio = \"Organico WhatsApp\";\n\nif (message_text.includes(\"vista verde\") || message_text.includes(\"pvv\")) {\n    proyecto = \"PVV\";\n} else if (message_text.includes(\"mariscal\") || message_text.includes(\"pmar\")) {\n    proyecto = \"PMAR\";\n} else if (message_text.includes(\"portales\") || message_text.includes(\"ppo\")) {\n    proyecto = \"PPO\";\n} else if (message_text.includes(\"polanco\") || message_text.includes(\"ppol\")) {\n    proyecto = \"PPOL\";\n} else if (message_text.includes(\"soto bosque\") || message_text.includes(\"sotobosque\") || message_text.includes(\"psb\")) {\n    proyecto = \"PSB\";\n}\n\nif (message_text.includes(\"anuncio\")) {\n    tag_medio = \"City Core\";\n    utm_source = \"100000012\";\n} else if (message_text.includes(\"redes sociales\")) {\n    tag_medio = \"Social Media\";\n    utm_source = \"100000012\";\n} else if (message_text.includes(\"fan page\")) {\n    tag_medio = \"Fan Page\";\n} else if (message_text.includes(\"email\")) {\n    tag_medio = \"Mail\";\n} else if (message_text.includes(\"banco\")) {\n    tag_medio = \"Banco\";\n} else if (message_text.includes(\"quiero información del\") || message_text.includes(\"quiero información de\")) {\n    tag_medio = \"Web\";\n}\n\nreturn [{\n    json: {\n        ...$input.item.json,\n        extracted_campaign_data: {\n            proyecto_detectado: proyecto,\n            tag_medio: tag_medio,\n            utm_source_crm: utm_source\n        }\n    }\n}];"
  },
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [
    -3100,
    -800
  ],
  "id": extractNodeId,
  "name": "Extraer Proyecto y UTM"
};

if (!data.nodes.find(n => n.name === "Extraer Proyecto y UTM")) {
  data.nodes.push(extractNode);
}

// 2. Wire connections
if (data.connections["PARSE BODY"]) {
  data.connections["PARSE BODY"] = {
    "main": [
      [
        {
          "node": "Extraer Proyecto y UTM",
          "type": "main",
          "index": 0
        }
      ]
    ]
  };
}

data.connections["Extraer Proyecto y UTM"] = {
  "main": [
    [
      {
        "node": "ES ARCHIVO",
        "type": "main",
        "index": 0
      }
    ]
  ]
};

// 3. Update DATA to CREATE and DATA to UPDATE
const updateNodeAssignments = (nodeName) => {
  const node = data.nodes.find(n => n.name === nodeName);
  if (node && node.parameters && node.parameters.assignments && node.parameters.assignments.assignments) {
    const assignments = node.parameters.assignments.assignments;
    const projAssignment = assignments.find(a => a.name === "proyecto");
    if (projAssignment && nodeName === "DATA to CREATE") {
      projAssignment.value = "={{ $('CONTEXT 1').item.json.proyecto || $('Extraer Proyecto y UTM').item.json.extracted_campaign_data.proyecto_detectado }}";
    } else if (projAssignment && nodeName === "DATA to UPDATE") {
      projAssignment.value = "={{ $('CONTEXT 1').item.json.proyecto || $('Find User').item.json.proyecto || $('Extraer Proyecto y UTM').item.json.extracted_campaign_data.proyecto_detectado }}";
    }
    
    if (!assignments.find(a => a.name === "utm_source_crm")) {
      assignments.push({
        "id": nodeName === "DATA to CREATE" ? "u1" : "u2",
        "name": "utm_source_crm",
        "value": "={{ $('Extraer Proyecto y UTM').item.json.extracted_campaign_data.utm_source_crm }}",
        "type": "string"
      });
    }
    if (!assignments.find(a => a.name === "tag_medio")) {
      assignments.push({
        "id": nodeName === "DATA to CREATE" ? "t1" : "t2",
        "name": "tag_medio",
        "value": "={{ $('Extraer Proyecto y UTM').item.json.extracted_campaign_data.tag_medio }}",
        "type": "string"
      });
    }
  }
};

updateNodeAssignments("DATA to CREATE");
updateNodeAssignments("DATA to UPDATE");

// 4. Update System Prompt of Sof-IA
const principalNode = data.nodes.find(n => n.name === "PRINCIPAL");
if (principalNode && principalNode.parameters) {
  if (principalNode.parameters.options && principalNode.parameters.options.systemMessage) {
    let prompt = principalNode.parameters.options.systemMessage;
    if (!prompt.includes("proyecto_detectado")) {
      const ruleToAdd = "\\n\\n## NUEVA REGLA DE CAPTACIÓN ##\\nSi el campo `proyecto_detectado` viene vacío o null, la primera acción obligatoria del bot es preguntarle al prospecto cuál de los 5 proyectos (Vista Verde, Mariscal, Portales, Polanco, Soto Bosque) le interesa, antes de intentar cargar cualquier Knowledge Base.\\n";
      principalNode.parameters.options.systemMessage = prompt.replace("## ROL ##", ruleToAdd + "## ROL ##");
    }
  }
  
  if (principalNode.parameters.text) {
    if (!principalNode.parameters.text.includes("proyecto_detectado")) {
      principalNode.parameters.text += "\\nProyecto detectado: {{ $('Extraer Proyecto y UTM').item.json.extracted_campaign_data.proyecto_detectado || 'null' }}";
    }
  }
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log("Workflow updated successfully!");
