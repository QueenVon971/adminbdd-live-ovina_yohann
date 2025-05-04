import { NextRequest, NextResponse } from 'next/server';
import { connectToTheaterDB } from '@/lib/mongodb-theaters';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idMovie = searchParams.get('idMovie');
    const idComment = searchParams.get('idComment');
    if (!idMovie || !idComment) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID du film et du commentaire requis' }, { status: 400 });
    }
    const { ObjectId } = await import('mongodb');
    if (!ObjectId.isValid(idMovie) || !ObjectId.isValid(idComment)) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID de film ou de commentaire invalide' }, { status: 400 });
    }
    const { db } = await connectToTheaterDB();
    const comment = await db.collection('comments').findOne({ _id: new ObjectId(idComment), movie_id: new ObjectId(idMovie) });
    if (!comment) {
      return NextResponse.json({ status: 404, message: 'Not Found', error: 'Commentaire non trouvé' }, { status: 404 });
    }
    return NextResponse.json({ status: 200, data: comment });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du commentaire :', error);
    return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idMovie = searchParams.get('idMovie');
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

/**
 * @swagger
 * /api/movies/{idMovie}/comments/{idComment}:
 *   put:
 *     summary: Mettre à jour un commentaire
 *     description: Met à jour le texte d'un commentaire spécifique
 *     tags:
 *       - Commentaires
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB du film
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
 *               text:
 *                 type: string
 *                 description: Nouveau texte du commentaire
 *             required:
 *               - text
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
 *         description: Commentaire ou film non trouvé
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
export async function PUT(request: NextRequest, { params }: { params: { idMovie: string, idComment: string } }) {
  try {
    console.log('PUT Comment - Début de la fonction');
    const idMovie = params.idMovie;
    const idComment = params.idComment;
    console.log('PUT Comment - IDs reçus:', { idMovie, idComment });
    
    if (!idMovie || !idComment) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID du film et du commentaire requis' }, { status: 400 });
    }
    
    const data = await request.json();
    console.log('PUT Comment - Données reçues:', data);
    
    if (!data.text) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'Le texte du commentaire est requis' }, { status: 400 });
    }
    
    const { ObjectId } = await import('mongodb');
    if (!ObjectId.isValid(idMovie) || !ObjectId.isValid(idComment)) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID de film ou de commentaire invalide' }, { status: 400 });
    }
    
    const { db } = await connectToTheaterDB();
    console.log('PUT Comment - Connexion DB établie');
    
    // Essayer de mettre à jour directement
    const updateResult = await db.collection('comments').updateOne(
      { 
        _id: new ObjectId(idComment),
        movie_id: new ObjectId(idMovie)
      },
      { $set: { text: data.text, date: new Date() } }
    );
    
    console.log('PUT Comment - Résultat de la mise à jour:', updateResult);
    
    if (updateResult.matchedCount === 0) {
      // Essayons avec différentes combinaisons d'ID
      console.log('PUT Comment - Essai avec différentes combinaisons d\'ID');
      const attempts = [
        // Essai avec les deux IDs en chaîne
        { _id: idComment as any, movie_id: idMovie as any },
        // Essai avec movie_id en chaîne
        { _id: new ObjectId(idComment), movie_id: idMovie as any },
        // Essai avec _id en chaîne
        { _id: idComment as any, movie_id: new ObjectId(idMovie) }
      ];
      
      let matched = false;
      for (const query of attempts) {
        console.log('PUT Comment - Essai avec la requête:', query);
        const attempt = await db.collection('comments').updateOne(
          query,
          { $set: { text: data.text, date: new Date() } }
        );
        
        if (attempt.matchedCount > 0) {
          console.log('PUT Comment - Tentative réussie avec:', query);
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        return NextResponse.json({ 
          status: 404, 
          message: 'Not Found', 
          error: 'Commentaire non trouvé',
          debug: { 
            idMovie, 
            idComment, 
            movieObjectId: new ObjectId(idMovie).toString(),
            commentObjectId: new ObjectId(idComment).toString()
          }
        }, { status: 404 });
      }
    }
    
    // Récupérer le commentaire mis à jour
    const updatedComment = await db.collection('comments').findOne({ 
      $or: [
        // Toutes les combinaisons possibles
        { _id: new ObjectId(idComment), movie_id: new ObjectId(idMovie) },
        { _id: idComment as any, movie_id: idMovie as any },
        { _id: new ObjectId(idComment), movie_id: idMovie as any },
        { _id: idComment as any, movie_id: new ObjectId(idMovie) }
      ]
    });
    
    return NextResponse.json({ 
      status: 200, 
      message: 'Commentaire mis à jour', 
      data: updatedComment,
      updateInfo: {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount
      }
    });
  } catch (error: any) {
    console.error('Erreur lors de la modification du commentaire :', error);
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
 * /api/movies/{idMovie}/comments/{idComment}:
 *   delete:
 *     summary: Supprimer un commentaire
 *     description: Supprime un commentaire spécifique
 *     tags:
 *       - Commentaires
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB du film
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
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Commentaire ou film non trouvé
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
export async function DELETE(request: NextRequest, { params }: { params: { idMovie: string, idComment: string } }) {
  try {
    const idMovie = params.idMovie;
    const idComment = params.idComment;
    if (!idMovie || !idComment) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID du film et du commentaire requis' }, { status: 400 });
    }
    const { ObjectId } = await import('mongodb');
    if (!ObjectId.isValid(idMovie) || !ObjectId.isValid(idComment)) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID de film ou de commentaire invalide' }, { status: 400 });
    }
    const { db } = await connectToTheaterDB();
    const result = await db.collection('comments').deleteOne({ _id: new ObjectId(idComment), movie_id: new ObjectId(idMovie) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ status: 404, message: 'Not Found', error: 'Commentaire non trouvé' }, { status: 404 });
    }
    return NextResponse.json({ status: 200, message: 'Commentaire supprimé', deletedCount: result.deletedCount });
  } catch (error: any) {
    console.error('Erreur lors de la suppression du commentaire :', error);
    return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
