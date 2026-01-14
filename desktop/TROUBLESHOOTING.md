# Guide de Depannage - Application Desktop

## Erreur : ERR_CONNECTION_REFUSED sur le port 3001

### Symptomes
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
:3001/api/members:1  Failed to load resource
Error loading stats: TypeError: Failed to fetch
```

### Cause
Le **serveur backend n'est pas demarre**. Vous avez probablement lance seulement le frontend.

### Solution Rapide

**Arretez le serveur actuel** (Ctrl+C dans le terminal), puis relancez avec :

**Windows :**
```bash
cd desktop
npm run dev
```

**Linux/macOS :**
```bash
cd desktop
npm run dev
```

### Verification

1. **Verifiez que le backend tourne :**
   - Ouvrez http://localhost:3001/health dans votre navigateur
   - Vous devriez voir : `{"status":"ok","message":"Backend running"}`

2. **Verifiez que le frontend tourne :**
   - Le frontend est sur http://localhost:5174
   - La page doit se charger correctement

---

## Commandes de Demarrage

### Option 1 : Mode Developpement Complet (RECOMMANDE)

Lance backend + frontend dans le navigateur.

```bash
cd desktop
npm run dev
```

**Resultat :**
- Backend API : http://localhost:3001
- Frontend Web : http://localhost:5174

### Option 2 : Application Electron

Lance backend + application Electron native.

```bash
cd desktop
npm run electron:dev
```

**Resultat :**
- Backend API : http://localhost:3001
- Fenetre Electron s'ouvre automatiquement

### Option 3 : Scripts Automatises

**Windows :**
- `start-dev-complete.bat` - Lance backend + frontend web
- `start-dev.bat` - Lance Electron complet

**Linux/macOS :**
```bash
chmod +x start-dev-complete.sh
./start-dev-complete.sh
```

---

## Erreurs Communes

### 1. Port 3001 deja utilise

**Erreur :**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution Windows :**
```bash
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

**Solution Linux/macOS :**
```bash
lsof -ti:3001 | xargs kill -9
```

### 2. Port 5174 deja utilise

**Erreur :**
```
Port 5174 is in use, trying another one...
```

**Solution Windows :**
```bash
netstat -ano | findstr :5174
taskkill /PID <PID_NUMBER> /F
```

**Solution Linux/macOS :**
```bash
lsof -ti:5174 | xargs kill -9
```

### 3. Module non trouve

**Erreur :**
```
Cannot find module 'express'
Error: Cannot find module 'better-sqlite3'
```

**Solution :**
```bash
cd desktop
rm -rf node_modules package-lock.json  # ou del sur Windows
npm install
```

### 4. Base de donnees verrouillee

**Erreur :**
```
Error: SQLITE_BUSY: database is locked
```

**Solution :**
1. Fermez toutes les instances de l'application
2. Supprimez les fichiers temporaires :
   ```bash
   rm data/club_management.db-shm
   rm data/club_management.db-wal
   ```
3. Relancez l'application

### 5. Erreur d'authentification

**Erreur :**
```
401 Unauthorized
Invalid token
```

**Solution :**
1. Deconnectez-vous de l'application
2. Effacez le localStorage du navigateur (F12 > Application > Local Storage)
3. Reconnectez-vous avec :
   - Email : `admin@club.fr`
   - Mot de passe : `admin123`

---

## Verification Systematique

Si l'application ne fonctionne pas, verifiez dans l'ordre :

### 1. Node.js est installe

```bash
node --version
```

Doit afficher v18 ou superieur.

### 2. Dependances installees

```bash
cd desktop
npm install
```

### 3. Backend demarre

```bash
npm run dev:backend
```

Ouvrez http://localhost:3001/health - doit afficher `{"status":"ok"}`

### 4. Frontend demarre

```bash
npm run dev:frontend
```

Ouvrez http://localhost:5174 - la page doit charger

### 5. Les deux ensemble

```bash
npm run dev
```

Les deux doivent fonctionner ensemble.

---

## Comparaison des Methodes

| Methode | Backend | Frontend | Electron | Quand utiliser |
|---------|---------|----------|----------|----------------|
| `npm run dev` | ✅ | ✅ Navigateur | ❌ | Developpement web |
| `npm run electron:dev` | ✅ | ✅ Electron | ✅ | Test de l'app complete |
| `npm run dev:backend` | ✅ | ❌ | ❌ | Test API uniquement |
| `npm run dev:frontend` | ❌ | ✅ | ❌ | ⚠️ CAUSE L'ERREUR ! |

---

## Reset Complet

Si rien ne fonctionne, reset complet :

### 1. Arretez tout

```bash
# Ctrl+C dans tous les terminaux
# Fermez toutes les fenetres Electron
```

### 2. Nettoyez

```bash
cd desktop

# Supprimez les dependances
rm -rf node_modules
rm -rf package-lock.json

# Supprimez les builds
rm -rf dist
rm -rf dist-electron

# Supprimez le cache Vite
rm -rf .vite
```

### 3. Reinstallez

```bash
npm install
```

### 4. Relancez

```bash
npm run dev
```

---

## Logs et Debogage

### Voir les logs du backend

Le backend affiche ses logs dans le terminal :
```
Backend running on http://localhost:3001
Database path: /path/to/club_management.db
Tables created successfully
```

### Voir les logs du frontend

Ouvrez la console du navigateur (F12) pour voir les erreurs JavaScript.

### Activer le mode debug

Ajoutez dans `.env` (desktop/) :
```
NODE_ENV=development
DEBUG=*
```

---

## Contact Support

Si le probleme persiste :

1. Notez le message d'erreur complet
2. Notez la commande utilisee pour lancer l'app
3. Notez votre systeme d'exploitation
4. Verifiez que Node.js est bien v18+
5. Consultez GUIDE_DEMARRAGE.md pour plus d'infos

---

## Liens Utiles

- Guide de demarrage : `GUIDE_DEMARRAGE.md`
- Reinitialiser la base : `REINITIALISER_DONNEES.md`
- Script de reset : `reset-database.bat` (Windows) ou `reset-database.sh` (Linux/macOS)
