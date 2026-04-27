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

    let appointmentsReport = [];

    for (const project of projects) {
      const db = client.db(project.id);
      
      // Get appointments
      const appointments = await db.collection("appointments").find({}).toArray();
      
      for (const appt of appointments) {
        // Try to find the user details in the users collection
        const user = await db.collection("users").findOne({ 
          $or: [
            { user_id: appt.user_id },
            { phone: appt.phone },
            { email: appt.email }
          ]
        });

        appointmentsReport.push({
          projectName: project.name,
          name: user ? (user.name || user.nombre || user.whatsapp_name) : "N/A",
          phone: appt.phone || (user && user.phone) || "N/A",
          email: appt.email || (user && user.email) || "N/A",
          appointmentDate: appt.date,
          rooms: appt.room_quantity,
          intent: appt.intencion_compra === "V" ? "Vivir" : "Inversión",
          mode: appt.appointment_mode || "Presencial"
        });
      }
    }

    // Sort by date
    appointmentsReport.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

    console.log(JSON.stringify(appointmentsReport, null, 2));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
