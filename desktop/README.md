# Club Management - Application Desktop

Application de bureau pour la gestion de club de judo. Fonctionne 100% en local sans connexion internet avec base de données SQLite intégrée.

## 🚀 Fonctionnalités

- ✅ Gestion des adhérents
- ✅ Suivi des présences
- ✅ Gestion des paiements
- ✅ Gestion des licences
- ✅ Gestion des employés
- ✅ Comptabilité et transactions
- ✅ Paramètres du club
- ✅ 100% Local (sans internet)
- ✅ Base de données SQLite

## 📋 Prérequis

- Node.js 18+ (https://nodejs.org/)
- npm (inclus avec Node.js)

## 🔧 Installation

### 1. Installer les dépendances

```bash
cd desktop
npm install
```

### 2. Développement

Pour lancer l'application en mode développement :

```bash
npm run electron:dev
```

Cette commande :
- Lance le backend Node.js sur le port 3001
- Lance le frontend React (Vite) sur le port 5174
- Ouvre Electron

## 📦 Compilation en .exe

### Compiler pour Windows

```bash
npm run build:win
```

Le fichier .exe sera généré dans le dossier `dist-electron/`.

### Compiler pour tous les systèmes

```bash
npm run build:all
```

Cela génère :
- `.exe` pour Windows
- `.dmg` pour macOS
- `.AppImage` pour Linux

## 📁 Structure du projet

```
desktop/
├── src/
│   ├── electron/          # Processus principal Electron
│   │   ├── main.js        # Point d'entrée Electron
│   │   └── preload.js     # Script preload
│   ├── backend/           # Backend Node.js + Express
│   │   ├── server.js      # Serveur Express
│   │   ├── database.js    # Configuration SQLite
│   │   ├── routes/        # Routes API
│   │   └── middleware/    # Middleware (auth)
│   ├── components/        # Composants React
│   ├── pages/             # Pages de l'application
│   ├── services/          # Services (API client)
│   └── main.jsx           # Point d'entrée React
├── public/                # Fichiers statiques
├── package.json
└── README.md
```

## 💾 Base de données

La base de données SQLite est créée automatiquement au premier lancement dans :
- **Développement** : `desktop/data/club_management.db`
- **Production** : Dans le dossier utilisateur de l'application

### Compte par défaut

- **Email** : admin@club.fr
- **Mot de passe** : admin123

## 🔐 Sécurité

- Les mots de passe sont hashés avec bcrypt
- Authentification par JWT
- Base de données locale sécurisée

## 🛠️ Technologies utilisées

- **Electron** : Framework d'application desktop
- **React** : Interface utilisateur
- **Vite** : Build tool et dev server
- **Express** : Backend API
- **SQLite** (better-sqlite3) : Base de données
- **bcryptjs** : Hashage de mots de passe
- **jsonwebtoken** : Authentification JWT

## 📝 Scripts disponibles

- `npm run dev` : Lance backend + frontend
- `npm run electron:dev` : Lance l'application en mode dev
- `npm run build` : Build le frontend
- `npm run build:win` : Compile en .exe pour Windows
- `npm run build:all` : Compile pour tous les OS

## 🐛 Dépannage

### L'application ne démarre pas
- Vérifiez que Node.js 18+ est installé
- Supprimez `node_modules` et réinstallez : `npm install`

### Erreur de base de données
- Supprimez le fichier `data/club_management.db`
- Redémarrez l'application

### Le .exe ne se lance pas
- Vérifiez les permissions d'exécution
- Désactivez temporairement l'antivirus

## 📞 Support

Pour toute question ou problème, consultez la documentation ou contactez l'équipe de développement.

## 📄 Licence

© 2024 Club Management - Tous droits réservés
