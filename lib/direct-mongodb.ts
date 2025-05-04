import { MongoClient, Db, ServerApiVersion } from "mongodb";

// Chaîne de connexion directe avec les identifiants qui ont fonctionné
const uri = "mongodb+srv://ovina:Formation2024@admindonnees.oj3fqbt.mongodb.net/sample_mflix";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToMongoDB() {
  if (cachedClient && cachedDb) {
    console.log("Using cached database connection");
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // Options de connexion MongoDB
    const options = {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    };

    // Créer un nouveau client
    console.log("Creating new database connection");
    const client = new MongoClient(uri, options);
    
    // Se connecter au client
    await client.connect();
    
    // Accéder à la base de données sample_mflix
    const db = client.db("sample_mflix");
    
    // Ping pour confirmer la connexion
    await db.command({ ping: 1 });
    console.log("Successfully connected to MongoDB Atlas!");
    
    // Mettre en cache le client et la DB
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

// Fonction de test pour vérifier la connexion
export async function testMongoDB() {
  try {
    const { db } = await connectToMongoDB();
    const collections = await db.listCollections().toArray();
    return {
      success: true,
      collections: collections.map((c) => c.name),
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}
