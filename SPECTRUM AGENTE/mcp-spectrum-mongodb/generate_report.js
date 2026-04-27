import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    
    const projects = [
      { id: "ParqueMariscal", name: "Mariscal" },
      { id: "ParquePortales", name: "Portales" },
      { id: "ParqueVerde", name: "Vista Verde" }
    ];

    const startOfMonth = new Date("2026-04-01T00:00:00Z");
    
    let report = [];

    for (const project of projects) {
      const db = client.db(project.id);
      const allLeads = await db.collection("users").find({}).toArray();
      
      const filteredLeads = allLeads.filter(l => {
        const interactionDate = l.first_interaction || l.timestamp;
        if (!interactionDate) return false;
        const date = new Date(interactionDate);
        return date >= startOfMonth;
      });

      report.push({
        projectName: project.name,
        count: filteredLeads.length,
        leads: filteredLeads.map(l => ({
          name: l.name || l.nombre || l.whatsapp_name || "N/A",
          phone: l.phone || l.telefono || (l.CRM_Data && l.CRM_Data._TelefonoMovil) || "N/A",
          email: l.email || l.correo || (l.CRM_Data && l.CRM_Data._CorreEletronico) || "N/A",
          date: l.first_interaction || l.timestamp,
          status: l.has_reservation ? "Con Cita/Reserva" : "Interesado",
          interest: l.interest || l.resumen_breve || "N/A"
        }))
      });
    }

    console.log(JSON.stringify(report, null, 2));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
