"use server";

import client from "@/lib/mongodb";

export async function testDatabaseConnection() {
  let isConnected = false;
  try {
    const mongoClient = await client.connect();
    // Send a ping to confirm a successful connection
    await mongoClient.db("admin").command({ ping: 1 });
    
    // Vérifier que nous pouvons accéder aux collections nécessaires
    const db = mongoClient.db();
    const collections = await db.listCollections().toArray();
    
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
      "Collections disponibles:", collections.map(c => c.name).join(", ")
    );
    
    return true; // Connexion réussie
  } catch (e) {
    console.error("Erreur de connexion à MongoDB:", e);
    return false; // Échec de connexion
  }
}
