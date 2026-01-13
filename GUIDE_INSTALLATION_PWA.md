# Guide d'Installation - NovaClub (Mode Hors Ligne)

## Oui, l'application fonctionne SANS connexion internet !

NovaClub est une **PWA (Progressive Web App)** qui permet de :
- ✅ Travailler sans connexion internet
- ✅ Installer l'application sur votre appareil (ordinateur, tablette, téléphone)
- ✅ Synchroniser automatiquement les données quand vous êtes en ligne
- ✅ Accéder rapidement depuis votre écran d'accueil

---

## Installation sur ORDINATEUR (Windows/Mac/Linux)

### Google Chrome / Microsoft Edge / Brave

1. **Ouvrez l'application** dans votre navigateur
   - Accédez à l'URL : `http://localhost:3000` (ou l'adresse de votre serveur)

2. **Installez l'application**
   - Cherchez l'icône d'installation dans la barre d'adresse (à droite)
   - Cliquez sur l'icône **"+"** ou **"Installer"**
   - OU cliquez sur le menu (3 points verticaux) → **"Installer NovaClub..."**

3. **Confirmation**
   - Une fenêtre popup apparaît
   - Cliquez sur **"Installer"**

4. **L'application est maintenant installée !**
   - Elle s'ouvre dans sa propre fenêtre
   - Une icône est ajoutée sur votre bureau et dans le menu Démarrer
   - Vous pouvez l'ouvrir comme n'importe quelle application

### Firefox

Firefox ne supporte pas encore l'installation de PWA. Utilisez Chrome ou Edge à la place.

---

## Installation sur TÉLÉPHONE / TABLETTE

### Android (Chrome / Samsung Internet / Edge)

1. **Ouvrez l'application** dans votre navigateur mobile
   - Accédez à l'URL de votre serveur

2. **Méthode 1 - Banner d'installation**
   - Un bandeau apparaît en bas de l'écran
   - Cliquez sur **"Ajouter à l'écran d'accueil"** ou **"Installer"**

3. **Méthode 2 - Menu du navigateur**
   - Cliquez sur le menu (3 points verticaux en haut à droite)
   - Sélectionnez **"Ajouter à l'écran d'accueil"** ou **"Installer l'application"**

4. **Confirmation**
   - Confirmez en cliquant sur **"Ajouter"** ou **"Installer"**

5. **L'application est installée !**
   - Une icône apparaît sur votre écran d'accueil
   - Ouvrez-la comme n'importe quelle application

### iPhone / iPad (Safari)

1. **Ouvrez l'application** dans Safari
   - Important : utilisez Safari (pas Chrome)

2. **Ouvrez le menu de partage**
   - Cliquez sur l'icône de partage (carré avec flèche vers le haut) en bas de l'écran

3. **Ajoutez à l'écran d'accueil**
   - Faites défiler et sélectionnez **"Sur l'écran d'accueil"**
   - Ou cherchez l'option **"Ajouter à l'écran d'accueil"**

4. **Personnalisez (optionnel)**
   - Vous pouvez modifier le nom
   - Cliquez sur **"Ajouter"** en haut à droite

5. **L'application est installée !**
   - Une icône apparaît sur votre écran d'accueil
   - Ouvrez-la comme n'importe quelle application

---

## Comment utiliser l'application HORS LIGNE ?

### 1. Première connexion (AVEC internet)

Avant d'utiliser l'application hors ligne, vous devez :
- Vous connecter une première fois avec internet
- L'application téléchargera toutes vos données localement
- Les données sont stockées sur votre appareil

### 2. Utilisation hors ligne (SANS internet)

Une fois installée et synchronisée :
- ✅ Ouvrez l'application normalement
- ✅ Toutes vos données sont disponibles
- ✅ Vous pouvez :
  - Consulter les membres
  - Enregistrer des paiements
  - Marquer les présences
  - Générer des factures
  - Gérer les licences
  - Voir la comptabilité

### 3. Synchronisation automatique (retour en ligne)

