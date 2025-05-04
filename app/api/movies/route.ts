// app/api/movies/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToTheaterDB } from '@/lib/mongodb-theaters';

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Récupérer tous les films
 *     description: Renvoie la liste de tous les films disponibles dans la base de données
 *     tags:
 *       - Films
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Nombre de films à retourner
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Terme de recherche pour filtrer les films par titre
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [title_asc, title_desc, year_asc, year_desc]
 *         description: Ordre de tri (par titre ou année, ascendant ou descendant)
 *     responses:
 *       200:
 *         description: Liste de films récupérée avec succès
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
 *                     $ref: '#/components/schemas/Movie'
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
 *                 links:
 *                   type: object
 *                   properties:
 *                     first:
 *                       type: string
 *                     last:
 *                       type: string
 *                     next:
 *                       type: string
 *                     prev:
 *                       type: string
 *       400:
 *         description: Paramètres invalides
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
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const sortField = searchParams.get('sortField') || 'title';
        const sortOrder = searchParams.get('sortOrder') || 'asc';

        if (isNaN(limit) || limit < 1 || limit > 50) {
            return NextResponse.json(
                { status: 400, message: 'Bad Request', error: 'Le paramètre "limit" doit être un nombre entre 1 et 50' },
                { status: 400 }
            );
        }

        if (isNaN(page) || page < 1) {
            return NextResponse.json(
                { status: 400, message: 'Bad Request', error: 'Le paramètre "page" doit être un nombre positif' },
                { status: 400 }
            );
        }

        const { db } = await connectToTheaterDB();

        const query: Record<string, any> = {};
        if (search && search.trim() !== '') {
            query.title = { $regex: search, $options: 'i' };
        }

        // Correction du format de tri pour être compatible avec MongoDB
        const sortValue = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
        // Utilisation d'un type compatible avec la méthode sort de MongoDB
        const sortKey = String(sortField);
        
        const skip = (page - 1) * limit;

        const totalDocuments = await db.collection('movies').countDocuments(query);
        const totalPages = Math.ceil(totalDocuments / limit);

        const movies = await db.collection('movies')
            .find(query)
            // Utilisation du format attendu par MongoDB: [[champ, direction]]
            .sort([[sortKey, sortValue]])
            .skip(skip)
            .limit(limit > 0 ? limit : 10)
            .toArray();

        const baseUrl = new URL(request.url).origin + '/api/movies';
        const paginationLinks = {
            first: `${baseUrl}?page=1&limit=${limit}${search ? `&search=${search}` : ''}`,
            last: totalPages > 0 ? `${baseUrl}?page=${totalPages}&limit=${limit}${search ? `&search=${search}` : ''}` : null,
            next: page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}${search ? `&search=${search}` : ''}` : null,
            prev: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}${search ? `&search=${search}` : ''}` : null
        };

        return NextResponse.json({
            status: 200,
            data: movies,
            meta: {
                currentPage: page,
                totalPages,
                totalItems: totalDocuments,
                itemsPerPage: limit
            },
            links: paginationLinks
        });
    } catch (error: any) {
        console.error('Erreur lors de la récupération des films:', error);
        return NextResponse.json(
            { status: 500, message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/movies:
 *   post:
 *     summary: Créer un nouveau film
 *     description: Ajoute un nouveau film à la base de données
 *     tags:
 *       - Films
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       201:
 *         description: Film créé avec succès
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
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        // Récupérer les données du corps de la requête
        const data = await request.json();

        if (!data.title) {
            return NextResponse.json(
                { status: 400, message: 'Bad Request', error: 'Le titre du film est requis' },
                { status: 400 }
            );
        }

        const { db } = await connectToTheaterDB();

        const movie = {
            title: data.title,
            year: data.year ? parseInt(data.year) : null,
            plot: data.plot || '',
            genres: Array.isArray(data.genres) ? data.genres : [],
            cast: Array.isArray(data.cast) ? data.cast : [],
            directors: Array.isArray(data.directors) ? data.directors : [],
            created_at: new Date()
        };

        const result = await db.collection('movies').insertOne(movie);

        const createdMovie = await db.collection('movies').findOne({ _id: result.insertedId });

        return NextResponse.json(
            { 
                status: 201, 
                message: 'Film créé avec succès',
                data: createdMovie 
            },
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
 * /api/movies:
 *   put:
 *     summary: Mettre à jour plusieurs films
 *     description: Met à jour plusieurs films correspondant aux critères de filtre
 *     tags:
 *       - Films
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filter:
 *                 type: object
 *                 description: Critères de filtre pour sélectionner les films à mettre à jour
 *               update:
 *                 type: object
 *                 description: Champs à mettre à jour
 *             required:
 *               - filter
 *               - update
 *     responses:
 *       200:
 *         description: Films mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 matchedCount:
 *                   type: integer
 *                 modifiedCount:
 *                   type: integer
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
export async function PUT(request: NextRequest): Promise<NextResponse> {
    try {
        const data = await request.json();
        
        if (!data.filter || !data.update || Object.keys(data.update).length === 0) {
            return NextResponse.json(
                { status: 400, message: 'Bad Request', error: 'Les paramètres filter et update sont requis' },
                { status: 400 }
            );
        }
        
                const { db } = await connectToTheaterDB();
        
                const result = await db.collection('movies').updateMany(
            data.filter,
            { $set: data.update }
        );
        
        return NextResponse.json({
            status: 200,
            message: 'Films mis à jour avec succès',
            modifiedCount: result.modifiedCount,
            matchedCount: result.matchedCount
        });
    } catch (error: any) {
        console.error('Erreur lors de la mise à jour des films:', error);
        return NextResponse.json(
            { status: 500, message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/movies:
 *   delete:
 *     summary: Supprime plusieurs films
 *     description: Supprime plusieurs films selon des critères spécifiques
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filter:
 *                 type: object
 *                 description: Critères pour sélectionner les films à supprimer
 *     responses:
 *       200:
 *         description: Films supprimés avec succès
 *       400:
 *         description: Paramètres invalides
 *       500:
 *         description: Erreur interne du serveur
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
    try {
        const data = await request.json();
        
                if (!data.filter) {
            return NextResponse.json(
                { status: 400, message: 'Bad Request', error: 'Le paramètre filter est requis' },
                { status: 400 }
            );
        }
        
                const { db } = await connectToTheaterDB();
        
                const result = await db.collection('movies').deleteMany(data.filter);
        
        return NextResponse.json({
            status: 200,
            message: 'Films supprimés avec succès',
            deletedCount: result.deletedCount
        });
    } catch (error: any) {
        console.error('Erreur lors de la suppression des films:', error);
        return NextResponse.json(
            { status: 500, message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}