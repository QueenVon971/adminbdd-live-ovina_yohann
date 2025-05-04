# API Films, Commentaires et Théâtres avec Next.js et MongoDB

Ce projet est une API RESTful développée avec Next.js et MongoDB pour gérer une base de données complète de films, commentaires et théâtres. L'API permet d'effectuer des opérations CRUD (Create, Read, Update, Delete) sur les différentes collections de la base de données `sample_mflix` de MongoDB.

## 🔔 Routes à tester

### Films
- `GET http://localhost:3000/api/movies` - Liste des films avec pagination
- `GET http://localhost:3000/api/movies/573a1390f29313caabcd4135` - Détails d'un film
- `POST http://localhost:3000/api/movies` - Création d'un film
- `PUT http://localhost:3000/api/movies/573a1390f29313caabcd4135` - Mise à jour d'un film
- `DELETE http://localhost:3000/api/movies/573a1390f29313caabcd4135` - Suppression d'un film

### Commentaires
- `GET http://localhost:3000/api/comments` - Liste des commentaires
- `GET http://localhost:3000/api/comments?movie_id=573a1390f29313caabcd4135` - Commentaires filtrés par film
- `GET http://localhost:3000/api/comments/5a9427648b0beebeb69579cc` - Détails d'un commentaire
- `POST http://localhost:3000/api/comments` - Création d'un commentaire
- `PUT http://localhost:3000/api/comments/5a9427648b0beebeb69579cc` - Mise à jour d'un commentaire
- `DELETE http://localhost:3000/api/comments/5a9427648b0beebeb69579cc` - Suppression d'un commentaire

### Théâtres
- `GET http://localhost:3000/api/theaters` - Liste des théâtres
- `GET http://localhost:3000/api/theaters/59a47286cfa9a3a73e51e72c` - Détails d'un théâtre
- `POST http://localhost:3000/api/theaters` - Création d'un théâtre
- `PUT http://localhost:3000/api/theaters/59a47286cfa9a3a73e51e72c` - Mise à jour d'un théâtre
- `DELETE http://localhost:3000/api/theaters/59a47286cfa9a3a73e51e72c` - Suppression d'un théâtre

### Documentation
- `GET http://localhost:3000/api-docs` - Interface Swagger

## 📂 À propos du projet

Cette API offre une interface complète pour gérer :
- Des films avec leurs métadonnées (titre, année, réalisateur, etc.)
- Des commentaires (collection indépendante avec référence à un film via movie_id)
- Des théâtres avec leurs informations géographiques

**Note importante** : Les collections commentaires et théâtres fonctionnent de manière indépendante. Vous pouvez créer et gérer des commentaires même sans que le film référencé n'existe, ce qui est conforme à la structure de la base de données `sample_mflix`.

La documentation complète de l'API est disponible via Swagger, offrant une interface interactive pour tester tous les endpoints.

## 🔗 Liens importants

- **GitHub Repository** : [https://github.com/CYSTCloud/vii](https://github.com/CYSTCloud/vii)
- **Documentation Swagger** : [http://localhost:3000/api-docs](http://localhost:3000/api-docs) *(fonctionne uniquement si le serveur est lancé en local)*

## 💻 Technologies utilisées

- **Next.js 14** : Framework React pour le développement d'applications web avec les App Router
- **MongoDB** : Base de données NoSQL pour stocker les données
- **next-swagger-doc** : Génération de la documentation Swagger/OpenAPI
- **TypeScript** : Typage statique pour une meilleure qualité de code

## 🗡️ API Endpoints

### Films (Movies)

| Méthode | Endpoint | Description |
|--------:|:---------|:------------|
| GET     | `/api/movies` | Récupérer une liste de films avec pagination et filtres |
| GET     | `/api/movies/{idMovie}` | Récupérer un film par son ID |
| POST    | `/api/movies` | Créer un nouveau film |
| PUT     | `/api/movies/{idMovie}` | Mettre à jour un film existant |
| DELETE  | `/api/movies/{idMovie}` | Supprimer un film |

### Commentaires (Comments)

| Méthode | Endpoint | Description |
|--------:|:---------|:------------|
| GET     | `/api/comments` | Récupérer tous les commentaires (avec option de filtrage par movie_id) |
| GET     | `/api/comments/{idComment}` | Récupérer un commentaire spécifique |
| POST    | `/api/comments` | Créer un nouveau commentaire |
| PUT     | `/api/comments/{idComment}` | Mettre à jour un commentaire |
| DELETE  | `/api/comments/{idComment}` | Supprimer un commentaire |

**Fonctionnalités particulières** :
- Vous pouvez filtrer les commentaires par film avec le paramètre `movie_id`
- La pagination est disponible avec les paramètres `page` et `limit`
- Les commentaires sont indépendants des films, formant une collection à part entière dans la base de données

### Théâtres (Theaters)

| Méthode | Endpoint | Description |
|--------:|:---------|:------------|
| GET     | `/api/theaters` | Récupérer une liste de théâtres avec pagination |
| GET     | `/api/theaters/{idTheater}` | Récupérer un théâtre par son ID |
| POST    | `/api/theaters` | Créer un nouveau théâtre |
| PUT     | `/api/theaters/{idTheater}` | Mettre à jour un théâtre existant |
| DELETE  | `/api/theaters/{idTheater}` | Supprimer un théâtre |

## ⚙️ Installation et configuration

### Prérequis

- Node.js 18+ et npm/yarn
- Une connexion à une instance MongoDB (les identifiants sont déjà configurés dans le code)

### Étapes d'installation

1. **Cloner le dépôt**

```bash
git clone https://github.com/CYSTCloud/vii.git
cd adminbdd-live-code-espi-b3
