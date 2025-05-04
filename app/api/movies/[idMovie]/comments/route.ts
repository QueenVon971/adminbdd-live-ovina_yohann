import { NextRequest, NextResponse } from 'next/server';
import { connectToTheaterDB } from '@/lib/mongodb-theaters';

/**
 * @swagger
 * /api/movies/{idMovie}/comments:
 *   get:
 *     summary: Récupérer tous les commentaires d'un film
 *     description: Renvoie la liste de tous les commentaires associés à un film spécifique
 *     tags:
 *       - Commentaires
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB du film
 *     responses:
 *       200:
 *         description: Liste de commentaires récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Paramètre invalide
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

// GET /api/movies/:idMovie/comments
export async function GET(request: NextRequest, { params }: { params: { idMovie: string } }) {
  try {
    const idMovie = params.idMovie;
    if (!idMovie) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID du film requis' }, { status: 400 });
    }
    const { ObjectId } = await import('mongodb');
    if (!ObjectId.isValid(idMovie)) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID de film invalide' }, { status: 400 });
    }
    const { db } = await connectToTheaterDB();
    const comments = await db.collection('comments').find({ movie_id: new ObjectId(idMovie) }).toArray();
    return NextResponse.json({ status: 200, data: comments });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des commentaires du film :', error);
    return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// POST /api/movies/:idMovie/comments
/**
 * @swagger
 * /api/movies/{idMovie}/comments:
 *   post:
 *     summary: Ajouter un commentaire à un film
 *     description: Crée un nouveau commentaire associé à un film spécifique
 *     tags:
 *       - Commentaires
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de l'auteur du commentaire
 *               email:
 *                 type: string
 *                 description: Email de l'auteur
 *                 format: email
 *               text:
 *                 type: string
 *                 description: Contenu du commentaire
 *             required:
 *               - name
 *               - text
 *     responses:
 *       201:
 *         description: Commentaire créé avec succès
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
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Paramètres invalides
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
export async function POST(request: NextRequest, { params }: { params: { idMovie: string } }) {
  try {
    const idMovie = params.idMovie;
    if (!idMovie) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID du film requis' }, { status: 400 });
    }
    const data = await request.json();
    if (!data.text || !data.name) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'Le texte et le nom sont requis' }, { status: 400 });
    }
    const { ObjectId } = await import('mongodb');
    if (!ObjectId.isValid(idMovie)) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID de film invalide' }, { status: 400 });
    }
    const { db } = await connectToTheaterDB();
    const result = await db.collection('comments').insertOne({
      movie_id: new ObjectId(idMovie),
      text: data.text,
      name: data.name,
      date: new Date()
    });
    const createdComment = await db.collection('comments').findOne({ _id: result.insertedId });
    return NextResponse.json({ status: 201, message: 'Commentaire créé', data: createdComment }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors de la création du commentaire :', error);
    return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
