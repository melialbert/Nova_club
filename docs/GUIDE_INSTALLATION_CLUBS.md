# Guide d'Installation NovaClub pour les Clubs

Ce guide explique comment installer et configurer NovaClub sur l'ordinateur d'un club de judo.

## Prérequis

### Matériel requis
- PC avec Windows 10/11 ou Linux
- Minimum 4 GB de RAM
- 20 GB d'espace disque libre
- Connexion Internet (pour l'installation initiale)

### Logiciels requis
- Docker Desktop (gratuit)

## Installation Docker Desktop

### Windows

1. Télécharger Docker Desktop depuis: https://www.docker.com/products/docker-desktop
2. Double-cliquer sur l'installateur
3. Suivre les instructions d'installation
4. Redémarrer l'ordinateur si demandé
5. Lancer Docker Desktop et attendre qu'il démarre

### Linux

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl start docker
sudo systemctl enable docker

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER
```

## Installation de NovaClub

### 1. Obtenir les fichiers

Copier le dossier `novaclub` sur votre ordinateur (via clé USB ou téléchargement).

### 2. Trouver l'adresse IP de votre PC

#### Windows
```cmd
ipconfig
```
Chercher "Adresse IPv4" (exemple: 192.168.1.8)

#### Linux
```bash
ip addr show
```
Chercher "inet" (exemple: 192.168.1.8)

### 3. Configurer NovaClub

1. Ouvrir le fichier `docker-compose.yml` avec un éditeur de texte
2. Remplacer toutes les occurrences de `192.168.1.8` par votre adresse IP
3. Sauvegarder le fichier

### 4. Démarrer NovaClub

#### Windows
1. Ouvrir PowerShell ou CMD
2. Naviguer vers le dossier novaclub:
   ```cmd
   cd C:\chemin\vers\novaclub
   ```
3. Lancer:
   ```cmd
   docker-compose up -d
   ```

#### Linux
```bash
cd /chemin/vers/novaclub
docker-compose up -d
```

### 5. Attendre le démarrage

L'installation prend environ 2-3 minutes la première fois.

Pour vérifier que tout fonctionne:
```bash
docker-compose ps
```

Tous les services doivent afficher "Up".

## Accéder à NovaClub

### Sur le PC du club

Ouvrir un navigateur et aller à:
- **Application Web**: http://localhost:3000
- **API**: http://localhost:8000

### Sur d'autres appareils du réseau

Remplacer `localhost` par l'IP du PC:
- **Application Web**: http://192.168.1.8:3000
- **API**: http://192.168.1.8:8000

## Premier Démarrage

### 1. Créer le compte du club

1. Aller sur http://192.168.1.8:3000
2. Cliquer sur "Créer un compte"
3. Remplir:
   - Nom du club
   - Vos nom et prénom
   - Email
   - Téléphone
   - Mot de passe
4. Cliquer sur "Créer mon compte"

Vous êtes maintenant connecté en tant qu'administrateur!

### 2. Configurer le club

1. Aller dans "Mon Club"
2. Ajouter les informations:
   - Adresse du club
   - Logo (optionnel)
   - Coordonnées complètes

### 3. Créer les utilisateurs

1. Aller dans "Utilisateurs"
2. Ajouter:
   - Secrétaires (peuvent tout gérer sauf les utilisateurs)
   - Coachs (peuvent marquer présences et paiements)

### 4. Ajouter les adhérents

1. Aller dans "Adhérents"
2. Cliquer sur "Nouvel adhérent"
3. Remplir le formulaire
4. Enregistrer

## Utilisation Quotidienne

### Démarrer NovaClub chaque matin

```bash
docker-compose start
```

### Arrêter NovaClub le soir

```bash
docker-compose stop
```

### Redémarrer en cas de problème

```bash
docker-compose restart
```

## Sauvegarde des Données

### Sauvegarde Automatique

Les données sont automatiquement sauvegardées dans Docker.

### Sauvegarde Manuelle

Pour créer une sauvegarde complète:

```bash
# Arrêter NovaClub
docker-compose stop

# Copier le dossier des données
# Windows
xcopy /E /I novaclub C:\Sauvegardes\novaclub_%date%

# Linux
cp -r novaclub ~/Sauvegardes/novaclub_$(date +%Y%m%d)

# Redémarrer
docker-compose start
```

### Restauration

1. Arrêter NovaClub: `docker-compose down`
2. Remplacer le dossier actuel par la sauvegarde
3. Redémarrer: `docker-compose up -d`

## Accès depuis les Téléphones

### Application Mobile Coach

1. Installer l'APK sur le téléphone Android
2. Configurer l'adresse IP dans les paramètres: `http://192.168.1.8:8000`
3. Se connecter avec le compte coach

### Application Mobile Adhérent

1. Installer l'APK sur le téléphone Android
2. Configurer l'adresse IP: `http://192.168.1.8:8000`
3. Les adhérents peuvent se connecter avec leur email

## Mode Hors Ligne

NovaClub fonctionne même sans Internet!

- Les modifications sont enregistrées localement
- Quand Internet revient, tout se synchronise automatiquement
- Vous verrez un indicateur "Mode hors ligne" en bas de l'écran

## Dépannage

### Les services ne démarrent pas

```bash
# Voir les erreurs
docker-compose logs

# Redémarrer complètement
docker-compose down
docker-compose up -d
```

### Impossible d'accéder à l'application

1. Vérifier que Docker Desktop est lancé
2. Vérifier l'IP dans la barre d'adresse
3. Vérifier le pare-feu Windows

### Données perdues

Restaurer depuis la dernière sauvegarde (voir section Sauvegarde).

### Performance lente

1. Fermer les autres applications
2. Redémarrer l'ordinateur
3. Vérifier l'espace disque disponible

## Mise à Jour

Quand une nouvelle version est disponible:

1. Arrêter NovaClub: `docker-compose down`
2. Faire une sauvegarde complète
3. Remplacer les fichiers par la nouvelle version
4. Redémarrer: `docker-compose up -d`

## Support

En cas de problème:

1. Consulter les logs: `docker-compose logs -f`
2. Vérifier la documentation dans le dossier `docs/`
3. Contacter le support technique

## Conseils

1. **Faites des sauvegardes régulières** (hebdomadaires minimum)
2. **Utilisez un onduleur** pour protéger contre les coupures de courant
3. **Fermez proprement** l'application le soir avec `docker-compose stop`
4. **Gardez le PC à jour** (Windows Update, etc.)
5. **Utilisez un bon antivirus**

## Sécurité

1. Changez le mot de passe admin régulièrement
2. Ne donnez pas les accès admin aux coachs
3. Faites attention aux mots de passe (minimum 8 caractères)
4. Sauvegardez sur un disque externe séparé
5. Ne partagez jamais les identifiants de connexion
