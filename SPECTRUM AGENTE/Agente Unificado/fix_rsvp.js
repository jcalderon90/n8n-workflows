const fs = require('fs');

const path = './Principal.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const rsvpNode = data.nodes.find(n => n.name === 'rsvp');

if (rsvpNode) {
    if (!rsvpNode.parameters.description) {
        rsvpNode.parameters.description = "=Función: Iniciar, recopilar o completar el agendamiento de una cita presencial o llamada. Úsala de inmediato si el cliente pide visitar una sala de ventas o agendar una cita/llamada. O si, luego de que tú ofrecieras una cita, el usuario responde afirmativamente (\"sí me parece\", \"dale\"). \nParámetro principal requerido que debes generar: proyecto (Código del proyecto pvv, pm o pp).";

        fs.writeFileSync(path, JSON.stringify(data, null, 2));
        console.log('Descripción añadida a rsvp');
    } else {
        console.log('rsvp ya tiene descripción');
    }
} else {
    console.log('nodo rsvp no encontrado');
}