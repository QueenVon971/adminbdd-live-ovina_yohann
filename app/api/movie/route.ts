// app/api/movie/route.ts

import { NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/direct-mongodb';
import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';

/**
 * @swagger
 * /api/movie:
 *   get:
 *     summary: Récupère un film par son ID
 *     description: Retourne les détails d'un film spécifique
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique du film
 *     responses:
 *       200:
 *         description: Détails du film
 *       400:
 *         description: ID invalide ou manquant
 *       404:
 *         description: Film non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Récupérer l'ID du film depuis les paramètres de requête
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Vérifier que l'ID est fourni
    if (!id) {
      return NextResponse.json(
        { status: 400, message: 'Bad Request', error: 'L\'ID du film est requis' },
        { status: 400 }
      );
    }

    // Valider le format de l'ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { status: 400, message: 'Bad Request', error: 'ID de film invalide' },
        { status: 400 }
      );
    }

    // Connexion à MongoDB
    const { db } = await connectToMongoDB();
    
    // Récupérer le film par son ID
    const movie = await db.collection('movies').findOne({ _id: new ObjectId(id) });

    if (!movie) {
      return NextResponse.json(
        { status: 404, message: 'Not Found', error: 'Film non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      data: movie
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du film par ID:', error);
    return NextResponse.json(
      { status: 500, message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/movie:
 *   post:
 *     summary: Crée un nouveau film
 *     description: Ajoute un nouveau film à la collection
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               year:
 *                 type: integer
 *               plot:
 *                 type: string
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *               cast:
 *                 type: array
 *                 items:
 *                   type: string
 *               directors:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Film créé avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur interne du serveur
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Récupérer les données du corps de la requête
    const data = await request.json();
    
    // Valider les données requises
    if (!data.title) {
      return NextResponse.json(
        { status: 400, message: 'Bad Request', error: 'Le titre du film est requis' },
        { status: 400 }
      );
    }
    
    // Connexion à MongoDB
    const { db } = await connectToMongoDB();
    
    // Préparer le document à insérer
    const movie = {
      title: data.title,
      year: data.year ? parseInt(data.year) : null,
      plot: data.plot || '',
      genres: Array.isArray(data.genres) ? data.genres : [],
      cast: Array.isArray(data.cast) ? data.cast : [],
      directors: Array.isArray(data.directors) ? data.directors : [],
      created_at: new Date()
    };
    
    // Insérer le film dans la base de données
    const result = await db.collection('movies').insertOne(movie);
    
    // Récupérer le film créé pour le retourner
    const createdMovie = await db.collection('movies').findOne({ _id: result.insertedId });
    
    return NextResponse.json(
      { status: 201, data: createdMovie },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erreur lors de la création du film:', error);
    return NextResponse.json(
      { status: 500, message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/movie:
 *   put:
 *     summary: Met à jour un film existant
 *     description: Modifie les informations d'un film existant
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique du film
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               year:
 *                 type: integer
 *               plot:
 *                 type: string
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *               cast:
 *                 type: array
 *                 items:
 *                   type: string
 *               directors:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Film mis à jour avec succès
 *       400:
 *         description: ID invalide ou données invalides
 *       404:
 *         description: Film non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // Récupérer l'ID du film depuis les paramètres de requête
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Vérifier que l'ID est fourni
    if (!id) {
      return NextResponse.json(
        { status: 400, message: 'Bad Request', error: 'L\'ID du film est requis' },
        { status: 400 }
      );
    }

    // Valider le format de l'ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { status: 400, message: 'Bad Request', error: 'ID de film invalide' },
        { status: 400 }
      );
    }

    // Récupérer les données du corps de la requête
    const data = await request.json();

    // Valider les données requises
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { status: 400, message: 'Bad Request', error: 'Aucune donnée fournie pour la mise à jour' },
        { status: 400 }
      );
    }

    // Connexion à MongoDB
    const { db } = await connectToMongoDB();

    // Vérifier si le film existe
    const existingMovie = await db.collection('movies').findOne({ _id: new ObjectId(id) });

    if (!existingMovie) {
      return NextResponse.json(
        { status: 404, message: 'Not Found', error: 'Film non trouvé' },
        { status: 404 }
      );
    }

    // Préparer les données à mettre à jour
    const updateData: Record<string, any> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.year !== undefined) updateData.year = data.year ? parseInt(data.year) : null;
    if (data.plot !== undefined) updateData.plot = data.plot;
    if (data.genres !== undefined) updateData.genres = Array.isArray(data.genres) ? data.genres : [];
    if (data.cast !== undefined) updateData.cast = Array.isArray(data.cast) ? data.cast : [];
    if (data.directors !== undefined) updateData.directors = Array.isArray(data.directors) ? data.directors : [];
    
    // Ajouter la date de mise à jour
    updateData.updated_at = new Date();

    // Mettre à jour le film
    await db.collection('movies').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Récupérer le film mis à jour
    const updatedMovie = await db.collection('movies').findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      status: 200,
      message: 'Film mis à jour avec succès',
      data: updatedMovie
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du film:', error);
    return NextResponse.json(
      { status: 500, message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/movie:
 *   delete:
 *     summary: Supprime un film
 *     description: Supprime un film par son ID
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique du film
 *     responses:
 *       200:
 *         description: Film supprimé avec succès
 *       400:
 *         description: ID invalide ou manquant
 *       404:
 *         description: Film non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Récupérer l'ID du film depuis les paramètres de requête
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Vérifier que l'ID est fourni
    if (!id) {
      return NextResponse.json(
        { status: 400, message: 'Bad Request', error: 'L\'ID du film est requis' },
        { status: 400 }
      );
    }

    // Valider le format de l'ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { status: 400, message: 'Bad Request', error: 'ID de film invalide' },
        { status: 400 }
      );
    }

    // Connexion à MongoDB
    const { db } = await connectToMongoDB();

    // Vérifier si le film existe
    const movie = await db.collection('movies').findOne({ _id: new ObjectId(id) });

    if (!movie) {
      return NextResponse.json(
        { status: 404, message: 'Not Found', error: 'Film non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer le film
    await db.collection('movies').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      status: 200,
      message: 'Film supprimé avec succès',
      data: { id }
    });
  } catch (error: any) {
    console.error('Erreur lors de la suppression du film:', error);
    return NextResponse.json(
      { status: 500, message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}
