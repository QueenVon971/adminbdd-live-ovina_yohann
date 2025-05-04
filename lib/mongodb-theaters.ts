import { MongoClient, ServerApiVersion, Db } from "mongodb";

// URI de connexion en dur (hardcoded) pour éviter les problèmes d'authentification
// Note: En production, il serait préférable d'utiliser des variables d'environnement
const uri = "mongodb+srv://ovina:Formation2024@admindonnees.oj3fqbt.mongodb.net/sample_mflix?retryWrites=true&w=majority";

// Variables pour la mise en cache de la connexion
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Fonction pour se connecter à MongoDB et accéder à la collection theaters
 */
export async function connectToTheaterDB() {
  if (cachedClient && cachedDb) {
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
      maxPoolSize: 10,
      connectTimeoutMS: 30000,
    };

    // Créer un nouveau client
    console.log("Creating new connection to MongoDB Atlas...");
    const client = new MongoClient(uri, options);
    
    // Se connecter au client
    await client.connect();
    
    // Accéder à la base de données sample_mflix
    const db = client.db("sample_mflix");
    
    // Vérifier si la collection theaters existe, sinon la créer
    const collections = await db.listCollections({ name: "theaters" }).toArray();
    if (collections.length === 0) {
      console.log("Creating theaters collection...");
      await db.createCollection("theaters");
    }
    
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

// Fonction pour tester la connexion et vérifier si la collection theaters existe
export async function testTheatersCollection() {
  try {
    const { db } = await connectToTheaterDB();
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    
    if (collectionNames.includes('theaters')) {
      const count = await db.collection('theaters').countDocuments();
      return {
        success: true,
        message: `Connection successful. Found theaters collection with ${count} documents.`,
        collections: collectionNames
      };
    } else {
      return {
        success: false,
        message: "Connection successful but theaters collection not found.",
        collections: collectionNames
      };
    }
  } catch (error) {
    console.error("Error testing connection:", error);
    return {
      success: false,
      message: "Connection failed",
      error: (error as Error).message
    };
  }
}

// Export du module pour utilisation dans les API routes
export default { connectToTheaterDB, testTheatersCollection };
