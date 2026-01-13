# 📘 Informations Techniques - Application Desktop

## 🎯 Architecture Complète

### Vue d'ensemble
L'application utilise une architecture en 3 couches :
1. **Frontend** : React + Vite (interface utilisateur)
2. **Backend** : Node.js + Express (API REST)
3. **Database** : SQLite (stockage local)

Le tout est emballé dans **Electron** pour créer une application desktop native.

---

## 🏗️ Structure Détaillée

```
desktop/
│
├── src/
│   │
│   ├── electron/                    # Processus Electron
│   │   ├── main.js                  # Processus principal
│   │   │   - Crée la fenêtre
│   │   │   - Lance le backend
│   │   │   - Gère le cycle de vie
│   │   └── preload.js               # Script de préchargement
│   │       - Bridge sécurisé
│   │
│   ├── backend/                     # Backend Node.js
│   │   ├── server.js                # Serveur Express (Port 3001)
│   │   ├── database.js              # Gestion SQLite
│   │   │   - Connexion DB
│   │   │   - Création tables
│   │   │   - Données par défaut
│   │   │
│   │   ├── routes/                  # Routes API REST
│   │   │   ├── auth.js              # Authentification
│   │   │   ├── members.js           # CRUD Adhérents
│   │   │   ├── attendances.js       # CRUD Présences
│   │   │   ├── payments.js          # CRUD Paiements
│   │   │   ├── licenses.js          # CRUD Licences
│   │   │   ├── employees.js         # CRUD Employés
│   │   │   ├── transactions.js      # CRUD Transactions
│   │   │   └── club.js              # Paramètres Club
│   │   │
│   │   └── middleware/
│   │       └── auth.js              # Middleware JWT
│   │
│   ├── components/                  # Composants React
│   │   └── Layout.jsx               # Layout principal
│   │       - Menu latéral
│   │       - Header
│   │       - Navigation
│   │
│   ├── pages/                       # Pages React
│   │   ├── LoginPage.jsx            # Page de connexion
│   │   ├── DashboardPage.jsx        # Tableau de bord
│   │   ├── MembersPage.jsx          # Gestion adhérents
│   │   ├── AttendancesPage.jsx      # Gestion présences
│   │   ├── PaymentsPage.jsx         # Gestion paiements
│   │   ├── LicensesPage.jsx         # Gestion licences
│   │   ├── EmployeesPage.jsx        # Gestion employés
│   │   ├── AccountingPage.jsx       # Comptabilité
│   │   └── SettingsPage.jsx         # Paramètres
│   │
│   ├── services/
│   │   └── api.js                   # Client API REST
│   │       - Toutes les requêtes HTTP
│   │       - Gestion du token
│   │
│   ├── App.jsx                      # Composant racine
│   ├── main.jsx                     # Point d'entrée React
│   └── index.css                    # Styles globaux
│
├── public/                          # Assets statiques
├── data/                            # Base de données SQLite
│   └── club_management.db           # Fichier DB
│
├── package.json                     # Configuration npm
├── vite.config.js                   # Configuration Vite
├── start-dev.bat                    # Script de démarrage
├── build.bat                        # Script de compilation
├── README.md                        # Documentation
├── GUIDE_DEMARRAGE.md              # Guide rapide
└── INFORMATIONS_TECHNIQUES.md      # Ce fichier
```

---

## 🔧 Technologies et Versions

### Frontend
- **React** 18.2.0 : Bibliothèque UI
- **React Router** 6.21.1 : Routing
- **Vite** 5.0.8 : Build tool ultra-rapide

### Backend
- **Express** 4.18.2 : Framework web
- **better-sqlite3** 9.2.2 : Driver SQLite
- **bcryptjs** 2.4.3 : Hashage de mots de passe
- **jsonwebtoken** 9.0.2 : Authentification JWT
- **cors** 2.8.5 : CORS middleware

### Desktop
- **Electron** 28.1.0 : Framework desktop
- **electron-builder** 24.9.1 : Compilation

### DevTools
- **concurrently** 8.2.2 : Lancer plusieurs process
- **nodemon** 3.0.2 : Hot reload backend
- **wait-on** 7.2.0 : Attendre disponibilité ports

---

## 🗄️ Schéma de Base de Données

### Table: clubs
```sql
CREATE TABLE clubs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table: users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id INTEGER NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'coach', 'member')),
  first_name TEXT,
  last_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_id) REFERENCES clubs(id)
);
```

### Table: members
```sql
CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id INTEGER NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  belt_level TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  photo_url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_id) REFERENCES clubs(id)
);
```

### Table: attendances
```sql
CREATE TABLE attendances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  club_id INTEGER NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'excused')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (club_id) REFERENCES clubs(id)
);
```

### Table: payments
```sql
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  club_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  description TEXT,
  status TEXT DEFAULT 'completed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (club_id) REFERENCES clubs(id)
);
```

### Table: licenses
```sql
CREATE TABLE licenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  club_id INTEGER NOT NULL,
  license_number TEXT UNIQUE,
  issue_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (club_id) REFERENCES clubs(id)
);
```

### Table: employees
```sql
CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id INTEGER NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  position TEXT,
  email TEXT,
  phone TEXT,
  salary REAL,
  hire_date DATE,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_id) REFERENCES clubs(id)
);
```

