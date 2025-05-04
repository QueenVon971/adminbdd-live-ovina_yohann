import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

// Options améliorées pour MongoDB Atlas
const options = {
  appName: "films-api-nextjs",
  retryWrites: true,
  maxPoolSize: 10,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
};

let client: MongoClient;

if (process.env.NODE_ENV === "development") {
  // En mode développement, utiliser une variable globale pour que la valeur
  // soit préservée entre les rechargements de modules (HMR).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
  };

  if (!globalWithMongo._mongoClient) {
    console.log("Connecting to MongoDB in development mode...");
    globalWithMongo._mongoClient = new MongoClient(uri, options);
  }
  client = globalWithMongo._mongoClient;
} else {
  // En production, il est préférable de ne pas utiliser une variable globale.
  console.log("Connecting to MongoDB in production mode...");
  client = new MongoClient(uri, options);
}

// Exporter un MongoClient de portée module. En faisant cela dans un
// module séparé, le client peut être partagé entre les fonctions.

export default client;
