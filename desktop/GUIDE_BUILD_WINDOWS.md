# Guide de création de l'installateur Windows

Ce guide vous explique comment créer un fichier `.exe` installable pour l'application de gestion de club de judo sur Windows.

## Prérequis

Avant de commencer, assurez-vous d'avoir :

1. **Node.js 18 ou supérieur** installé sur votre PC
   - Téléchargez depuis : https://nodejs.org/
   - Vérifiez l'installation : `node --version`

2. **Git** (optionnel, pour cloner le projet)
   - Téléchargez depuis : https://git-scm.com/

3. **Au moins 2 GB d'espace disque libre**

4. **Windows 10 ou supérieur** (64 bits)

## Étapes de création de l'installateur

### Méthode 1 : Script automatique (Recommandé)

1. **Ouvrez le dossier du projet**
   ```
   cd desktop
   ```

2. **Double-cliquez sur `build-windows.bat`**

   Le script va automatiquement :
   - Installer toutes les dépendances nécessaires
   - Nettoyer les anciens builds
   - Construire l'interface React
   - Créer l'installateur Windows

3. **Attendez la fin du processus** (environ 5-10 minutes)

4. **Trouvez votre installateur**
   - Il sera dans le dossier `desktop/dist-electron/`
   - Fichier : `Gestion Club Judo Setup X.X.X.exe`

### Méthode 2 : Ligne de commande

1. **Ouvrez PowerShell ou CMD dans le dossier desktop**

2. **Installez les dépendances**
   ```bash
   npm install
   ```

3. **Lancez la construction**
   ```bash
   npm run build:win
   ```

4. **Attendez la fin** (environ 5-10 minutes)

5. **L'installateur sera créé dans** `desktop/dist-electron/`

## Installation de l'application

### Sur votre PC de développement

1. Localisez le fichier `Gestion Club Judo Setup X.X.X.exe`
2. Double-cliquez dessus
3. Suivez l'assistant d'installation :
   - Choisissez le dossier d'installation (par défaut : `C:\Program Files\Gestion Club Judo`)
   - Cochez "Créer un raccourci sur le bureau" (recommandé)
   - Cliquez sur "Installer"
4. Une fois installé, lancez l'application depuis :
   - Le raccourci sur le bureau
   - Menu Démarrer → Gestion Club Judo

### Sur d'autres PC Windows

1. **Copiez le fichier `.exe` sur une clé USB** ou partagez-le via email/réseau

2. **Sur le PC cible**, double-cliquez sur l'installateur

3. **Suivez l'assistant d'installation**

4. **Lancez l'application** - La base de données sera créée automatiquement au premier lancement

## Structure de l'application installée

Une fois installée, l'application :

```
C:\Program Files\Gestion Club Judo\
├── Gestion Club Judo.exe         (Exécutable principal)
├── resources\                     (Fichiers de l'application)
└── ...

%USERPROFILE%\AppData\Roaming\club-management-desktop\
└── database.db                    (Base de données SQLite)
```

La base de données est stockée dans :
- `C:\Users\[VotreNom]\AppData\Roaming\club-management-desktop\database.db`

## Problèmes courants et solutions

### Erreur : "npm command not found"

**Solution** : Node.js n'est pas installé ou pas dans le PATH
- Installez Node.js depuis https://nodejs.org/
- Redémarrez votre terminal

### Erreur : "electron-builder failed"

**Solution** : Problème de dépendances natives
```bash
# Supprimez node_modules et réinstallez
rmdir /s /q node_modules
npm install
npm run build:win
```

### Erreur : "Python required"

**Solution** : better-sqlite3 nécessite les outils de build Windows
```bash
npm install --global windows-build-tools
```

Ou installez manuellement :
- Visual Studio Build Tools
- Python 3.x

### L'application ne démarre pas après installation

**Solution 1** : Vérifiez les permissions
- Faites un clic droit sur l'installateur → "Exécuter en tant qu'administrateur"

**Solution 2** : Désactivez temporairement l'antivirus
- Certains antivirus bloquent les applications Electron

**Solution 3** : Vérifiez les logs
- Ouvrez l'application
- Appuyez sur `Ctrl + Shift + I` pour ouvrir les DevTools
- Consultez l'onglet "Console" pour les erreurs

### L'installateur est bloqué par Windows Defender

**Solution** : C'est normal pour les applications non signées
1. Windows affichera "Windows a protégé votre PC"
2. Cliquez sur "Informations complémentaires"
3. Cliquez sur "Exécuter quand même"

**Note** : Pour éviter cet avertissement, vous devriez signer le code avec un certificat (coût ~300€/an)

## Mise à jour de l'application

Pour créer une nouvelle version :

1. **Modifiez le numéro de version** dans `package.json`
   ```json
   {
     "version": "1.1.0"
   }
   ```

2. **Reconstruisez l'installateur**
   ```bash
   npm run build:win
   ```

3. **Distribuez le nouvel installateur**
   - Les utilisateurs devront désinstaller l'ancienne version
   - Puis installer la nouvelle version

**Important** : La base de données sera conservée lors de la mise à jour

## Distribution de l'application

### Option 1 : USB / Partage réseau
- Copiez simplement le fichier `.exe` sur une clé USB
- Partagez-le via réseau local

### Option 2 : Cloud (Google Drive, OneDrive, etc.)
- Uploadez le fichier `.exe` dans le cloud
- Partagez le lien de téléchargement

### Option 3 : Site web / Serveur
- Hébergez le fichier sur votre site web
- Les utilisateurs pourront le télécharger directement

## Informations techniques

- **Architecture** : x64 (Windows 64 bits)
- **Format** : NSIS Installer
- **Taille approximative** : 150-250 MB
- **Dépendances incluses** :
  - Node.js runtime (Electron)
  - SQLite (better-sqlite3)
  - Serveur Express intégré
  - Interface React

## Support et questions

Si vous rencontrez des problèmes lors de la création de l'installateur :

1. Vérifiez que vous avez la dernière version de Node.js
2. Supprimez `node_modules` et réinstallez : `npm install`
3. Vérifiez que vous avez assez d'espace disque (2 GB minimum)
4. Consultez les logs d'erreur dans le terminal

## Checklist avant distribution

- [ ] L'application compile sans erreur
- [ ] Vous avez testé l'installation sur votre PC
- [ ] Vous avez testé toutes les fonctionnalités principales
- [ ] La base de données se crée correctement au premier lancement
- [ ] Vous avez mis à jour le numéro de version
- [ ] Vous avez créé une sauvegarde de vos données

Bon build ! 🚀
