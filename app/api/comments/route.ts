import { NextRequest, NextResponse } from 'next/server';
import { connectToTheaterDB } from '@/lib/mongodb-theaters';

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Récupérer tous les commentaires
 *     description: Renvoie la liste des commentaires avec pagination et filtres optionnels
 *     tags:
 *       - Commentaires
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page pour la pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre de commentaires par page
 *       - in: query
 *         name: movie_id
 *         schema:
 *           type: string
 *         description: Filtrer les commentaires par ID de film (optionnel)
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
 *                 meta:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const movieId = searchParams.get('movie_id');

    if (page < 1) {
      return NextResponse.json(
        { status: 400, message: 'Bad Request', error: 'Le paramètre "page" doit être un nombre positif' },
        { status: 400 }
      );
    }

    const { db } = await connectToTheaterDB();

    const query: Record<string, any> = {};
    if (movieId) {
      const { ObjectId } = await import('mongodb');
      if (ObjectId.isValid(movieId)) {
        query.movie_id = new ObjectId(movieId);
      } else {
        return NextResponse.json(
          { status: 400, message: 'Bad Request', error: 'ID de film invalide' },
          { status: 400 }
        );
      }
    }

    const skip = (page - 1) * limit;

    const totalDocuments = await db.collection('comments').countDocuments(query);
    const totalPages = Math.ceil(totalDocuments / limit);

    const comments = await db.collection('comments')
      .find(query)
      .skip(skip)
      .limit(limit > 0 ? limit : 10)
      .toArray();

    const baseUrl = new URL(request.url).origin + '/api/comments';
    const paginationLinks = {
      first: `${baseUrl}?page=1&limit=${limit}${movieId ? `&movie_id=${movieId}` : ''}`,
      last: totalPages > 0 ? `${baseUrl}?page=${totalPages}&limit=${limit}${movieId ? `&movie_id=${movieId}` : ''}` : null,
      next: page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}${movieId ? `&movie_id=${movieId}` : ''}` : null,
      prev: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}${movieId ? `&movie_id=${movieId}` : ''}` : null
    };

    return NextResponse.json({
      status: 200,
      data: comments,
      meta: {
        currentPage: page,
        totalPages,
        totalItems: totalDocuments,
        itemsPerPage: limit
      },
      links: paginationLinks
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Créer un nouveau commentaire
 *     description: Ajoute un nouveau commentaire dans la base de données
 *     tags:
 *       - Commentaires
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - text
 *               - movie_id
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de l'utilisateur qui commente
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de l'utilisateur
 *               text:
 *                 type: string
 *                 description: Contenu du commentaire
 *               movie_id:
 *                 type: string
 *                 description: ID MongoDB du film associé
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
 *         description: Requête invalide
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
export async function POST(request: NextRequest) {
  try {
    const commentData = await request.json();
    
    // Validation des données
    if (!commentData.name || !commentData.email || !commentData.text || !commentData.movie_id) {
      return NextResponse.json({
        status: 400,
        message: 'Bad Request',
        error: 'Les champs name, email, text et movie_id sont requis'
      }, { status: 400 });
    }
    
    const { ObjectId } = await import('mongodb');
    
    // Valider l'ID du film
    if (!ObjectId.isValid(commentData.movie_id)) {
      return NextResponse.json({
        status: 400,
        message: 'Bad Request',
        error: 'ID de film invalide'
      }, { status: 400 });
    }
    
    // Préparer le document à insérer
    const newComment = {
      name: commentData.name,
      email: commentData.email,
      text: commentData.text,
      movie_id: new ObjectId(commentData.movie_id),
      date: new Date()
    };
    
    const { db } = await connectToTheaterDB();
    
    // Note: Nous n'effectuons plus de vérification d'existence du film
    // car la structure de la base de données sample_mflix peut varier et 
    // les commentaires sont stockés dans une collection distincte
    
    // Insérer le commentaire
    const result = await db.collection('comments').insertOne(newComment);
    
    // Récupérer le commentaire complet
    const insertedComment = await db.collection('comments').findOne({ _id: result.insertedId });
    
    return NextResponse.json({
      status: 201,
      message: 'Commentaire créé',
      data: insertedComment
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Erreur lors de la création du commentaire:', error);
    return NextResponse.json({
      status: 500,
      message: 'Internal Server Error',
      error: error.message
    }, { status: 500 });
  }
}
