// app/api/test-db-direct/route.ts

import { NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/direct-mongodb';

/**
 * @swagger
 * /api/test-db-direct:
 *   get:
 *     summary: Teste la connexion directe à MongoDB
 *     description: Utilise une connexion directe avec des identifiants hardcodés
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       500:
 *         description: Erreur de connexion
 */
export async function GET(): Promise<NextResponse> {
  try {
    console.log("Tentative de connexion directe à MongoDB...");
    const { db } = await connectToMongoDB();
    
    // Récupérer les collections disponibles
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c: any) => c.name);
    
    // Récupérer un échantillon de films pour vérifier l'accès aux données
    const movies = await db.collection('movies').find({}).limit(2).toArray();
    
    return NextResponse.json({
      status: 200,
      message: 'Connexion directe à MongoDB réussie!',
      database: 'sample_mflix',
      collections: collectionNames,
      sampleMovies: movies.map(movie => ({
        _id: movie._id,
        title: movie.title,
        year: movie.year
      }))
    });
  } catch (error: any) {
    console.error('Erreur de connexion directe à MongoDB:', error);
    return NextResponse.json(
      { 
        status: 500, 
        message: 'Erreur de connexion à MongoDB', 
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
