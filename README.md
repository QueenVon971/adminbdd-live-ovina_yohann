# API Films, Commentaires et Théâtres avec Next.js et MongoDB

Ce projet est une API RESTful développée avec Next.js et MongoDB pour gérer une base de données complète de films, commentaires et théâtres. L'API permet d'effectuer des opérations CRUD (Create, Read, Update, Delete) sur les différentes collections de la base de données `sample_mflix` de MongoDB.

## 🔔 Routes à tester

### Films
- `GET http://localhost:3000/api/movies` - Liste des films
- `GET http://localhost:3000/api/movies/573a1390f29313caabcd4135` - Détails d'un film
- `POST http://localhost:3000/api/movies` - Création d'un film
- `PUT http://localhost:3000/api/movies/573a1390f29313caabcd4135` - Mise à jour d'un film
- `DELETE http://localhost:3000/api/movies/573a1390f29313caabcd4135` - Suppression d'un film

### Commentaires
- `GET http://localhost:3000/api/comments` - Liste des commentaires
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

## 💻 Technologies utilisées

- **Next.js 14** : Framework React pour le développement d'applications web avec les App Router
- **MongoDB** : Base de données NoSQL pour stocker les données
- **next-swagger-doc** : Génération de la documentation Swagger/OpenAPI
- **TypeScript** : Typage statique pour une meilleure qualité de code

## 🗡️ API Endpoints

### Films (Movies)

| Méthode | Endpoint | Description |
|--------:|:---------|:------------|
| GET     | `/api/movies/{idMovie}` | Récupérer un film par son ID |
| POST    | `/api/movies` | Créer un nouveau film |
| PUT     | `/api/movies/{idMovie}` | Mettre à jour un film existant |
| DELETE  | `/api/movies/{idMovie}` | Supprimer un film |

### Commentaires (Comments)

| Méthode | Endpoint | Description |
|--------:|:---------|:------------|
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
   git clone https://github.com/QueenVon971/adminbdd-live-ovina_yohann.git
   cd adminbdd-live-code-espi-b3
   ```
   
2. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn install
   ```
   
3. **Lancer le serveur de développement**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. **Accéder à l'API**
   - L'API est accessible sur [http://localhost:3000](http://localhost:3000)
   - Documentation Swagger : [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## 📝 Exemples d'utilisation

### Créer un nouveau film

```http
POST http://localhost:3000/api/movies
Content-Type: application/json

{
  "title": "Nouveau Film Test",
  "year": 2023,
  "rated": "PG-13",
  "runtime": 120,
  "countries": ["France"],
  "genres": ["Action", "Drama"],
  "director": "Réalisateur Test",
  "cast": ["Acteur 1", "Actrice 2"],
  "plot": "Un film de test pour l'API"
}
```

### Créer un nouveau commentaire

```http
POST http://localhost:3000/api/comments
Content-Type: application/json

{
  "name": "Utilisateur Test",
  "email": "utilisateur@test.com",
  "text": "Ceci est un commentaire de test",
  "movie_id": "573a1390f29313caabcd4135"
}
```

### Créer un nouveau théâtre

```http
POST http://localhost:3000/api/theaters
Content-Type: application/json

{
  "name": "Cinéma Test",
  "address": {
    "street1": "123 Avenue des Films",
    "city": "Paris",
    "state": "IDF",
    "zipcode": "75001"
  }
}
```

## ⚛️ Architecture du projet

```
/
├── app/                     # Code de l'application Next.js
│   ├── api/                 # Endpoints API
│   │   ├── movies/           # API Films
│   │   │   ├── [idMovie]/      # Routes paramétrées par ID
│   │   ├── comments/         # API Commentaires
│   │   │   ├── [idComment]/    # Opérations sur un commentaire spécifique
│   │   ├── theaters/         # API Théâtres
│   │       ├── [idTheater]/    # Théâtre spécifique
│   ├── api-docs/            # Documentation Swagger
├── lib/                     # Utilitaires et connexions DB
│   ├── mongodb-theaters.ts   # Connexion MongoDB pour théâtres
│   ├── mongodb.ts           # Connexion MongoDB générique
│   ├── swagger.ts           # Configuration Swagger
├── package.json             # Dépendances et scripts
```

## 💬 Note sur la connexion MongoDB

Ce projet utilise une connexion MongoDB codée en dur dans le fichier `lib/mongodb-theaters.ts` avec les identifiants suivants :

```
ovina:Formation2024@admindonnees.oj3fqbt.mongodb.net/sample_mflix
```

Cette approche a été choisie pour résoudre des problèmes d'authentification rencontrés avec les variables d'environnement.

---

## 📈 À propos des tests

La manière la plus simple de tester cette API est d'utiliser:

1. L'interface Swagger accessible à [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
2. Postman ou un autre client API REST en utilisant les exemples fournis

---

**Projet développé Ovina et Yohann
