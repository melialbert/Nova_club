# Guide de Reinitialisation des Donnees

Ce guide explique comment supprimer toutes les donnees et repartir avec une base propre.

## Pourquoi les donnees persistent-elles ?

C'est **NORMAL** ! L'application utilise des bases de donnees locales qui sauvegardent vos donnees de maniere permanente :

- **Version Desktop** : Base SQLite stockee sur le disque
- **Version PWA** : Base IndexedDB stockee dans le navigateur

Les donnees NE DISPARAISSENT PAS au redemarrage du serveur - c'est voulu pour ne pas perdre vos informations !

---

## Reinitialiser la Version Desktop

### Windows

1. **Arreter l'application** si elle est en cours d'execution
2. **Executer le script** :
   ```bash
   desktop\reset-database.bat
   ```
3. **Redemarrer l'application**

### Linux / macOS

1. **Arreter l'application** si elle est en cours d'execution
2. **Rendre le script executable** (premiere fois seulement) :
   ```bash
   chmod +x desktop/reset-database.sh
   ```
3. **Executer le script** :
   ```bash
   ./desktop/reset-database.sh
   ```
4. **Redemarrer l'application**

### Manuellement

Supprimez le fichier `club_management.db` situe dans :

**Windows :**
```
%APPDATA%\desktop\club_management.db
```

**macOS :**
```
~/Library/Application Support/desktop/club_management.db
```

**Linux :**
```
~/.config/desktop/club_management.db
```

**Ou dans le dossier local :**
```
desktop/data/club_management.db
```

---

## Reinitialiser la Version PWA

### Methode 1 : Via les Outils Developpeur

1. **Ouvrir l'application PWA** dans le navigateur
2. **Ouvrir les outils developpeur** (F12)
3. **Aller dans l'onglet "Application"** (ou "Storage")
4. **Dans le menu de gauche** :
   - Cliquer sur **"IndexedDB"**
   - Developper **"novaclub_db"**
   - Clic droit sur **"novaclub_db"**
   - Selectionner **"Delete database"**
5. **Rafraichir la page** (F5)

### Methode 2 : Via la Console JavaScript

1. **Ouvrir l'application PWA** dans le navigateur
2. **Ouvrir la console** (F12 > Console)
3. **Executer cette commande** :
   ```javascript
   indexedDB.deleteDatabase('novaclub_db');
   location.reload();
   ```

### Methode 3 : Effacer toutes les donnees du site

1. **Ouvrir les outils developpeur** (F12)
2. **Aller dans l'onglet "Application"** (ou "Storage")
3. **Cliquer sur "Clear storage"** en haut
4. **Cliquer sur "Clear site data"**
5. **Rafraichir la page** (F5)

---

## Que se passe-t-il apres la reinitialisation ?

Apres avoir supprime la base de donnees :

### Version Desktop

Au prochain demarrage, l'application va :
1. Creer une nouvelle base de donnees vide
2. Creer un club par defaut
3. Creer un utilisateur admin par defaut :
   - Email : `admin@club.fr`
   - Mot de passe : `admin123`

### Version PWA

Au prochain chargement :
1. Une nouvelle base IndexedDB sera creee
2. Vous devrez vous reconnecter
3. Les donnees seront vides

---

## Sauvegarder les donnees avant reinitialisation

Si vous voulez garder une copie de vos donnees :

### Version Desktop

**Copiez le fichier** `club_management.db` dans un endroit sur :
```bash
# Windows
copy %APPDATA%\desktop\club_management.db C:\backup\

# Linux/macOS
cp ~/.config/desktop/club_management.db ~/backup/
```

### Version PWA

Il n'y a pas de moyen simple d'exporter IndexedDB. Utilisez plutot la synchronisation avec le backend ou exportez les donnees depuis l'interface de l'application.

---

## Questions Frequentes

### Q : Pourquoi mes donnees ne disparaissent pas au redemarrage ?

**R :** C'est normal ! Une base de donnees est faite pour **conserver** les donnees. Si elles disparaissaient a chaque redemarrage, vous perdriez toutes vos informations d'adherents, paiements, etc.

### Q : Comment avoir des donnees de test ?

**R :** Apres reinitialisation, vous pouvez :
1. Utiliser les scripts de creation d'utilisateurs test
2. Ajouter manuellement des adherents via l'interface
3. Importer des donnees depuis un fichier

### Q : La reinitialisation affecte-t-elle le serveur backend ?

**R :** Non ! La reinitialisation ne supprime que les donnees **locales**. Si vous utilisez un backend centralise (PostgreSQL), ces donnees restent intactes.

---

## Support

Si vous rencontrez des problemes lors de la reinitialisation, verifiez :
- Que l'application est bien fermee
- Que vous avez les droits d'acces aux fichiers
- Que vous etes dans le bon dossier

Pour plus d'aide, consultez la documentation complete dans `INDEX_DOCUMENTATION.md`.
