// app/api/simple-test/route.ts

import { NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/direct-mongodb';

export async function GET() {
  try {
    // Connexion à MongoDB
    const { db } = await connectToMongoDB();
    
    // Récupérer juste un seul document pour tester
    const movie = await db.collection('movies').findOne({});
    
    // Retourner une réponse simple
    return NextResponse.json({
      status: "success",
      data: movie ? { id: movie._id.toString(), title: movie.title } : null
    });
  } catch (error: any) {
    console.error('Erreur test:', error);
    return NextResponse.json(
      { 
        status: "error", 
        message: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
