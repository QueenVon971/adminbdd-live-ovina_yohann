// Fichier de test de connexion MongoDB
const { MongoClient } = require("mongodb");

// Chaîne de connexion MongoDB
const uri = "mongodb+srv://ovina:Formation2024@admindonnees.oj3fqbt.mongodb.net/sample_mflix";

// Créer un client MongoClient
const client = new MongoClient(uri);

async function run() {
  try {
    // Se connecter au client
    await client.connect();
    console.log("Connexion à MongoDB réussie!");
    
    // Vérifier les bases de données disponibles
    const adminDb = client.db("admin");
    const dbs = await adminDb.admin().listDatabases();
    
    console.log("Bases de données disponibles:");
    dbs.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    // Tester la base sample_mflix si elle existe
    const hasSampleMflix = dbs.databases.some(db => db.name === "sample_mflix");
    
    if (hasSampleMflix) {
      console.log("\nBase sample_mflix trouvée! Listage des collections:");
      const mflixDb = client.db("sample_mflix");
      const collections = await mflixDb.listCollections().toArray();
      collections.forEach(coll => {
        console.log(`- ${coll.name}`);
      });
    } else {
      console.log("\nAttention: La base sample_mflix n'existe pas!");
      console.log("Veuillez vérifier le nom de la base de données dans votre chaîne de connexion.");
    }
  } catch (err) {
    console.error("Erreur de connexion à MongoDB:", err);
  } finally {
    // Fermer la connexion
    await client.close();
  }
}

// Exécuter le test
run().catch(console.error);
