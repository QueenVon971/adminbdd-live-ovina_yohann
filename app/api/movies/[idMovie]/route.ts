import { NextRequest, NextResponse } from 'next/server';
import { connectToTheaterDB } from '@/lib/mongodb-theaters';

/**
 * @swagger
 * /api/movies/{idMovie}:
 *   get:
 *     summary: Récupérer un film spécifique
 *     description: Renvoie les détails d'un film spécifique par son ID
 *     tags:
 *       - Films
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB du film
 *     responses:
 *       200:
 *         description: Détails du film récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 data:
 *                   $ref: '#/components/schemas/Movie'
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Film non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// GET /api/movies/[idMovie]
export async function GET(request: NextRequest, { params }: { params: { idMovie: string } }) {
  try {
    const id = params.idMovie;
    if (!id) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID du film requis' }, { status: 400 });
    }
    const { ObjectId } = await import('mongodb');
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID de film invalide' }, { status: 400 });
    }
    const { db } = await connectToTheaterDB();
    const movie = await db.collection('movies').findOne({ _id: new ObjectId(id) });
    if (!movie) {
      return NextResponse.json({ status: 404, message: 'Not Found', error: 'Film non trouvé' }, { status: 404 });
    }
    return NextResponse.json({ status: 200, data: movie });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du film :', error);
    return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/movies/{idMovie}:
 *   put:
 *     summary: Mettre à jour un film spécifique
 *     description: Met à jour les informations d'un film spécifique par son ID
 *     tags:
 *       - Films
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB du film
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       200:
 *         description: Film mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Film non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function PUT(request: NextRequest, { params }: { params: { idMovie: string } }) {
  try {
    console.log('PUT Movie - Début de la fonction');
    const id = params.idMovie;
    console.log('PUT Movie - ID reçu:', id);
    
    if (!id) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID du film requis' }, { status: 400 });
    }
    
    const data = await request.json();
    console.log('PUT Movie - Données reçues:', data);
    
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'Aucune donnée à mettre à jour' }, { status: 400 });
    }
    
    const { ObjectId } = await import('mongodb');
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID de film invalide' }, { status: 400 });
    }
    
    const { db } = await connectToTheaterDB();
    console.log('PUT Movie - Connexion DB établie');
    
    // Essayer de mettre à jour directement
    const updateResult = await db.collection('movies').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...data, updated_at: new Date() } }
    );
    
    console.log('PUT Movie - Résultat de la mise à jour:', updateResult);
    
    if (updateResult.matchedCount === 0) {
      // Essayons avec l'ID sous forme de chaîne au cas où
      console.log('PUT Movie - Essai avec ID en chaîne');
      const secondAttempt = await db.collection('movies').updateOne(
        { _id: id as any },
        { $set: { ...data, updated_at: new Date() } }
      );
      
      console.log('PUT Movie - Deuxième tentative:', secondAttempt);
      
      if (secondAttempt.matchedCount === 0) {
        return NextResponse.json({ 
          status: 404, 
          message: 'Not Found', 
          error: 'Film non trouvé',
          debug: { id, objectId: new ObjectId(id).toString() }
        }, { status: 404 });
      }
    }
    
    // Récupérer le film mis à jour
    const updatedMovie = await db.collection('movies').findOne({ 
      $or: [
        { _id: new ObjectId(id) },
        { _id: id as any }
      ]
    });
    
    return NextResponse.json({ 
      status: 200, 
      message: 'Film mis à jour', 
      data: updatedMovie,
      updateInfo: {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount
      }
    });
  } catch (error: any) {
    console.error('Erreur lors de la modification du film :', error);
    return NextResponse.json({ 
      status: 500, 
      message: 'Internal Server Error', 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/movies/{idMovie}:
 *   delete:
 *     summary: Supprimer un film spécifique
 *     description: Supprime un film spécifique par son ID
 *     tags:
 *       - Films
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB du film
 *     responses:
 *       200:
 *         description: Film supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Film non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function DELETE(request: NextRequest, { params }: { params: { idMovie: string } }) {
  try {
    const id = params.idMovie;
    if (!id) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID du film requis' }, { status: 400 });
    }
    const { ObjectId } = await import('mongodb');
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID de film invalide' }, { status: 400 });
    }
    const { db } = await connectToTheaterDB();
    const result = await db.collection('movies').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ status: 404, message: 'Not Found', error: 'Film non trouvé' }, { status: 404 });
    }
    return NextResponse.json({ status: 200, message: 'Film supprimé', deletedCount: result.deletedCount });
  } catch (error: any) {
    console.error('Erreur lors de la suppression du film :', error);
    return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