Quand vous retrouvez une connexion :
- 🔄 L'application synchronise automatiquement
- 📤 Envoie les modifications au serveur
- 📥 Récupère les nouvelles données
- ⚡ La synchronisation se fait toutes les 30 secondes

---

## Vérifier que le mode hors ligne fonctionne

### Test simple

1. **Ouvrez l'application** (avec internet)
2. **Attendez 5 secondes** (chargement des données)
3. **Désactivez votre connexion internet**
   - Mode avion sur téléphone
   - Wifi désactivé sur ordinateur
4. **Rechargez la page** ou **naviguez dans l'application**
5. **Tout doit fonctionner !** ✅

### Console du navigateur

Vérifiez que le Service Worker est actif :

1. **Ouvrez les outils de développement**
   - Chrome/Edge : `F12` ou `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Safari (iOS) : Réglages → Safari → Avancé → Activer Inspecteur Web

2. **Allez dans l'onglet "Console"**
   - Vous devriez voir : **"Service Worker enregistré avec succès"**

3. **Allez dans l'onglet "Application"** (Chrome)
   - Section **"Service Workers"** : doit montrer "Activated and is running"
   - Section **"Storage"** → **"IndexedDB"** → **"novaclub_db"** : doit contenir vos données

---

## Désinstaller l'application

### Sur ordinateur

**Chrome / Edge / Brave :**
1. Ouvrez l'application
2. Cliquez sur le menu (3 points) en haut à droite
3. Sélectionnez **"Désinstaller NovaClub..."**
4. Confirmez

**Alternative :**
- Windows : Paramètres → Applications → NovaClub → Désinstaller
- Mac : Finder → Applications → Glissez NovaClub vers la corbeille

### Sur téléphone / tablette

**Android :**
- Maintenez l'icône de l'application appuyée
- Cliquez sur **"Désinstaller"** ou glissez vers la corbeille

**iPhone / iPad :**
- Maintenez l'icône de l'application appuyée
- Cliquez sur **"Supprimer l'app"**
- Confirmez **"Supprimer de l'écran d'accueil"**

---

## Problèmes courants

### L'option d'installation n'apparaît pas

**Causes possibles :**
- Vous utilisez HTTP au lieu de HTTPS (en production)
- Le navigateur ne supporte pas les PWA
- L'application est déjà installée

**Solutions :**
- Utilisez Chrome, Edge ou Safari
- En production, utilisez HTTPS obligatoirement
- Vérifiez que l'application n'est pas déjà installée

### Les données ne se synchronisent pas

**Solutions :**
1. Vérifiez votre connexion internet
2. Rechargez la page
3. Vérifiez la console pour les erreurs
4. Assurez-vous que le serveur backend est accessible

### L'application ne fonctionne pas hors ligne

**Solutions :**
1. Connectez-vous au moins une fois avec internet
2. Attendez que les données se téléchargent
3. Vérifiez que le Service Worker est bien enregistré (voir section ci-dessus)
4. Videz le cache et reconnectez-vous

### Vider le cache

**Chrome / Edge :**
1. Outils de développement (`F12`)
2. Onglet **"Application"**
3. Section **"Clear storage"**
4. Cliquez sur **"Clear site data"**

---

## Avantages du mode hors ligne

✅ **Travaillez n'importe où**
- Pas besoin d'internet permanent
- Parfait pour les zones avec mauvaise connexion
- Idéal pour les déplacements

✅ **Rapidité**
- Les données sont sur votre appareil
- Chargement instantané
- Pas de latence réseau

✅ **Fiabilité**
- Fonctionne même si le serveur est temporairement inaccessible
- Aucune perte de données

✅ **Économie de données**
- Synchronisation intelligente
- Seulement les modifications sont envoyées
- Pas de rechargement constant

---

## Support technique

Pour toute question ou problème :
- Consultez la console du navigateur pour les messages d'erreur
- Vérifiez que vous utilisez la dernière version de l'application
- Contactez l'équipe de support technique

**Propulsé par Nova Company Technology**
