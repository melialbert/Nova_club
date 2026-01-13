# Installation NovaClub sur PC Neuf

## Prérequis à installer

### 1. Installer Docker Desktop

**Windows :**
1. Téléchargez Docker Desktop : https://www.docker.com/products/docker-desktop/
2. Exécutez l'installeur
3. Suivez les instructions
4. Redémarrez votre PC si demandé
5. Ouvrez Docker Desktop et attendez qu'il démarre

**Mac :**
1. Téléchargez Docker Desktop pour Mac : https://www.docker.com/products/docker-desktop/
2. Ouvrez le fichier .dmg
3. Glissez Docker dans Applications
4. Ouvrez Docker Desktop et attendez qu'il démarre

**Linux :**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 2. Installer Git (optionnel, pour récupérer le code)

**Windows :**
1. Téléchargez Git : https://git-scm.com/download/win
2. Exécutez l'installeur
3. Utilisez les options par défaut

**Mac :**
```bash
# Si vous avez Homebrew
brew install git
```

**Linux :**
```bash
sudo apt install git
```

---

## Installation de l'Application

### Méthode 1 : Si vous avez le code source (dossier du projet)

1. **Copiez le dossier du projet** sur votre PC neuf

2. **Ouvrez un terminal/invite de commandes** dans le dossier du projet
   - **Windows :** Clic droit dans le dossier → "Ouvrir dans le terminal" ou "Git Bash Here"
   - **Mac :** Terminal → `cd /chemin/vers/le/projet`
   - **Linux :** Terminal → `cd /chemin/vers/le/projet`

3. **Démarrez l'application :**

   **Windows :**
   ```bash
   ./start.bat
   ```
   Ou double-cliquez sur le fichier `start.bat`

   **Mac/Linux :**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

4. **Attendez le démarrage** (1-2 minutes la première fois)

5. **Ouvrez votre navigateur** et allez sur : http://localhost:3000

### Méthode 2 : Si vous avez le code sur Git/GitHub

1. **Clonez le dépôt :**
   ```bash
   git clone [URL_DU_DEPOT]
   cd novaclub
   ```

2. **Suivez les étapes 3-5 de la Méthode 1**

---

## Configuration Initiale

### 1. Fichier .env (configuration automatique)

Le fichier `.env` devrait déjà exister. S'il n'existe pas :

1. **Copiez le fichier exemple :**
   ```bash
   # Windows
   copy .env.example .env

   # Mac/Linux
   cp .env.example .env
   ```

2. **Le fichier contient déjà les bonnes valeurs**, vous n'avez rien à modifier pour une utilisation locale

### 2. Créer les comptes de test (optionnel)

Après le premier démarrage, vous pouvez créer des comptes de test :

**Windows :**
```bash
./creer-utilisateurs.bat
```

**Mac/Linux :**
```bash
chmod +x creer-utilisateurs.sh
./creer-utilisateurs.sh
```

Cela créera 3 comptes :
- **Super Admin :** `admin@novaclub.fr` / `Admin123!`
- **Club Admin :** `club@novaclub.fr` / `Club123!`
- **Coach :** `coach@novaclub.fr` / `Coach123!`

---

## Première Utilisation

### 1. Accédez à l'application

Ouvrez votre navigateur et allez sur : **http://localhost:3000**

### 2. Connectez-vous

Utilisez un des comptes de test ou créez-en un nouveau.

### 3. Installez l'application (PWA)

Pour utiliser l'application hors ligne :

1. **Sur Chrome/Edge :**
   - Cliquez sur l'icône "+" dans la barre d'adresse
   - Cliquez "Installer NovaClub"

2. **Attendez la synchronisation initiale**
   - L'application télécharge toutes les données localement
   - Attendez 10-15 secondes

3. **Testez le mode hors ligne :**
   - Désactivez votre WiFi
   - L'application continue de fonctionner !

---

## Commandes Utiles

### Démarrer l'application
```bash
# Windows
./start.bat

# Mac/Linux
./start.sh
```

### Arrêter l'application
```bash
# Windows
docker-compose down

# Mac/Linux
docker-compose down
```

