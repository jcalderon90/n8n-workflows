const fs = require('fs');
const path = require('path');

function patchSyncCrm() {
    const file = path.join(__dirname, '..', 'Agente Unificado', 'Sync_CRM.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const node = data.nodes.find(n => n.name === 'OpenAI Chat Model');
    if (node) {
        node.parameters.options = node.parameters.options || {};
        node.parameters.options.temperature = 0.3;
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
        console.log('Patched Sync_CRM.json');
    }
}

function patchAgentPrincipal() {
    const file = path.join(__dirname, '..', 'Agente Unificado', 'AGENT PRINCIPAL.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    // 1. Notifications Master Nuevos Leads
    const notifNode = data.nodes.find(n => n.name === "'Notifications Master' Nuevos Leads");
    if (notifNode) {
        notifNode.parameters.workflowInputs.value.datos = `={{ \n  {\n    "proyecto": $('User Data').item.json.proyecto || 'Parque Vista Verde',\n    "nombre_lead": $json.nombre || 'No registrado',\n    "telefono_lead": $json.telefono || $('Parse response').item.json.lead_telefono,\n    "correo_lead": $json.correo || 'No registrado',\n    "canal": $('User Data').item.json.input_channel\n  }\n}}`;
        console.log("Patched 'Notifications Master Nuevos Leads' node in AGENT PRINCIPAL.json");
    }

    // 2. UPDATE - Proyecto Interes
    const updateProyectoNode = data.nodes.find(n => n.name === 'UPDATE - Proyecto Interes');
    if (updateProyectoNode) {
        updateProyectoNode.parameters.url = '=https://api.manychat.com/fb/subscriber/setCustomFieldByName';
        console.log("Patched 'UPDATE - Proyecto Interes' node in AGENT PRINCIPAL.json");
    }

    // 3. UPDATE - UTM Source
    const updateUtmNode = data.nodes.find(n => n.name === 'UPDATE - UTM Source');
    if (updateUtmNode) {
        updateUtmNode.parameters.url = '=https://api.manychat.com/fb/subscriber/setCustomFieldByName';
        console.log("Patched 'UPDATE - UTM Source' node in AGENT PRINCIPAL.json");
    }

    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

patchSyncCrm();
patchAgentPrincipal();
