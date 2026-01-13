# Architecture NovaClub - Vue d'ensemble

## Structure Complète du Projet

```
novaclub/
├── backend/                              # Backend FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                      # Point d'entrée FastAPI
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py              # Routes authentification
│   │   │       ├── clubs.py             # Routes gestion clubs
│   │   │       ├── members.py           # Routes gestion adhérents
│   │   │       ├── payments.py          # Routes gestion paiements
│   │   │       ├── licenses.py          # Routes gestion licences
│   │   │       ├── equipment.py         # Routes gestion équipements
│   │   │       ├── attendances.py       # Routes gestion présences
│   │   │       ├── transactions.py      # Routes comptabilité
│   │   │       ├── messages.py          # Routes messagerie
│   │   │       └── sync.py              # Routes synchronisation
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                  # Modèle de base avec sync
│   │   │   ├── club.py                  # Modèle Club
│   │   │   ├── user.py                  # Modèle Utilisateur
│   │   │   ├── member.py                # Modèle Adhérent
│   │   │   ├── payment.py               # Modèle Paiement
│   │   │   ├── license.py               # Modèle Licence
│   │   │   ├── equipment.py             # Modèle Équipement
│   │   │   ├── attendance.py            # Modèle Présence
│   │   │   ├── transaction.py           # Modèle Transaction
│   │   │   └── message.py               # Modèle Message
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── auth.py                  # Schémas Pydantic auth
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py                # Configuration app
│   │   │   ├── security.py              # JWT, hashage
│   │   │   └── deps.py                  # Dépendances FastAPI
│   │   └── db/
│   │       └── base.py                  # Connexion database
│   ├── Dockerfile                       # Docker dev backend
│   └── requirements.txt                 # Dépendances Python
│
├── pwa/                                  # Application Web PWA
│   ├── src/
│   │   ├── main.jsx                     # Point d'entrée React
│   │   ├── App.jsx                      # Composant principal
│   │   ├── index.css                    # Styles globaux
│   │   ├── components/
│   │   │   └── Layout.jsx               # Layout avec navigation
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx            # Page connexion
│   │   │   ├── RegisterPage.jsx         # Page inscription
│   │   │   ├── DashboardPage.jsx        # Tableau de bord
│   │   │   ├── MembersPage.jsx          # Gestion adhérents
│   │   │   └── PaymentsPage.jsx         # Gestion paiements
│   │   ├── services/
│   │   │   ├── api.js                   # Service API HTTP
│   │   │   └── syncService.js           # Moteur synchronisation
│   │   ├── db/
│   │   │   └── index.js                 # IndexedDB setup
│   │   └── utils/
│   │       └── store.js                 # Store Zustand
│   ├── public/
│   │   └── logo.png                     # Logo NovaClub
│   ├── index.html                       # HTML principal
│   ├── package.json                     # Dépendances npm
│   ├── vite.config.js                   # Configuration Vite + PWA
│   └── Dockerfile.dev                   # Docker dev PWA
│
├── mobile-coach/                        # App mobile coach
│   ├── src/                            # Code source (à développer)
│   ├── package.json                    # Dépendances React Native
│   └── README.md                       # Documentation coach
│
├── mobile-member/                      # App mobile adhérent
│   ├── src/                           # Code source (à développer)
│   ├── package.json                   # Dépendances React Native
│   └── README.md                      # Documentation membre
│
├── docs/                              # Documentation
│   ├── GUIDE_INSTALLATION_CLUBS.md    # Installation pour clubs
│   ├── GUIDE_UTILISATEUR.md           # Guide utilisateur
│   └── DEPLOIEMENT_PRODUCTION.md      # Déploiement production
│
├── docker-compose.yml                 # Orchestration Docker
├── .env.example                       # Variables d'environnement
├── .gitignore                        # Fichiers ignorés par git
├── README.md                         # Documentation principale
├── NEXT_STEPS.md                     # Prochaines étapes
└── ARCHITECTURE.md                   # Ce fichier

```

## Technologies Utilisées

### Backend
- **FastAPI**: Framework web moderne et rapide
- **SQLAlchemy**: ORM pour PostgreSQL
- **PostgreSQL**: Base de données relationnelle
- **Redis**: Cache et sessions
- **JWT**: Authentification
- **Bcrypt**: Hashage des mots de passe
- **Uvicorn**: Serveur ASGI

### Frontend Web (PWA)
- **React**: Bibliothèque UI
- **Vite**: Build tool moderne
- **React Router**: Routing
- **IndexedDB**: Base de données locale navigateur
- **IDB**: Wrapper pour IndexedDB
- **Zustand**: State management
- **Vite PWA Plugin**: Progressive Web App

### Mobile
- **React Native**: Framework mobile cross-platform
- **Expo**: Toolchain React Native
- **SQLite**: Base de données locale mobile
- **React Navigation**: Navigation mobile

### Infrastructure
- **Docker**: Conteneurisation
- **Docker Compose**: Orchestration multi-conteneurs
- **Nginx**: Reverse proxy (production)

## Principes Architecturaux

### 1. Offline-First

**Principe**: L'application doit fonctionner sans connexion Internet.

**Implémentation**:
- Stockage local: IndexedDB (web), SQLite (mobile)
- Queue de synchronisation pour les modifications
- Synchronisation bidirectionnelle automatique
- Résolution de conflits par timestamp

