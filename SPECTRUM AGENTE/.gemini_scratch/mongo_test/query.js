const { MongoClient } = require('mongodb');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = 'mongodb+srv://jorgecalderon_db_user:hvV2fwG1dGcWVuAT@cluster0.es7z0bi.mongodb.net/Centralizado';

async function main() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("Centralizado");
        const users = db.collection('users');

        const totalUsers = await users.countDocuments({});
        console.log(`Total records in 'users': ${totalUsers}`);

        const processedUsers = await users.countDocuments({
            conversation_analysis: true
        });
        console.log(`Users already processed (conversation_analysis = true): ${processedUsers}`);

        const pendingSync = await users.countDocuments({
            datos_completos: true,
            conversation_analysis: { $ne: true },
            proyecto: { $exists: true, $nin: [null, ""] }
        });
        console.log(`Users pending to be processed by this flow: ${pendingSync}`);

        // Get some info on those pending
        if (pendingSync > 0) {
            const pendingList = await users.find({
                datos_completos: true,
                conversation_analysis: { $ne: true },
                proyecto: { $exists: true, $nin: [null, ""] }
            }).toArray();
            
            console.log("\nSample of pending users:");
            pendingList.slice(0, 3).forEach(u => {
                console.log(`- ID: ${u._id}, Name: ${u.nombre}, Last Interaction: ${u.last_interaction}`);
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);