### Table: transactions
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  category TEXT,
  amount REAL NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_id) REFERENCES clubs(id)
);
```

---

## 🔐 Sécurité

### Authentification
- **Hashage** : bcrypt avec salt de 10 rounds
- **JWT** : Tokens expiration 24h
- **Storage** : Token stocké dans localStorage

### API Protection
- Middleware d'authentification sur toutes les routes
- Vérification du club_id pour isolation des données
- Validation des entrées utilisateur

### Base de Données
- Fichier local non accessible depuis l'extérieur
- Permissions système d'exploitation
- Pas d'exposition réseau

---

## 🚀 Processus de Démarrage

### Mode Développement
```
1. npm run electron:dev
   ↓
2. Concurrently lance :
   - Backend (nodemon src/backend/server.js)
   - Frontend (vite)
   ↓
3. Backend démarre sur port 3001
   - Initialise SQLite
   - Crée les tables
   - Crée données par défaut
   ↓
4. Frontend démarre sur port 5174
   - Vite dev server
   - Hot Module Replacement
   ↓
5. Electron démarre
   - Attend que backend soit prêt (2s)
   - Charge http://localhost:5174
   - Fenêtre 1400x900
```

### Mode Production (.exe)
```
1. npm run build
   ↓
2. Vite build le frontend dans dist/
   ↓
3. npm run build:win
   ↓
4. electron-builder package :
   - Frontend (dist/)
   - Backend (src/backend/)
   - Electron (src/electron/)
   - Node.js runtime
   - SQLite natif
   ↓
5. Génère .exe dans dist-electron/
```

---

## 📊 Flux de Données

### Exemple : Créer un adhérent

```
┌─────────────────────────────────────────────┐
│ 1. Utilisateur clique "Ajouter"             │
│    MembersPage.jsx                          │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ 2. Formulaire rempli et soumis             │
│    handleSubmit()                           │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ 3. Appel API                                │
│    api.createMember(formData)               │
│    services/api.js                          │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ 4. Requête HTTP POST                        │
│    POST http://localhost:3001/api/members   │
│    Headers: Authorization: Bearer <token>   │
│    Body: JSON formData                      │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ 5. Express reçoit la requête               │
│    routes/members.js                        │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ 6. Middleware authentification             │
│    middleware/auth.js                       │
│    - Vérifie JWT                           │
│    - Extrait club_id                       │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ 7. Route handler                            │
│    POST '/' (req, res)                     │
│    - Récupère données body                 │
│    - Prépare requête SQL                   │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ 8. Insertion SQLite                        │
│    db.prepare().run()                      │
│    INSERT INTO members ...                 │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ 9. Récupère l'adhérent créé               │
│    SELECT * FROM members WHERE id = ?      │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ 10. Réponse JSON                           │
│     res.status(201).json(member)           │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ 11. Frontend reçoit la réponse            │
│     const member = await response.json()   │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ 12. Mise à jour UI                         │
│     loadMembers()                          │
│     Ferme formulaire                       │
└─────────────────────────────────────────────┘
```

---

## 🎨 Design Patterns Utilisés

### Backend
- **MVC** : Séparation routes/controllers/models
- **Middleware Pattern** : Authentification centralisée
- **Repository Pattern** : Accès base de données

### Frontend
- **Component-Based** : Composants React réutilisables
- **Container/Presentational** : Séparation logique/affichage
- **Service Layer** : api.js centralise les appels

### Electron
- **Main/Renderer Process** : Séparation des responsabilités
- **IPC** : Communication inter-processus (si nécessaire)

---

## 📈 Performance

### Optimisations
- **SQLite WAL mode** : Write-Ahead Logging activé
- **Indexes** : Sur clés étrangères et colonnes recherchées
- **Better-sqlite3** : Driver synchrone ultra-rapide
- **Vite** : Build et HMR ultra-rapides
- **React** : Virtual DOM et reconciliation optimisée

### Métriques Typiques
- Démarrage app : ~2-3 secondes
- Requête API : <10ms
- Requête DB : <1ms
- Build frontend : ~10 secondes
- Build .exe : ~30-60 secondes

---

## 🔄 Cycle de Vie

### Développement
```
Code → Hot Reload → Test → Debug → Repeat
```

### Production
```
Code → Build → Package → Test → Distribute
```

### Utilisateur Final
```
Download .exe → Double-click → Login → Utiliser
```

---

## 📝 Points Importants

### ✅ Avantages
- Application native performante
- Données 100% locales et privées
- Pas de dépendance internet
- Installation simple (un .exe)
- Multi-plateforme possible
- Base de données légère et rapide

### ⚠️ Limitations
- Pas de synchronisation cloud
- Un fichier DB par installation
- Sauvegardes manuelles recommandées
- Taille du .exe (~100-150 MB avec Electron)

### 🚀 Améliorations Possibles
- Export/Import de données (CSV, JSON)
- Sauvegardes automatiques
- Mode multi-utilisateurs sur réseau local
- Rapports et statistiques avancées
- Système de notifications
- Mode hors-ligne avec sync future

---

## 🎓 Ressources

### Documentation
- Electron : https://www.electronjs.org/
- React : https://react.dev/
- Express : https://expressjs.com/
- SQLite : https://www.sqlite.org/
- Vite : https://vitejs.dev/

### Communauté
- GitHub Discussions
- Stack Overflow
- Discord Electron

---

© 2024 Club Management Desktop