**Flux de synchronisation**:
```
1. Modification locale → Enregistrement en local
2. Ajout à la queue de sync
3. Si online → PUSH vers serveur
4. PULL depuis serveur
5. Merge des données
6. Résolution des conflits
```

### 2. Multi-Tenant

**Principe**: Une instance pour plusieurs clubs isolés.

**Implémentation**:
- Chaque table contient `club_id`
- Filtrage automatique par club dans toutes les requêtes
- JWT contient `club_id`
- Isolation des données au niveau applicatif

### 3. RESTful API

**Structure des endpoints**:
```
GET    /api/v1/members          # Liste
POST   /api/v1/members          # Créer
GET    /api/v1/members/{id}     # Détail
PUT    /api/v1/members/{id}     # Modifier
DELETE /api/v1/members/{id}     # Supprimer
```

### 4. Authentification JWT

**Flux**:
```
1. Login → Token JWT
2. Token contient: user_id, club_id, role
3. Token valide 7 jours
4. Chaque requête inclut le token
5. Backend vérifie et décode
```

### 5. Synchronisation

**Modèle de données**:
```javascript
{
  id: "uuid",
  ...data,
  created_at: "timestamp",
  updated_at: "timestamp",
  device_id: "device_uuid",
  sync_version: 1
}
```

**Endpoints de sync**:
- `POST /api/v1/sync/push`: Client → Serveur
- `POST /api/v1/sync/pull`: Serveur → Client

### 6. Sécurité

**Mesures**:
- Hashage bcrypt des mots de passe
- JWT pour authentification
- CORS configuré
- Validation Pydantic côté serveur
- Isolation multi-tenant
- Rate limiting (production)
- HTTPS (production)

## Flux de Données

### 1. Inscription d'un nouveau club

```
Client                      Backend                    Database
  |                           |                          |
  |--POST /auth/register----->|                          |
  |                           |--Create Club------------>|
  |                           |<-------------------------|
  |                           |--Create User (admin)---->|
  |                           |<-------------------------|
  |<-----JWT Token------------|                          |
  |                           |                          |
```

### 2. Ajout d'un adhérent (Online)

```
Client                      Backend                    Database
  |                           |                          |
  |--POST /members----------->|                          |
  |   (JWT in header)         |--Verify JWT------------->|
  |                           |<-------------------------|
  |                           |--Insert Member---------->|
  |                           |<-------------------------|
  |<-----Member Data----------|                          |
  |                           |                          |
  |--Save to IndexedDB------->|                          |
```

### 3. Ajout d'un adhérent (Offline)

```
Client                      Sync Queue              Backend
  |                           |                       |
  |--Save to IndexedDB------->|                       |
  |<-------------------------|                       |
  |--Add to Sync Queue------->|                       |
  |<-------------------------|                       |
  |                           |                       |
  [Internet revient]          |                       |
  |                           |                       |
  |--Trigger Sync------------>|                       |
  |                           |--POST /sync/push----->|
  |                           |<----------------------|
  |<-----Sync Success---------|                       |
```

## Modèle de Données

### Relations principales

```
Club
 ├── Users (1:N)
 ├── Members (1:N)
 │    ├── Payments (1:N)
 │    ├── Licenses (1:N)
 │    ├── Attendances (1:N)
 │    └── EquipmentPurchases (1:N)
 ├── Equipment (1:N)
 ├── Transactions (1:N)
 └── Messages (1:N)
```

### Champs de synchronisation

Tous les modèles héritent de `BaseModel`:
```python
id: UUID
created_at: DateTime
updated_at: DateTime
device_id: String (optional)
sync_version: Integer
```

## Performance

### Optimisations Backend
- Index sur `club_id` (toutes les tables)
- Index sur `updated_at` (pour la sync)
- Index sur les champs de recherche fréquents
- Connexion pool PostgreSQL
- Cache Redis pour les sessions

### Optimisations Frontend
- Lazy loading des pages
- Pagination des listes
- Debouncing des recherches
- Cache local IndexedDB
- Service Worker pour la PWA

## Évolutivité

### Scaling Horizontal
- Backend stateless (peut ajouter des instances)
- Sessions dans Redis (partagées)
- Load balancer (Nginx)

### Scaling Vertical
- PostgreSQL: Optimisation des requêtes
- Redis: Augmentation mémoire
- Backend: Ajout de workers Gunicorn

## Monitoring et Logs

### Backend
- Logs Uvicorn
- Logs applicatifs (à implémenter)
- Métriques (à implémenter)

### Frontend
- Console errors
- Analytics (à implémenter)
- Error tracking (à implémenter)

## Sauvegardes

### Données
- Sauvegarde PostgreSQL automatique
- Rotation des sauvegardes (30 jours)
- Sauvegarde volumes Docker

### Code
- Git pour versioning
- Backups réguliers du repository

## Déploiement

### Développement
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Maintenance

### Mise à jour
1. Arrêt des services
2. Sauvegarde
3. Pull des nouvelles versions
4. Build
5. Démarrage

### Monitoring
- Logs: `docker-compose logs -f`
- Statut: `docker-compose ps`
- Ressources: `docker stats`

## Prochaines Évolutions

Voir `NEXT_STEPS.md` pour la roadmap complète.

## Support

- Documentation: `/docs`
- README: `README.md`
- Issues: Votre système de tracking
