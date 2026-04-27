import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const dbs = await client.db().admin().listDatabases();
    console.log("Databases found:");
    console.log(JSON.stringify(dbs.databases, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
