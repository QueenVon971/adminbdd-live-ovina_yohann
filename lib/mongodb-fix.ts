import { MongoClient, ServerApiVersion } from "mongodb";

// Utiliser la variable d'environnement ou une URL de secours pour la connexion MongoDB
// Note: Il est préférable de toujours utiliser les variables d'environnement pour les informations sensibles
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ovina:Formation2024@admindonnees.oj3fqbt.mongodb.net/sample_mflix';

if (!MONGODB_URI) {
  throw new Error('Veuillez définir la variable d\'environnement MONGODB_URI');
}

// Créer un client MongoClient avec les options recommandées
const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  connectTimeoutMS: 30000,
});

// Variable globale pour stocker le client en mode développement
let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // Se connecter au client
    await client.connect();
    
    // Accéder à la base de données
    const db = client.db("sample_mflix");
    
    // Ping pour confirmer la connexion
    await db.command({ ping: 1 });
    console.log("Connexion à MongoDB établie avec succès!");
    
    // Mettre en cache le client et la DB
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error("Erreur de connexion à MongoDB:", error);
    throw error;
  }
}

// Fonction pour tester explicitement la connexion
export async function testConnection() {
  try {
    const { db } = await connectToDatabase();
    const collections = await db.listCollections().toArray();
    console.log("Collections disponibles:", collections.map((c: any) => c.name));
    return { success: true, message: "Connexion réussie", collections };
  } catch (error) {
    console.error("Erreur lors du test de connexion:", error);
    return { success: false, message: "Échec de connexion", error };
  }
}

// Export du client pour la rétrocompatibilité
export default client;
