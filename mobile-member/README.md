# NovaClub - Application Mobile Adhérent/Parent

Application mobile Android pour les adhérents et parents avec fonctionnalités offline-first.

## Fonctionnalités

- Consulter son profil personnel
- Voir les enfants liés
- Historique des cotisations
- Historique des paiements effectués
- Équipements achetés
- Licence et date d'expiration
- Planning des entraînements
- Messages du club
- Notifications
- Code moral du judo

## Installation

```bash
cd mobile-member
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
mobile-member/
├── src/
│   ├── screens/       # Écrans de l'application
│   ├── components/    # Composants réutilisables
│   ├── services/      # API et synchronisation
│   ├── db/            # SQLite
│   ├── assets/        # Images et ressources
│   └── navigation/    # Navigation
├── App.js
└── package.json
```

## Technologies

- React Native (Expo)
- SQLite pour le stockage offline
- React Navigation
- Zustand pour l'état global
