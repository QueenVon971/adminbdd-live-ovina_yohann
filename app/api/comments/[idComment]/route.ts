import { NextRequest, NextResponse } from 'next/server';
import { connectToTheaterDB } from '@/lib/mongodb-theaters';

/**
 * @swagger
 * /api/comments/{idComment}:
 *   get:
 *     summary: Récupérer un commentaire spécifique
 *     description: Renvoie les détails d'un commentaire spécifique par son ID
 *     tags:
 *       - Commentaires
 *     parameters:
 *       - in: path
 *         name: idComment
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB du commentaire
 *     responses:
 *       200:
 *         description: Commentaire récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Commentaire non trouvé
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
export async function GET(request: NextRequest, { params }: { params: { idComment: string } }) {
  try {
    const id = params.idComment;
    
    if (!id) {
      return NextResponse.json(
        { status: 400, message: 'Bad Request', error: 'ID du commentaire requis' },
        { status: 400 }
      );
    }
    
    const { ObjectId } = await import('mongodb');
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { status: 400, message: 'Bad Request', error: 'ID de commentaire invalide' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToTheaterDB();
    const comment = await db.collection('comments').findOne({ _id: new ObjectId(id) });
    
    if (!comment) {
      return NextResponse.json(
        { status: 404, message: 'Not Found', error: 'Commentaire non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ status: 200, data: comment });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du commentaire:', error);
    return NextResponse.json(
      { status: 500, message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/comments/{idComment}:
 *   put:
 *     summary: Mettre à jour un commentaire
 *     description: Met à jour un commentaire existant par son ID
 *     tags:
 *       - Commentaires
 *     parameters:
 *       - in: path
 *         name: idComment
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB du commentaire
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Commentaire mis à jour avec succès
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
 *       404:
 *         description: Commentaire non trouvé
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
export async function PUT(request: NextRequest, { params }: { params: { idComment: string } }) {
  try {
    const id = params.idComment;
    
    if (!id) {
      return NextResponse.json(
        { status: 400, message: 'Bad Request', error: 'ID du commentaire requis' },
        { status: 400 }
      );
    }
    
    const { ObjectId } = await import('mongodb');
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { status: 400, message: 'Bad Request', error: 'ID de commentaire invalide' },
        { status: 400 }
      );
    }
    
    const updateData = await request.json();
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { status: 400, message: 'Bad Request', error: 'Aucune donnée à mettre à jour' },
        { status: 400 }
      );
    }
    
    // On ne permet pas de changer l'ID du film associé ou la date
    const { movie_id, date, _id, ...allowedUpdates } = updateData;
    
    const { db } = await connectToTheaterDB();
    
    const updateResult = await db.collection('comments').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...allowedUpdates, updated_at: new Date() } }
    );
    
    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: 'Not Found', error: 'Commentaire non trouvé' },
        { status: 404 }
      );
    }
    
    const updatedComment = await db.collection('comments').findOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({
      status: 200,
      message: 'Commentaire mis à jour',
      data: updatedComment
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du commentaire:', error);
    return NextResponse.json(
      { status: 500, message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/comments/{idComment}:
 *   delete:
 *     summary: Supprimer un commentaire
 *     description: Supprime un commentaire spécifique par son ID
 *     tags:
 *       - Commentaires
 *     parameters:
 *       - in: path
 *         name: idComment
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB du commentaire
 *     responses:
 *       200:
 *         description: Commentaire supprimé avec succès
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
 *         description: Commentaire non trouvé
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
export async function DELETE(request: NextRequest, { params }: { params: { idComment: string } }) {
  try {
    const id = params.idComment;
    
    if (!id) {
      return NextResponse.json(
        { status: 400, message: 'Bad Request', error: 'ID du commentaire requis' },
        { status: 400 }
      );
    }
    
    const { ObjectId } = await import('mongodb');
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { status: 400, message: 'Bad Request', error: 'ID de commentaire invalide' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToTheaterDB();
    
    const result = await db.collection('comments').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { status: 404, message: 'Not Found', error: 'Commentaire non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      status: 200,
      message: 'Commentaire supprimé',
      deletedCount: result.deletedCount
    });
  } catch (error: any) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    return NextResponse.json(
      { status: 500, message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}