### Voir les logs (si problème)
```bash
docker-compose logs
```

### Redémarrer complètement
```bash
# Windows
docker-compose down
./start.bat

# Mac/Linux
docker-compose down
./start.sh
```

### Réinitialiser complètement (ATTENTION : supprime les données)
```bash
# Arrêter et supprimer tout
docker-compose down -v

# Redémarrer
./start.bat   # Windows
./start.sh    # Mac/Linux
```

---

## Vérifier que tout fonctionne

### 1. Docker est en cours d'exécution

```bash
docker ps
```

Vous devriez voir 2 conteneurs :
- `novaclub-backend`
- `novaclub-db`

### 2. L'application web est accessible

Ouvrez : http://localhost:3000

### 3. Le backend répond

Ouvrez : http://localhost:8000/docs

Vous devriez voir la documentation de l'API.

### 4. Base de données accessible

```bash
docker exec -it novaclub-db psql -U novaclub -d novaclub
```

Pour sortir : tapez `\q` puis Entrée

---

## Problèmes Courants

### Docker Desktop n'est pas démarré

**Erreur :** `Cannot connect to the Docker daemon`

**Solution :**
1. Ouvrez Docker Desktop
2. Attendez qu'il soit complètement démarré (icône stable dans la barre des tâches)
3. Réessayez

### Port 3000 ou 8000 déjà utilisé

**Erreur :** `Port 3000 is already in use`

**Solution :**
```bash
# Windows - Trouver et arrêter le processus
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Erreur de permissions (Linux/Mac)

**Erreur :** `Permission denied`

**Solution :**
```bash
sudo usermod -aG docker $USER
# Déconnectez-vous et reconnectez-vous
```

### L'application ne charge pas

**Solutions :**
1. Vérifiez que Docker est démarré
2. Attendez 1-2 minutes (première installation)
3. Vérifiez les logs : `docker-compose logs`
4. Redémarrez : `docker-compose down && ./start.sh`

### Base de données vide

**Solution :**
```bash
# Windows
./creer-utilisateurs.bat

# Mac/Linux
./creer-utilisateurs.sh
```

---

## Configuration pour Réseau Local

Si vous voulez accéder à l'application depuis d'autres appareils sur votre réseau :

### 1. Trouver votre adresse IP locale

**Windows :**
```bash
ipconfig
```
Cherchez "Adresse IPv4" (ex: 192.168.1.100)

**Mac/Linux :**
```bash
ifconfig
# ou
ip addr show
```

### 2. Configurer l'accès

Le serveur écoute déjà sur `0.0.0.0:3000`, donc accessible depuis le réseau.

### 3. Accéder depuis un autre appareil

Sur votre téléphone/tablette, ouvrez :
```
http://[VOTRE_IP]:3000
```
Exemple : `http://192.168.1.100:3000`

### 4. Installer sur mobile

Suivez le guide dans `GUIDE_INSTALLATION_PWA.md`

---

## Mise à jour de l'application

Si vous recevez une nouvelle version :

1. **Arrêtez l'application :**
   ```bash
   docker-compose down
   ```

2. **Remplacez les fichiers** avec la nouvelle version

3. **Redémarrez :**
   ```bash
   # Windows
   ./start.bat

   # Mac/Linux
   ./start.sh
   ```

4. **Si nécessaire, reconstruisez les conteneurs :**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   ./start.bat   # ou ./start.sh
   ```

---

## Support et Documentation

- **Guide d'installation PWA :** `GUIDE_INSTALLATION_PWA.md`
- **Guide utilisateur :** `docs/GUIDE_UTILISATEUR.md`
- **Documentation technique :** `ARCHITECTURE.md`
- **Démarrage rapide :** `DEMARRAGE_RAPIDE.md`

---

## Résumé : Installation en 3 étapes

1. **Installez Docker Desktop** et démarrez-le
2. **Ouvrez un terminal** dans le dossier du projet
3. **Exécutez :** `./start.bat` (Windows) ou `./start.sh` (Mac/Linux)

C'est tout ! L'application sera accessible sur http://localhost:3000

**Propulsé par Nova Company Technology**
