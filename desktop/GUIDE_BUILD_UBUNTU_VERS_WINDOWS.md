# Guide : Créer le .exe sur Ubuntu pour Windows

Ce guide explique comment créer l'installateur Windows (.exe) depuis votre PC Ubuntu et le distribuer aux clubs **sans qu'ils aient besoin d'installer Node.js**.

## Avantages de cette méthode

✅ **Vous créez le .exe une seule fois sur votre Ubuntu**
✅ **Les clubs n'ont besoin que du fichier .exe**
✅ **Aucune installation de Node.js requise dans les clubs**
✅ **L'application est complètement autonome**
✅ **Distribution facile via clé USB**

## Prérequis sur votre PC Ubuntu

Vous avez besoin de :
- Ubuntu 20.04 ou supérieur
- Connexion internet (pour la première installation)
- Environ 3 GB d'espace disque libre

## Installation (À faire une seule fois)

### Étape 1 : Configuration de l'environnement

Ouvrez un terminal dans le dossier `desktop` et exécutez :

```bash
cd desktop
./setup-ubuntu-build.sh
```

Ce script va automatiquement :
1. Installer **Wine** (pour créer des .exe Windows depuis Ubuntu)
2. Installer **Node.js** (uniquement sur votre Ubuntu, pas dans les clubs)
3. Installer toutes les dépendances nécessaires

**Durée** : 10-15 minutes la première fois

Si vous avez des erreurs, vérifiez que vous avez les droits sudo.

### Vérification de l'installation

Pour vérifier que tout est bien installé :

```bash
wine --version    # Doit afficher une version (ex: wine-8.0)
node --version    # Doit afficher une version (ex: v18.x.x)
```

## Création de l'installateur Windows

### Commande simple

Une fois la configuration faite, créez le .exe avec :

```bash
cd desktop
./build-from-ubuntu.sh
```

Le script va :
1. Installer/mettre à jour les dépendances
2. Nettoyer les anciens builds
3. Construire l'interface React
4. Créer l'installateur Windows avec Wine

**Durée** : 5-10 minutes

### Résultat

Le fichier sera créé ici :
```
desktop/dist-electron/Gestion Club Judo Setup X.X.X.exe
```

Taille approximative : **150-250 MB**

## Distribution aux clubs

### Option 1 : Clé USB (Recommandé)

1. **Copiez le fichier .exe sur une clé USB**
   ```bash
   cp "dist-electron/Gestion Club Judo Setup 1.0.0.exe" /media/votre-cle-usb/
   ```

2. **Amenez la clé USB au club**

3. **Sur le PC Windows du club** :
   - Insérez la clé USB
   - Copiez le .exe sur le Bureau
   - Double-cliquez sur le .exe
   - Suivez l'assistant d'installation

4. **C'est tout !** L'application fonctionne sans Node.js

### Option 2 : Partage réseau / Email

1. **Uploadez le .exe** sur Google Drive, OneDrive, WeTransfer, etc.

2. **Partagez le lien** avec les clubs

3. **Les clubs téléchargent et installent** directement sur Windows

## Installation dans les clubs (PC Windows)

### Étapes pour les utilisateurs finaux

1. **Double-cliquez** sur `Gestion Club Judo Setup X.X.X.exe`

