// app/api/test-db/route.ts

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-fix';

/**
 * @swagger
 * /api/test-db:
 *   get:
 *     summary: Teste la connexion à la base de données
 *     description: Vérifie si la connexion à MongoDB fonctionne et renvoie les collections disponibles
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       500:
 *         description: Erreur de connexion
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Test direct avec l'URL hardcodée pour comparer
    const hardcodedUri = 'mongodb+srv://ovina:Formation2024@admindonnees.oj3fqbt.mongodb.net/sample_mflix';
    console.log('Test avec URI hardcodée:', hardcodedUri);

    // Afficher la valeur de process.env.MONGODB_URI (masquée pour la sécurité)
    const envUri = process.env.MONGODB_URI || '';
    const maskedUri = envUri.replace(/\/\/(.+?)@/, '//****:****@');
    console.log('URI depuis .env.local (masquée):', maskedUri);

    // Connexion à la base de données
    const { db } = await connectToDatabase();
    
    // Récupérer la liste des collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c: any) => c.name);
    
    // Vérifier si la collection 'movies' existe
    const hasMoviesCollection = collectionNames.includes('movies');
    
    return NextResponse.json({
      status: 200,
      message: 'Connexion à MongoDB réussie!',
      database: 'sample_mflix',
      collections: collectionNames,
      hasMoviesCollection,
      envVarPresent: !!process.env.MONGODB_URI
    });
  } catch (error: any) {
    console.error('Erreur de connexion à MongoDB:', error);
    return NextResponse.json(
      { 
        status: 500, 
        message: 'Erreur de connexion à MongoDB', 
        error: error.message,
        errorCode: error.code || 'UNKNOWN',
        envVarPresent: !!process.env.MONGODB_URI
      },
      { status: 500 }
    );
  }
}
