const fs = require('fs');
const path = require('path');

const mappings = [
    { name: 'AGENT PRINCIPAL', local: 'Agente Unificado/AGENT PRINCIPAL.json', remote: 'C:/Users/Georgie/.gemini/antigravity/brain/5ff16071-cbb4-48c7-b0d2-60dda1afca4a/.system_generated/steps/214/output.txt' },
    { name: 'KB SEARCH', local: 'Agente Unificado/KB SEARCH.json', remote: 'C:/Users/Georgie/.gemini/antigravity/brain/5ff16071-cbb4-48c7-b0d2-60dda1afca4a/.system_generated/steps/219/output.txt' },
    { name: 'Lead Collector', local: 'Agente Unificado/Lead Collector.json', remote: 'C:/Users/Georgie/.gemini/antigravity/brain/5ff16071-cbb4-48c7-b0d2-60dda1afca4a/.system_generated/steps/220/output.txt' },
    { name: 'Notifications Master', local: 'Agente Unificado/Notifications Master.json', remote: 'C:/Users/Georgie/.gemini/antigravity/brain/5ff16071-cbb4-48c7-b0d2-60dda1afca4a/.system_generated/steps/221/output.txt' },
    { name: 'RSVP', local: 'Agente Unificado/RSVP.json', remote: 'C:/Users/Georgie/.gemini/antigravity/brain/5ff16071-cbb4-48c7-b0d2-60dda1afca4a/.system_generated/steps/222/output.txt' },
    { name: 'Send Media', local: 'Agente Unificado/Send Media.json', remote: 'C:/Users/Georgie/.gemini/antigravity/brain/5ff16071-cbb4-48c7-b0d2-60dda1afca4a/.system_generated/steps/223/output.txt' },
    { name: 'Sync_CRM', local: 'Agente Unificado/Sync_CRM.json', remote: 'C:/Users/Georgie/.gemini/antigravity/brain/5ff16071-cbb4-48c7-b0d2-60dda1afca4a/.system_generated/steps/224/output.txt' },
    { name: 'Vectorizar los KBs', local: 'Agente Unificado/Vectorizar los KBs.json', remote: 'C:/Users/Georgie/.gemini/antigravity/brain/5ff16071-cbb4-48c7-b0d2-60dda1afca4a/.system_generated/steps/286/output.txt' }
];

let totalIssues = 0;

function compareFlows(localFile, remoteFile, flowName) {
    console.log(`\n======================================================`);
    console.log(`AUDITING: ${flowName}`);
    console.log(`======================================================`);

    if (!fs.existsSync(localFile)) {
        console.log(`❌ ERROR: Local file not found: ${localFile}`);
        return;
    }
    if (!fs.existsSync(remoteFile)) {
        console.log(`❌ ERROR: Remote output file not found: ${remoteFile}`);
        return;
    }

    try {
        const d1 = JSON.parse(fs.readFileSync(remoteFile, 'utf8')); // SERVER (USER'S ACTUAL N8N)
        const d2 = JSON.parse(fs.readFileSync(localFile, 'utf8'));  // LOCAL

        // The remote file from get_workflow_details has the actual workflow in it
        // Depending on MCP output, it might be { nodes: [...], connections: {...} } 
        // or { id: "...", name: "...", nodes: [...] }
        const nodes1 = {};
        const remoteNodes = d1.workflow ? d1.workflow.nodes : d1.nodes;
        if (remoteNodes) remoteNodes.forEach(n => nodes1[n.name] = n);
        
        const nodes2 = {};
        if (d2.nodes) d2.nodes.forEach(n => nodes2[n.name] = n);

        let differences = 0;

        for (const name of Object.keys(nodes1)) {
            if (!nodes2[name]) {
                console.log(`⚠️ Node '${name}' exists in SERVER but missing in LOCAL`);
                differences++;
                continue;
            }
            const n1 = nodes1[name];
            const n2 = nodes2[name];
            
            const param1Str = JSON.stringify(n1.parameters);
            const param2Str = JSON.stringify(n2.parameters);
            
            if (param1Str !== param2Str) {
                console.log(`⚠️ Differences found in node: [${name}] parameters`);
                console.log(`--- SERVER: ${param1Str}`);
                console.log(`--- LOCAL : ${param2Str}`);
                differences++;
            }
        }

        for (const name of Object.keys(nodes2)) {
            if (!nodes1[name]) {
                console.log(`⚠️ Node '${name}' exists in LOCAL but missing in SERVER`);
                differences++;
            }
        }

        if (differences === 0) {
            console.log(`✅ PERFECT MATCH. The local code is exactly synced with the server.`);
        } else {
            console.log(`❌ FOUND ${differences} DIFFERENCES. Synchronization needed.`);
            totalIssues += differences;
        }

    } catch (e) {
        console.log(`❌ Failed to parse or compare JSON: ${e.message}`);
    }
}

for (const m of mappings) {
    compareFlows(m.local, m.remote, m.name);
}

console.log(`\n\n🎯 AUDIT COMPLETE. Total differences found across all flows: ${totalIssues}`);
