import { NextRequest, NextResponse } from 'next/server';
import { connectToTheaterDB } from '@/lib/mongodb-theaters';

/**
 * @swagger
 * /api/theaters/{idTheater}:
 *   get:
 *     summary: Récupérer un théâtre spécifique
 *     description: Renvoie les détails d'un théâtre spécifique par son ID
 *     tags:
 *       - Théâtres
 *     parameters:
 *       - in: path
 *         name: idTheater
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB du théâtre
 *     responses:
 *       200:
 *         description: Détails du théâtre récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 data:
 *                   $ref: '#/components/schemas/Theater'
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Théâtre non trouvé
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

/**
 * Récupère un théâtre spécifique par son ID.
 * 
 * @param {NextRequest} request - La requête HTTP.
 * @param {Object} params - Les paramètres de la requête, incluant l'ID du théâtre.
 * @returns {NextResponse} La réponse HTTP contenant les détails du théâtre.
 */
export async function GET(request: NextRequest, { params }: { params: { idTheater: string } }) {
  try {
    const id = params.idTheater;
    if (!id) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID du théâtre requis' }, { status: 400 });
    }
    const { ObjectId } = await import('mongodb');
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID de théâtre invalide' }, { status: 400 });
    }
    const { db } = await connectToTheaterDB();
    const theater = await db.collection('theaters').findOne({ _id: new ObjectId(id) });
    if (!theater) {
      return NextResponse.json({ status: 404, message: 'Not Found', error: 'Théâtre non trouvé' }, { status: 404 });
    }
    return NextResponse.json({ status: 200, data: theater });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du théâtre :', error);
    return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.name) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'Le nom du théâtre est requis' }, { status: 400 });
    }

    const { db } = await connectToTheaterDB();
    const result = await db.collection('theaters').insertOne({
      name: data.name,
      address: data.address || '',
      location: data.location || null,
      created_at: new Date()
    });
    const createdTheater = await db.collection('theaters').findOne({ _id: result.insertedId });
    return NextResponse.json({ status: 201, message: 'Théâtre créé', data: createdTheater }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors de la création du théâtre :', error);
    return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/theaters/{idTheater}:
 *   put:
 *     summary: Mettre à jour un théâtre spécifique
 *     description: Met à jour les informations d'un théâtre spécifique par son ID
 *     tags:
 *       - Théâtres
 *     parameters:
 *       - in: path
 *         name: idTheater
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB du théâtre
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du théâtre
 *               address:
 *                 type: object
 *                 properties:
 *                   street1:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipcode:
 *                     type: string
 *     responses:
 *       200:
 *         description: Théâtre mis à jour avec succès
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
 *                   $ref: '#/components/schemas/Theater'
 *                 updateInfo:
 *                   type: object
 *                   properties:
 *                     matchedCount:
 *                       type: integer
 *                     modifiedCount:
 *                       type: integer
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Théâtre non trouvé
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
export async function PUT(request: NextRequest, { params }: { params: { idTheater: string } }) {
  try {
    console.log('PUT Theater - Début de la fonction');
    const id = params.idTheater;
    console.log('PUT Theater - ID reçu:', id);
    
    if (!id) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID du théâtre requis' }, { status: 400 });
    }
    
    const data = await request.json();
    console.log('PUT Theater - Données reçues:', data);
    
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'Aucune donnée à mettre à jour' }, { status: 400 });
    }
    
    const { ObjectId } = await import('mongodb');
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID de théâtre invalide' }, { status: 400 });
    }
    
    const { db } = await connectToTheaterDB();
    console.log('PUT Theater - Connexion DB établie');
    
    // Essayer de mettre à jour directement, sans vérification préalable
    const updateResult = await db.collection('theaters').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...data, updated_at: new Date() } }
    );
    
    console.log('PUT Theater - Résultat de la mise à jour:', updateResult);
    
    if (updateResult.matchedCount === 0) {
      // Essayons avec l'ID sous forme de chaîne au cas où
      console.log('PUT Theater - Essai avec ID en chaîne');
      const secondAttempt = await db.collection('theaters').updateOne(
        { _id: id as any },
        { $set: { ...data, updated_at: new Date() } }
      );
      
      console.log('PUT Theater - Deuxième tentative:', secondAttempt);
      
      if (secondAttempt.matchedCount === 0) {
        return NextResponse.json({ 
          status: 404, 
          message: 'Not Found', 
          error: 'Théâtre non trouvé',
          debug: { id, objectId: new ObjectId(id).toString() }
        }, { status: 404 });
      }
    }
    
    // Récupérer le théâtre mis à jour
    const updatedTheater = await db.collection('theaters').findOne({ 
      $or: [
        { _id: new ObjectId(id) },
        { _id: id as any }
      ]
    });
    
    return NextResponse.json({ 
      status: 200, 
      message: 'Théâtre mis à jour', 
      data: updatedTheater,
      updateInfo: {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount
      }
    });
  } catch (error: any) {
    console.error('Erreur lors de la modification du théâtre :', error);
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
 * /api/theaters/{idTheater}:
 *   delete:
 *     summary: Supprimer un théâtre spécifique
 *     description: Supprime un théâtre spécifique par son ID
 *     tags:
 *       - Théâtres
 *     parameters:
 *       - in: path
 *         name: idTheater
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB du théâtre
 *     responses:
 *       200:
 *         description: Théâtre supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: integer
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Théâtre non trouvé
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
export async function DELETE(request: NextRequest, { params }: { params: { idTheater: string } }) {
  try {
    const id = params.idTheater;
    if (!id) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID du théâtre requis' }, { status: 400 });
    }
    const { ObjectId } = await import('mongodb');
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'ID de théâtre invalide' }, { status: 400 });
    }
    const { db } = await connectToTheaterDB();
    const result = await db.collection('theaters').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ status: 404, message: 'Not Found', error: 'Théâtre non trouvé' }, { status: 404 });
    }
    return NextResponse.json({ status: 200, message: 'Théâtre supprimé', deletedCount: result.deletedCount });
  } catch (error: any) {
    console.error('Erreur lors de la suppression du théâtre :', error);
    return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