2. **Windows affichera peut-être** : "Windows a protégé votre PC"
   - Cliquez sur "Informations complémentaires"
   - Cliquez sur "Exécuter quand même"
   - (C'est normal pour les applications non signées)

3. **Suivez l'assistant d'installation** :
   - Choisissez le dossier d'installation
   - Acceptez de créer les raccourcis
   - Cliquez sur "Installer"

4. **Lancez l'application** depuis :
   - Le raccourci sur le Bureau
   - Menu Démarrer → Gestion Club Judo

5. **Connexion** :
   - La base de données sera créée automatiquement
   - Utilisez les identifiants par défaut :
     - Admin : `admin` / `admin123`
     - Secrétaire : `secretaire` / `secretaire123`

### Ce qui est inclus dans le .exe

L'installateur contient TOUT ce qui est nécessaire :
- ✅ Application complète
- ✅ Base de données SQLite
- ✅ Serveur backend intégré
- ✅ Toutes les dépendances Node.js
- ✅ Runtime Electron

**Rien d'autre à installer sur les PC Windows !**

## Mise à jour de l'application

Pour créer une nouvelle version :

1. **Sur votre Ubuntu**, modifiez le numéro de version dans `package.json` :
   ```json
   {
     "version": "1.1.0"
   }
   ```

2. **Recréez le .exe** :
   ```bash
   ./build-from-ubuntu.sh
   ```

3. **Distribuez le nouveau .exe** aux clubs

4. **Dans les clubs** :
   - Désinstaller l'ancienne version (via Panneau de configuration)
   - Installer la nouvelle version
   - **Les données seront conservées** (la base de données est préservée)

## Problèmes courants et solutions

### Sur Ubuntu (lors de la création)

#### Erreur : "Wine not found"

**Solution** :
```bash
sudo apt update
sudo apt install wine64 wine32
```

#### Erreur : "electron-builder failed"

**Solution** : Réinstallez les dépendances
```bash
rm -rf node_modules
npm install
./build-from-ubuntu.sh
```

#### Erreur : "Cannot find module 'electron'"

**Solution** :
```bash
npm install electron electron-builder --save-dev
```

### Sur Windows (dans les clubs)

#### "Windows a protégé votre PC"

**Solution** : C'est normal pour les apps non signées
- Cliquez "Informations complémentaires"
- Cliquez "Exécuter quand même"

#### L'antivirus bloque l'installation

**Solution** : Ajoutez une exception temporaire
- Désactivez l'antivirus pendant l'installation
- Ou ajoutez le fichier .exe aux exceptions

#### L'application ne démarre pas

**Solution 1** : Réinstallez en tant qu'administrateur
- Clic droit sur le .exe → "Exécuter en tant qu'administrateur"

**Solution 2** : Vérifiez Windows Defender
- Paramètres → Sécurité Windows → Protection contre les virus
- Autorisations → Autoriser l'application

## Architecture technique

### Ce qui se passe lors de la compilation

Sur votre Ubuntu :
```
Code source → Vite (build React) → Electron Builder + Wine → .exe Windows
```

### Ce qui est dans le .exe

```
Gestion Club Judo.exe
├── Electron Runtime (Node.js intégré)
├── Application React (frontend)
├── Serveur Express (backend)
├── SQLite (base de données)
└── Toutes les dépendances npm
```

### Localisation des données sur Windows

Une fois installé, les fichiers sont ici :

**Programme** :
```
C:\Program Files\Gestion Club Judo\
```

**Base de données** :
```
C:\Users\[NomUtilisateur]\AppData\Roaming\club-management-desktop\database.db
```

## Avantages pour les clubs

1. **Installation simple** : Un seul fichier .exe à double-cliquer
2. **Aucune dépendance** : Tout est inclus
3. **Fonctionne hors ligne** : Pas besoin d'internet après installation
4. **Données locales** : La base de données est sur le PC
5. **Rapide** : Pas de latence réseau
6. **Sécurisé** : Les données restent dans le club

## Checklist avant distribution

Avant de donner le .exe aux clubs, vérifiez :

- [ ] La version est correcte dans `package.json`
- [ ] Le build s'est terminé sans erreur
- [ ] Le fichier .exe existe dans `dist-electron/`
- [ ] La taille du fichier est normale (150-250 MB)
- [ ] Vous avez testé l'installation sur un PC Windows (si possible)

## Test de l'installation (optionnel)

Si vous avez accès à un PC Windows :

1. Copiez le .exe sur le PC Windows
2. Installez l'application
3. Vérifiez que :
   - L'installation se déroule sans erreur
   - L'application se lance
   - Vous pouvez vous connecter
   - Les fonctionnalités principales marchent

## Scripts disponibles

Voici tous les scripts que vous pouvez utiliser sur Ubuntu :

| Script | Description |
|--------|-------------|
| `./setup-ubuntu-build.sh` | Configuration initiale (une seule fois) |
| `./build-from-ubuntu.sh` | Créer le .exe Windows |

## Commandes manuelles (alternative)

Si vous préférez faire les étapes manuellement :

```bash
# Installation initiale
sudo apt update
sudo apt install wine64 wine32
npm install

# Build
npm run build
npx electron-builder --win --x64
```

## Questions fréquentes

### Dois-je installer Wine sur les PC des clubs ?
**Non** ! Wine est uniquement nécessaire sur votre Ubuntu pour créer le .exe. Les clubs n'ont besoin de rien installer.

### Le .exe fonctionnera sur tous les Windows ?
**Oui** ! Il fonctionne sur Windows 10 et 11 (64 bits).

### Puis-je créer le .exe sur Windows ?
**Oui** ! Utilisez `build-windows.bat` dans ce cas. Mais depuis Ubuntu, utilisez `build-from-ubuntu.sh`.

### Les données sont-elles synchronisées entre clubs ?
**Non** ! Chaque club a sa propre base de données locale et indépendante.

### Comment sauvegarder les données d'un club ?
Les données sont dans : `C:\Users\[Nom]\AppData\Roaming\club-management-desktop\database.db`
Copiez simplement ce fichier pour faire une sauvegarde.

### Puis-je personnaliser l'application pour chaque club ?
Oui, modifiez le code source puis recréez le .exe. Tous les clubs utilisant ce .exe auront la même version.

## Résumé rapide

**Sur votre Ubuntu (une seule fois)** :
```bash
./setup-ubuntu-build.sh
```

**Créer le .exe** :
```bash
./build-from-ubuntu.sh
```

**Dans les clubs** :
1. Double-clic sur le .exe
2. Suivre l'assistant
3. Lancer l'application
4. C'est tout !

Bonne distribution ! 🚀
