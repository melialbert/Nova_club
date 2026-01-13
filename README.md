# NovaClub - Plateforme de Gestion de Clubs de Judo

Système de gestion offline-first multi-clubs pour l'Afrique avec connectivité instable.

## Architecture

- **Backend**: FastAPI + PostgreSQL + Redis
- **Web (PWA)**: React + Vite + IndexedDB
- **Mobile Coach**: React Native (Expo) + SQLite
- **Mobile Adhérent**: React Native (Expo) + SQLite

## Fonctionnalités

### Application Web (PWA) - Secrétaire & Admin
- Gestion des adhérents (profils, inscriptions, renouvellements)
- Cotisations (paiements, rappels, historique)
- Équipements & licences (catalogue, stock, historique)
- Comptabilité (transactions, revenus, dépenses, exports)
- Tableau de bord (statistiques, graphiques)
- Multi-utilisateurs avec rôles

### Application Mobile Coach
- Liste des judokas
- Prise de présences
- Enregistrement de paiements cash
- Validation de passages de grade
- Ajout de nouveaux adhérents

### Application Mobile Adhérent/Parent
- Profil personnel et enfants liés
- Historique des cotisations et paiements
- Équipements achetés
- Licence et expiration
- Planning des entraînements
- Messages du club
- Code moral du judo

## Installation pour le Développement

### Prérequis

- Docker et Docker Compose installés
- IP de votre machine (exemple: 192.168.1.8)

### Démarrage Rapide

1. Cloner le projet et se placer dans le dossier

2. Configurer l'IP dans `docker-compose.yml`:
   ```yaml
   backend:
     environment:
       ALLOWED_ORIGINS: http://192.168.1.8:3000,http://localhost:3000

   pwa:
     environment:
       VITE_API_URL: http://192.168.1.8:8000
   ```

3. Démarrer tous les services:
   ```bash
   docker-compose up -d
   ```

4. Attendre que les services démarrent (30-60 secondes)

5. Accéder aux applications:
   - API Backend: http://192.168.1.8:8000
   - Documentation API: http://192.168.1.8:8000/docs
   - PWA Web: http://192.168.1.8:3000
   - Adminer (Base de données): http://192.168.1.8:8080
     - Système: PostgreSQL
     - Serveur: postgres
     - Utilisateur: novaclub
     - Mot de passe: novaclub123
     - Base de données: novaclub_db

### Vérifier que tout fonctionne

```bash
# Vérifier les conteneurs
docker-compose ps

# Voir les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f pwa
```

### Arrêter les services

```bash
docker-compose down
```

### Supprimer les données et tout réinitialiser

```bash
docker-compose down -v
```

## Installation sur les PC de Clubs

### Option 1: Docker (Recommandé)

1. Installer Docker Desktop sur le PC du club
2. Copier le dossier du projet sur le PC
3. Modifier l'IP dans `docker-compose.yml` avec l'IP locale du PC
4. Lancer: `docker-compose up -d`

### Option 2: Installation Native

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configurer PostgreSQL et mettre à jour DATABASE_URL dans .env

uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### PWA

```bash
cd pwa
npm install
npm run build

# Servir avec un serveur web (nginx, apache, etc.)
```

## Configuration Multi-Clubs

Chaque club a sa propre instance avec:
- Base de données PostgreSQL isolée
- Utilisateurs et données séparés
- Synchronisation indépendante

### Créer un nouveau club

1. Accéder à http://192.168.1.8:3000/register
2. Remplir les informations du club
3. Créer le compte admin
4. Le système crée automatiquement le club et l'utilisateur admin

## Architecture Offline-First

### Stockage Local

- **PWA**: IndexedDB (navigateur)
- **Mobile**: SQLite (appareil)

### Synchronisation

Chaque enregistrement contient:
- `id`: UUID unique
- `updated_at`: Horodatage de dernière modification
- `device_id`: Identifiant de l'appareil
- `sync_version`: Version pour résolution de conflits

Le moteur de synchronisation:
1. Envoie les changements locaux au serveur (PUSH)
2. Récupère les changements du serveur (PULL)
3. Résout les conflits (version la plus récente gagne)
4. Synchronise toutes les 30 secondes
5. Synchronise immédiatement lors de la reconnexion

### Endpoints de Synchronisation

- `POST /api/v1/sync/push`: Envoyer les changements locaux
- `POST /api/v1/sync/pull`: Récupérer les changements du serveur

## API Documentation

### Authentification

```bash
# Inscription
POST /api/v1/auth/register
{
  "email": "admin@club.com",
  "password": "motdepasse",
  "first_name": "Prénom",
  "last_name": "Nom",
  "club_name": "Mon Club de Judo",
  "phone": "+221776543210"
}

# Connexion
POST /api/v1/auth/login
{
  "email": "admin@club.com",
  "password": "motdepasse"
}

# Profil
GET /api/v1/auth/me
Headers: Authorization: Bearer {token}
```

### Adhérents

```bash
# Liste
GET /api/v1/members

# Créer
POST /api/v1/members

# Modifier
PUT /api/v1/members/{id}

# Supprimer
DELETE /api/v1/members/{id}
```

## Structure du Projet

```
novaclub/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/routes/     # Routes API
│   │   ├── models/         # Modèles SQLAlchemy
│   │   ├── schemas/        # Schémas Pydantic
│   │   ├── core/           # Config, sécurité
│   │   └── db/             # Connexion DB
│   ├── Dockerfile
│   └── requirements.txt
├── pwa/                    # React PWA
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── pages/         # Pages
│   │   ├── services/      # API, sync
│   │   ├── db/            # IndexedDB
│   │   └── utils/         # Store, helpers
│   ├── vite.config.js
│   └── package.json
├── mobile-coach/           # App React Native Coach
│   ├── src/
│   └── package.json
├── mobile-member/          # App React Native Adhérent
│   ├── src/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Base de Données

### Modèles principaux

- **Club**: Informations du club
- **User**: Utilisateurs (admin, secrétaire, coach)
- **Member**: Adhérents du club
- **Payment**: Paiements et cotisations
- **License**: Licences des adhérents
- **Equipment**: Catalogue d'équipements
- **EquipmentPurchase**: Achats d'équipements
- **Attendance**: Présences aux entraînements
- **Transaction**: Transactions comptables
- **Message**: Messages et communications

### Migrations

Les migrations sont gérées automatiquement au démarrage via SQLAlchemy.

## Sécurité

- JWT pour l'authentification
- Hashage des mots de passe avec bcrypt
- Isolation multi-tenant (club_id dans toutes les requêtes)
- RLS au niveau applicatif
- CORS configuré
- HTTPS recommandé en production

## Performance

- Index sur les colonnes fréquemment interrogées
- Pagination sur les listes longues
- Mise en cache Redis pour les sessions
- Compression des données de synchronisation

## Support

Pour toute question ou problème:
1. Vérifier les logs: `docker-compose logs -f`
2. Vérifier la connectivité réseau
3. Vérifier que PostgreSQL est démarré
4. Vérifier que les ports 3000, 5432, 6379, 8000 sont disponibles

## Développement des Apps Mobiles

Les applications mobiles React Native sont dans `mobile-coach/` et `mobile-member/`. Consultez leur README respectif pour les instructions de développement.

## Licence

Tous droits réservés - NovaClub
