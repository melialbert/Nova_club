# NovaClub - Application Mobile Coach

Application mobile Android pour les coachs de judo avec fonctionnalités offline-first.

## Fonctionnalités

- Voir la liste des judokas
- Marquer les présences
- Enregistrer des paiements cash
- Valider des passages de grade
- Ajouter un nouvel adhérent
- Synchronisation automatique avec le serveur

## Installation

```bash
cd mobile-coach
npm install
```

## Développement

```bash
npx expo start
```

## Build pour Android

```bash
npx expo build:android
```

## Configuration

Créer un fichier `.env` avec :

```
API_URL=http://192.168.1.8:8000
```

## Structure du projet

```
mobile-coach/
├── src/
│   ├── screens/       # Écrans de l'application
│   ├── components/    # Composants réutilisables
│   ├── services/      # API et synchronisation
│   ├── db/            # SQLite
│   └── navigation/    # Navigation
├── App.js
└── package.json
```

## Technologies

- React Native (Expo)
- SQLite pour le stockage offline
- React Navigation
- Zustand pour l'état global
