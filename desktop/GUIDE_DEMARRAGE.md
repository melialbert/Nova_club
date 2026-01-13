# 🚀 Guide de Démarrage Rapide

## Pour Développeurs

### Étape 1 : Prérequis
Installez Node.js 18 ou supérieur : https://nodejs.org/

### Étape 2 : Lancement rapide
Double-cliquez sur `start-dev.bat` (Windows)

OU en ligne de commande :
```bash
cd desktop
npm install
npm run electron:dev
```

### Étape 3 : Connexion
- Email : admin@club.fr
- Mot de passe : admin123

---

## Pour Compilation en .exe

### Méthode Simple
Double-cliquez sur `build.bat` (Windows)

### Méthode Manuelle
```bash
cd desktop
npm install
npm run build
npm run build:win
```

Le fichier `.exe` sera dans `dist-electron/`

---

## Structure de l'Application

```
┌─────────────────────────────────────────┐
│         ELECTRON (Fenêtre App)          │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   REACT Frontend (Port 5174)      │ │
│  │   - Interface utilisateur         │ │
│  │   - Pages et composants           │ │
│  └───────────────────────────────────┘ │
│              ↕                          │
│  ┌───────────────────────────────────┐ │
│  │   EXPRESS Backend (Port 3001)     │ │
│  │   - API REST                      │ │
│  │   - Authentification              │ │
│  └───────────────────────────────────┘ │
│              ↕                          │
│  ┌───────────────────────────────────┐ │
│  │   SQLite Database (Local)         │ │
│  │   - Fichier .db                   │ │
│  │   - Stockage local                │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

---

## Fonctionnalités Principales

### 📊 Tableau de bord
Vue d'ensemble des statistiques du club

### 👥 Adhérents
- Ajouter, modifier, supprimer des adhérents
- Gérer les informations personnelles
- Ceintures et niveaux

### 📋 Présences
- Enregistrer les présences aux cours
- Historique complet
- Statuts : Présent, Absent, Excusé

### 💳 Paiements
- Enregistrer les paiements des adhérents
- Historique des transactions
- Montants et méthodes de paiement

### 🎫 Licences
- Gestion des licences sportives
- Dates d'émission et d'expiration
- Statuts actifs/inactifs

### 👔 Employés
- Gestion du personnel
- Postes et coordonnées
- Salaires (optionnel)

### 💰 Comptabilité
- Revenus et dépenses
- Solde du club
- Catégories de transactions

### ⚙️ Paramètres
- Informations du club
- Coordonnées
- Configuration générale

---

## Base de Données

### Localisation
- **Développement** : `desktop/data/club_management.db`
- **Production** : Dossier utilisateur de l'application

### Sécurité
- Mots de passe hashés avec bcrypt
- Tokens JWT pour l'authentification
- Base de données locale non accessible depuis l'extérieur

### Reset
Pour réinitialiser la base de données, supprimez simplement le fichier `.db`

---

## Avantages de la Version Desktop

✅ **100% Local** : Aucune connexion internet requise
✅ **Données Privées** : Tout reste sur votre ordinateur
✅ **Rapidité** : Pas de latence réseau
✅ **Simplicité** : Double-clic pour lancer
✅ **Portable** : Un seul fichier .exe
✅ **Multi-clubs** : Chaque club a sa propre base de données

---

## Résolution de Problèmes

### L'application ne démarre pas
1. Vérifiez que Node.js est installé
2. Supprimez `node_modules` et relancez `npm install`
3. Vérifiez les logs dans la console

### Erreur de port déjà utilisé
1. Fermez toutes les instances de l'application
2. Redémarrez l'ordinateur si nécessaire

### Base de données corrompue
1. Fermez l'application
2. Supprimez `data/club_management.db`
3. Relancez l'application

---

## Support

Pour toute question :
1. Consultez le README.md
2. Vérifiez les logs de l'application
3. Contactez l'équipe de développement

---

## Prochaines Étapes

1. ✅ Lancez l'application en développement
2. ✅ Testez toutes les fonctionnalités
3. ✅ Ajoutez vos données
4. ✅ Compilez en .exe pour distribution
5. ✅ Distribuez à vos utilisateurs

Bonne utilisation ! 🎉
