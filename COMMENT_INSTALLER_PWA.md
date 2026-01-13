# Comment installer NovaClub comme application

## Pourquoi installer ?

Une fois installée, l'application :
- Fonctionne SANS INTERNET
- S'ouvre dans sa propre fenêtre (comme une vraie application)
- Apparaît dans votre menu Démarrer/Applications
- Synchronise automatiquement quand internet revient

---

## 1. Redémarrer l'application (IMPORTANT)

Avant d'installer, redémarrez l'application pour activer les nouvelles fonctionnalités :

```bash
docker-compose down
./start.bat   # Windows
./start.sh    # Mac/Linux
```

Attendez 30 secondes.

---

## 2. Installer sur PC (Chrome)

### Méthode 1 : Via la barre d'adresse (plus simple)

1. Ouvrez **http://localhost:3000** dans Chrome
2. Attendez que la page charge complètement (10 secondes)
3. Regardez dans la **barre d'adresse** (en haut), à droite
4. Vous devriez voir une icône **⊕** (cercle avec un +)
5. Cliquez dessus
6. Cliquez sur **"Installer NovaClub"**
7. L'application s'installe et s'ouvre dans une nouvelle fenêtre !

### Méthode 2 : Via le menu Chrome

Si vous ne voyez pas l'icône dans la barre d'adresse :

1. Ouvrez **http://localhost:3000**
2. Cliquez sur le menu Chrome (les **3 points verticaux** en haut à droite)
3. Allez dans **"Enregistrer et partager"**
4. Cliquez sur **"Installer NovaClub..."**
5. Confirmez l'installation

---

## 3. Installer sur PC (Edge)

### Méthode 1 : Via la barre d'adresse

1. Ouvrez **http://localhost:3000** dans Edge
2. Regardez dans la barre d'adresse
3. Cliquez sur l'icône **+** ou **ordinateur**
4. Cliquez sur **"Installer"**

### Méthode 2 : Via le menu Edge

1. Ouvrez **http://localhost:3000**
2. Cliquez sur le menu Edge (les **3 points horizontaux**)
3. Allez dans **"Applications"**
4. Cliquez sur **"Installer ce site en tant qu'application"**

---

## 4. Installer sur téléphone Android (Chrome)

### Configurer l'accès réseau d'abord

1. Sur votre PC, ouvrez un terminal et tapez :
   ```bash
   ipconfig    # Windows
   ifconfig    # Mac/Linux
   ```

2. Notez votre adresse IP (exemple : **192.168.1.100**)

3. PC et téléphone doivent être sur le **même WiFi**

### Installer l'application

1. Sur votre téléphone, ouvrez Chrome
2. Allez sur **http://192.168.1.100:3000** (remplacez par votre IP)
3. Attendez que la page charge
4. Chrome affiche automatiquement **"Ajouter NovaClub à l'écran d'accueil"**
5. Appuyez sur **"Installer"** ou **"Ajouter"**
6. L'icône apparaît sur votre écran d'accueil !

**Alternative :**
- Menu Chrome (3 points) → **"Ajouter à l'écran d'accueil"**

---

## 5. Installer sur iPhone/iPad (Safari)

### Configurer l'accès réseau (comme Android)

1. Trouvez l'IP de votre PC (voir section Android ci-dessus)
2. Sur votre iPhone/iPad, ouvrez Safari
3. Allez sur **http://[VOTRE-IP]:3000**

### Installer l'application

1. Attendez que la page charge
2. Appuyez sur le bouton de **partage** (carré avec flèche vers le haut)
3. Faites défiler et appuyez sur **"Sur l'écran d'accueil"**
4. Appuyez sur **"Ajouter"**
5. L'icône apparaît sur votre écran d'accueil !

---

## 6. Vérifier que ça marche

### Test du mode hors ligne

1. Ouvrez l'application installée
2. Connectez-vous avec votre compte
3. Attendez 10-15 secondes (synchronisation)
4. **Désactivez le WiFi** sur votre appareil
5. Naviguez dans l'application → **ça marche sans internet !**
6. Réactivez le WiFi → l'application se synchronise automatiquement

### Que faire en mode hors ligne ?

Vous pouvez :
- Voir tous les membres
- Marquer les présences
- Voir les paiements
- Consulter les licences
- Ajouter/modifier des données

**Quand vous retrouvez internet**, toutes vos modifications sont automatiquement synchronisées !

---

## Problèmes courants

### Je ne vois pas le bouton d'installation sur PC

**Solutions :**
1. Vérifiez que vous utilisez **Chrome ou Edge** (pas Firefox)
2. Allez sur **http://localhost:3000** (pas 127.0.0.1)
3. Redémarrez l'application :
   ```bash
   docker-compose down
   ./start.bat   # ou ./start.sh
   ```
4. Attendez 30 secondes puis rechargez la page
5. Ouvrez la **Console** (F12) → regardez s'il y a des erreurs

### Sur mobile : "Impossible de se connecter"

**Solutions :**
1. Vérifiez que PC et téléphone sont sur le **même WiFi**
2. Vérifiez l'adresse IP de votre PC :
   ```bash
   ipconfig    # Windows
   ifconfig    # Mac/Linux
   ```
3. Essayez d'ouvrir http://[IP]:3000 dans le navigateur mobile
4. Vérifiez que le pare-feu Windows n'bloque pas le port 3000

### L'application ne fonctionne pas hors ligne

**Solutions :**
1. Assurez-vous d'avoir attendu 10-15 secondes après connexion
2. Vérifiez la synchronisation :
   - Allez dans Paramètres
   - Regardez la section "Synchronisation"
3. Désinstallez et réinstallez l'application
4. Reconnectez-vous et attendez la synchronisation

### "Service Worker registration failed"

**Solution :**
1. Redémarrez complètement l'application :
   ```bash
   docker-compose down -v
   ./start.bat   # ou ./start.sh
   ```
2. Videz le cache du navigateur (Ctrl+Shift+Del)
3. Rechargez la page

---

## Désinstaller l'application

### Sur PC (Chrome/Edge)
1. Clic droit sur l'icône de l'application
2. **"Désinstaller"**

**Ou :**
- Chrome : **chrome://apps** → Clic droit → Supprimer
- Edge : Paramètres → Applications → Trouver NovaClub → Désinstaller

### Sur Android
1. Maintenez l'icône appuyée
2. **"Désinstaller"** ou glissez vers "Supprimer"

### Sur iPhone/iPad
1. Maintenez l'icône appuyée
2. **"Supprimer l'app"**

---

## Pour aller plus loin

- L'application utilise **IndexedDB** pour stocker les données localement
- Le **Service Worker** permet le fonctionnement hors ligne
- La synchronisation est automatique et bidirectionnelle
- Les conflits sont gérés automatiquement (dernière modification gagne)

---

**NovaClub - Propulsé par Nova Company Technology**
