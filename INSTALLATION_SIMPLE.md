# Installation NovaClub - Guide Ultra-Simple

## Ce dont vous avez besoin (PC neuf)

1. **Docker Desktop** (obligatoire)
   - Téléchargez : https://www.docker.com/products/docker-desktop/
   - Installez et démarrez Docker Desktop
   - Attendez que Docker soit complètement démarré

2. **Le dossier NovaClub** (ce dossier)
   - Copiez-le sur votre PC

---

## Installation en 3 clics

### ÉTAPE 1 : Installer Docker

- Téléchargez Docker Desktop depuis https://www.docker.com/products/docker-desktop/
- Double-cliquez sur l'installeur
- Suivez les instructions
- **Redémarrez votre PC**
- Ouvrez Docker Desktop et attendez qu'il démarre (5-10 secondes)

### ÉTAPE 2 : Démarrer l'application

**Sur Windows :**
- Double-cliquez sur le fichier `start.bat`

**Sur Mac/Linux :**
- Double-cliquez sur le fichier `start.sh`
- Si ça ne marche pas, ouvrez un terminal et tapez :
  ```bash
  chmod +x start.sh
  ./start.sh
  ```

### ÉTAPE 3 : Ouvrir l'application

- Attendez 30 secondes
- Ouvrez votre navigateur (Chrome recommandé)
- Allez sur : **http://localhost:3000**

---

## C'est tout ! 🎉

Vous pouvez maintenant :
- Vous connecter avec les comptes de test
- Installer l'application sur votre écran (voir guide ci-dessous)
- Utiliser l'application sans internet

---

## Installer l'application sur votre écran

### Sur PC (Chrome/Edge)

**IMPORTANT : Redémarrez l'application avant d'installer**
```bash
docker-compose down
./start.bat   # ou ./start.sh sur Mac/Linux
```

Ensuite :
1. Ouvrez http://localhost:3000
2. Attendez 10 secondes que la page charge complètement
3. Cherchez l'icône **d'installation** dans la barre d'adresse (à droite) :
   - Chrome : icône **⊕** (cercle avec +)
   - Edge : icône **+** ou **ordinateur**
4. Cliquez dessus → **"Installer NovaClub"**
5. L'application s'ouvre dans sa propre fenêtre !

**Alternative si vous ne voyez pas l'icône :**
- Menu Chrome (3 points verticaux) → **"Enregistrer et partager"** → **"Installer NovaClub..."**
- Menu Edge (3 points horizontaux) → **"Applications"** → **"Installer ce site en tant qu'application"**

### Sur téléphone Android
1. Ouvrez http://[ADRESSE-IP-PC]:3000 dans Chrome
2. Menu (3 points) → **"Ajouter à l'écran d'accueil"**
3. Confirmer

### Sur iPhone/iPad
1. Ouvrez http://[ADRESSE-IP-PC]:3000 dans Safari
2. Bouton de partage → **"Sur l'écran d'accueil"**
3. **"Ajouter"**

---

## Comptes de test (si besoin)

Pour créer des comptes de test automatiquement :

**Windows :** Double-cliquez sur `creer-utilisateurs.bat`

**Mac/Linux :**
```bash
chmod +x creer-utilisateurs.sh
./creer-utilisateurs.sh
```

Comptes créés :
- **admin@novaclub.fr** / **Admin123!** (Super admin)
- **club@novaclub.fr** / **Club123!** (Admin club)
- **coach@novaclub.fr** / **Coach123!** (Coach)

---

## Questions fréquentes

### L'application ne démarre pas ?
1. Vérifiez que Docker Desktop est ouvert et démarré
2. Attendez 1-2 minutes (la première fois c'est plus long)
3. Ouvrez http://localhost:3000

### Comment arrêter l'application ?
Ouvrez un terminal dans le dossier NovaClub et tapez :
```bash
docker-compose down
```

### Comment utiliser sans internet ?
1. Connectez-vous une fois avec internet
2. Installez l'application (voir ci-dessus)
3. Attendez 10 secondes
4. Désactivez internet → ça marche quand même !

### Accéder depuis mon téléphone ?
1. PC et téléphone sur le même WiFi
2. Sur PC, ouvrez un terminal et tapez :
   - Windows : `ipconfig`
   - Mac/Linux : `ifconfig`
3. Notez votre IP (ex: 192.168.1.100)
4. Sur téléphone : http://192.168.1.100:3000

---

## Besoin d'aide ?

Consultez les guides détaillés :
- **INSTALLATION_PC_NEUF.md** - Guide complet
- **GUIDE_INSTALLATION_PWA.md** - Installation mobile
- **DEMARRAGE_RAPIDE.md** - Démarrage rapide
- **README.md** - Documentation complète

---

**NovaClub - Propulsé par Nova Company Technology**
