import { NextRequest, NextResponse } from 'next/server';
import { connectToTheaterDB } from '@/lib/mongodb-theaters';

/**
 * @swagger
 * /api/theaters:
 *   get:
 *     summary: Récupérer tous les théâtres
 *     description: Renvoie la liste de tous les théâtres disponibles dans la base de données
 *     tags:
 *       - Théâtres
 *     responses:
 *       200:
 *         description: Liste de théâtres récupérée avec succès
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
 *                     $ref: '#/components/schemas/Theater'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// GET /api/theaters
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToTheaterDB();
    const theaters = await db.collection('theaters').find({}).limit(50).toArray();
    return NextResponse.json({ status: 200, data: theaters });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des théâtres :', error);
    return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// POST /api/theaters
/**
 * @swagger
 * /api/theaters:
 *   post:
 *     summary: Créer un nouveau théâtre
 *     description: Ajoute un nouveau théâtre à la base de données
 *     tags:
 *       - Théâtres
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
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Théâtre créé avec succès
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
    const data = await request.json();
    if (!data.name) {
      return NextResponse.json({ status: 400, message: 'Bad Request', error: 'Le nom du théâtre est requis' }, { status: 400 });
    }

    const { db } = await connectToTheaterDB();
    const result = await db.collection('theaters').insertOne({
      name: data.name,
      address: data.address || {},
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
