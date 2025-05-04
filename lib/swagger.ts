// lib/swagger.ts

import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "API Movies Database",
        description: "API RESTful pour gérer une base de données de films, commentaires et théâtres avec MongoDB.",
        version: "1.0",
        contact: {
          name: "Support API",
          email: "contact@example.com"
        }
      },
      servers: [
        {
          url: "/",
          description: "Serveur de développement"
        }
      ],
      tags: [
        {
          name: "Films",
          description: "Opérations sur les films"
        },
        {
          name: "Commentaires",
          description: "Opérations sur les commentaires (collection indépendante distincte des films)"
        },
        {
          name: "Théâtres",
          description: "Opérations sur les théâtres"
        }
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas: {
          Movie: {
            type: "object",
            properties: {
              _id: { type: "string", description: "ID unique de MongoDB" },
              title: { type: "string", description: "Titre du film" },
              year: { type: "integer", description: "Année de sortie" },
              rated: { type: "string", description: "Classification du film (PG, PG-13, R, etc.)" },
              runtime: { type: "integer", description: "Durée du film en minutes" },
              countries: { 
                type: "array", 
                items: { type: "string" }, 
                description: "Pays de production" 
              },
              genres: { 
                type: "array", 
                items: { type: "string" }, 
                description: "Genres du film" 
              },
              director: { type: "string", description: "Réalisateur du film" },
              cast: { 
                type: "array", 
                items: { type: "string" }, 
                description: "Acteurs principaux" 
              },
              plot: { type: "string", description: "Synopsis du film" }
            },
            required: ["title"]
          },
          Comment: {
            type: "object",
            properties: {
              _id: { type: "string", description: "ID unique de MongoDB" },
              name: { type: "string", description: "Nom de l'auteur du commentaire" },
              email: { type: "string", description: "Email de l'auteur", format: "email" },
              movie_id: { type: "string", description: "ID du film commenté" },
              text: { type: "string", description: "Contenu du commentaire" },
              date: { type: "string", description: "Date du commentaire", format: "date-time" }
            },
            required: ["name", "text"]
          },
          Theater: {
            type: "object",
            properties: {
              _id: { type: "string", description: "ID unique de MongoDB" },
              name: { type: "string", description: "Nom du théâtre" },
              address: {
                type: "object",
                properties: {
                  street1: { type: "string", description: "Adresse" },
                  city: { type: "string", description: "Ville" },
                  state: { type: "string", description: "État ou région" },
                  zipcode: { type: "string", description: "Code postal" }
                }
              },
              location: {
                type: "object",
                properties: {
                  type: { type: "string", default: "Point" },
                  coordinates: { 
                    type: "array", 
                    items: { type: "number" },
                    description: "Coordonnées [longitude, latitude]" 
                  }
                }
              },
              created_at: { type: "string", format: "date-time", description: "Date de création" },
              updated_at: { type: "string", format: "date-time", description: "Date de dernière modification" }
            },
            required: ["name"]
          },
          Error: {
            type: "object",
            properties: {
              status: { type: "integer", description: "Code de statut HTTP" },
              message: { type: "string", description: "Message d'erreur court" },
              error: { type: "string", description: "Description détaillée de l'erreur" }
            }
          }
        }
      },
      security: [],
    },
  });
  return spec;
};