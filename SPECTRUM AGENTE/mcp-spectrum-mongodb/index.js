import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is required");
}

const client = new MongoClient(MONGODB_URI);

async function connectToDatabase() {
  try {
    await client.connect();
    console.error("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
}

const server = new Server(
  {
    name: "spectrum-mongodb-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_databases",
        description: "List all databases in the Spectrum cluster",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "list_collections",
        description: "List all collections in a specific database",
        inputSchema: {
          type: "object",
          properties: {
            dbName: { type: "string", description: "The name of the database" },
          },
          required: ["dbName"],
        },
      },
      {
        name: "find_documents",
        description: "Find documents in a collection",
        inputSchema: {
          type: "object",
          properties: {
            dbName: { type: "string", description: "The name of the database" },
            collectionName: { type: "string", description: "The name of the collection" },
            filter: { type: "object", description: "MongoDB filter object" },
            limit: { type: "number", description: "Maximum number of documents to return", default: 10 },
          },
          required: ["dbName", "collectionName"],
        },
      },
      {
        name: "aggregate",
        description: "Run an aggregation pipeline on a collection",
        inputSchema: {
          type: "object",
          properties: {
            dbName: { type: "string", description: "The name of the database" },
            collectionName: { type: "string", description: "The name of the collection" },
            pipeline: { type: "array", description: "MongoDB aggregation pipeline (array of stages)" },
          },
          required: ["dbName", "collectionName", "pipeline"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_databases": {
        const result = await client.db().admin().listDatabases();
        return {
          content: [{ type: "text", text: JSON.stringify(result.databases, null, 2) }],
        };
      }

      case "list_collections": {
        const collections = await client.db(args.dbName).listCollections().toArray();
        return {
          content: [{ type: "text", text: JSON.stringify(collections, null, 2) }],
        };
      }

      case "find_documents": {
        const filter = args.filter || {};
        const limit = args.limit || 10;
        const documents = await client
          .db(args.dbName)
          .collection(args.collectionName)
          .find(filter)
          .limit(limit)
          .toArray();
        return {
          content: [{ type: "text", text: JSON.stringify(documents, null, 2) }],
        };
      }

      case "aggregate": {
        const documents = await client
          .db(args.dbName)
          .collection(args.collectionName)
          .aggregate(args.pipeline)
          .toArray();
        return {
          content: [{ type: "text", text: JSON.stringify(documents, null, 2) }],
        };
      }

      default:
        throw new Error(`Tool not found: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function main() {
  await connectToDatabase();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Spectrum MCP MongoDB server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
