# 🧪 Guide de Test - NovaClub

Guide complet pour tester toutes les fonctionnalités de NovaClub après installation.

---

## 📋 Pré-requis

Avant de commencer les tests, assurez-vous que :

```bash
# 1. Vérifier que tous les services sont démarrés
docker-compose ps

# 2. Vérifier les logs du backend (aucune erreur)
docker-compose logs backend --tail=50

# 3. Vérifier que la PWA est accessible
# Ouvrir http://localhost:3000 dans votre navigateur
```

**✅ Tous les services doivent être "Up"** :
- `novaclub-backend` → Port 8000
- `novaclub-pwa` → Port 3000
- `postgres` → Port 5432
- `redis` → Port 6379
- `adminer` → Port 8080

---

## 🚀 Test 1 : Création de Compte Club

### Étape 1.1 : Accéder à la page d'inscription
1. Ouvrir http://localhost:3000
2. Cliquer sur **"Créer un compte"**

### Étape 1.2 : Remplir le formulaire
```
Informations du Club :
- Nom du club : Club Judo Test
- Téléphone : +221776543210

Votre Compte :
- Prénom : Jean
- Nom : Dupont
- Email : admin@club-test.com
- Mot de passe : Test123456!
```

### Étape 1.3 : Valider
1. Cliquer sur **"Créer mon compte"**
2. **✅ Résultat attendu** :
   - Redirection automatique vers le Dashboard
   - Message de bienvenue affiché
   - Menu de navigation visible

### 🐛 En cas d'erreur

**Erreur CORS** :
```bash
# Rebuild le backend
docker-compose down
docker volume rm novaclub_backend_venv
docker-compose build backend
docker-compose up -d
```

**Erreur "Email already exists"** :
```bash
# Utiliser un autre email ou réinitialiser la DB
docker-compose down -v
docker-compose up -d
# Attendre 30 secondes que la DB démarre
```

---

## 👥 Test 2 : Gestion des Adhérents

### Étape 2.1 : Accéder à la liste des adhérents
1. Dans le menu latéral, cliquer sur **"Adhérents"**
2. **✅ Résultat** : Page vide avec bouton "+ Nouvel adhérent"

### Étape 2.2 : Ajouter un adhérent adulte
1. Cliquer sur **"+ Nouvel adhérent"**
2. Remplir le formulaire :

```
Informations personnelles :
- Prénom : Ahmed
- Nom : Diallo
- Date de naissance : 01/01/1995
- Sexe : Masculin
- Email : ahmed.diallo@email.com
- Téléphone : +221776543211

Adresse :
- Adresse : 25 Rue de la République
- Ville : Dakar
- Pays : Sénégal

Informations sportives :
- Ceinture : Blanche
- Type licence : Compétition
```

3. Cliquer sur **"Enregistrer"**
4. **✅ Résultat** :
   - Message "Adhérent ajouté avec succès"
   - Retour à la liste
   - Ahmed Diallo visible dans la liste

### Étape 2.3 : Ajouter un adhérent enfant
1. Cliquer sur **"+ Nouvel adhérent"**
2. Remplir :

```
Informations personnelles :
- Prénom : Fatou
- Nom : Ndiaye
- Date de naissance : 15/03/2012
- Sexe : Féminin
- Téléphone parent : +221776543212

Adresse :
- Adresse : 10 Avenue Cheikh Anta Diop
- Ville : Dakar
- Pays : Sénégal

Informations sportives :
- Ceinture : Jaune
- Type licence : Loisir
```

3. **✅ Résultat** : Fatou visible dans la liste

### Étape 2.4 : Rechercher un adhérent
1. Dans la barre de recherche, taper : **"Ahmed"**
2. **✅ Résultat** : Seul Ahmed est affiché
3. Effacer la recherche → Tous les adhérents réapparaissent

### Étape 2.5 : Filtrer par ceinture
1. Cliquer sur le menu déroulant "Toutes les ceintures"
2. Sélectionner **"Blanche"**
3. **✅ Résultat** : Seul Ahmed est affiché

### Étape 2.6 : Modifier un adhérent
1. Cliquer sur Ahmed dans la liste
2. Modifier sa ceinture → **"Jaune-Orange"**
3. Cliquer sur **"Enregistrer"**
4. **✅ Résultat** : Ceinture mise à jour dans la liste

---

## 💰 Test 3 : Gestion des Paiements

### Étape 3.1 : Accéder aux paiements
1. Dans le menu, cliquer sur **"Paiements"**
2. **✅ Résultat** : Liste vide

### Étape 3.2 : Enregistrer un paiement de cotisation
1. Cliquer sur **"+ Nouveau paiement"**
2. Remplir :

```
Type de paiement : Cotisation
Adhérent : Ahmed Diallo
Montant : 50000 (50 000 FCFA)
Méthode : Espèces
Date : [Aujourd'hui]
Description : Cotisation mensuelle janvier 2026
```

3. Cliquer sur **"Enregistrer"**
4. **✅ Résultat** :
   - Message "Paiement enregistré"
   - Paiement visible dans la liste
   - Montant affiché : 50 000 FCFA

### Étape 3.3 : Enregistrer un paiement de licence
1. Cliquer sur **"+ Nouveau paiement"**
2. Remplir :

```
Type de paiement : Licence
Adhérent : Fatou Ndiaye
Montant : 25000
Méthode : Wave
Date : [Aujourd'hui]
Description : Licence loisir 2026
```

3. **✅ Résultat** : 2 paiements dans la liste

### Étape 3.4 : Filtrer les paiements
1. Filtrer par type → **"Cotisation"**
2. **✅ Résultat** : Seul le paiement d'Ahmed apparaît
3. Filtrer par méthode → **"Wave"**
4. **✅ Résultat** : Seul le paiement de Fatou apparaît

### Étape 3.5 : Rechercher un paiement
1. Dans la recherche, taper : **"Ahmed"**
2. **✅ Résultat** : Seul le paiement d'Ahmed apparaît

---

## 📊 Test 4 : Tableau de Bord

### Étape 4.1 : Accéder au dashboard
1. Cliquer sur **"Tableau de bord"** dans le menu
2. **✅ Résultat attendu** :

```
Statistiques affichées :
✓ Adhérents actifs : 2
✓ Revenus du mois : 75 000 FCFA
✓ Présences ce mois : 0
✓ Licences valides : 0
```

### Étape 4.2 : Vérifier les graphiques
1. Scroller vers le bas
2. **✅ Résultat** :
   - Graphique "Revenus par mois" visible
   - Graphique "Répartition des adhérents" visible
   - Liste des derniers paiements visible

---

## 🔄 Test 5 : Mode Hors Ligne (PWA)

### Étape 5.1 : Activer le mode hors ligne
1. Dans Chrome DevTools (F12), aller dans l'onglet **"Application"**
2. Section **"Service Workers"** → Cocher **"Offline"**
3. Ou simuler : **Network** → **"Offline"**

### Étape 5.2 : Tester les fonctionnalités offline
1. Aller sur **"Adhérents"**
2. **✅ Résultat** : Liste toujours visible (données en cache)
3. Ajouter un nouvel adhérent :

```
Prénom : Mamadou
Nom : Sow
Date de naissance : 10/05/2008
...
```

4. Cliquer sur **"Enregistrer"**
5. **✅ Résultat** :
   - Message "Sauvegardé localement, sera synchronisé"
   - Badge de synchronisation visible
   - Adhérent visible dans la liste

### Étape 5.3 : Reconnecter et synchroniser
1. Désactiver le mode Offline
2. **✅ Résultat** :
   - Synchronisation automatique
   - Badge disparaît
   - Données envoyées au serveur

---

## 🔐 Test 6 : Déconnexion et Reconnexion

### Étape 6.1 : Se déconnecter
1. Cliquer sur l'icône utilisateur en haut à droite
2. Cliquer sur **"Déconnexion"**
3. **✅ Résultat** : Redirection vers la page de connexion

### Étape 6.2 : Se reconnecter
1. Remplir :

```
Email : admin@club-test.com
Mot de passe : Test123456!
```

2. Cliquer sur **"Connexion"**
3. **✅ Résultat** :
   - Redirection vers le Dashboard
   - Toutes les données toujours présentes

---

## 🔍 Test 7 : API Backend (Optionnel)

### Étape 7.1 : Accéder à la documentation API
1. Ouvrir http://localhost:8000/docs
2. **✅ Résultat** : Interface Swagger visible

### Étape 7.2 : Tester un endpoint
1. Cliquer sur **POST /api/v1/auth/login**
2. Cliquer sur **"Try it out"**
3. Remplir :

```json
{
  "email": "admin@club-test.com",
  "password": "Test123456!"
}
```

4. Cliquer sur **"Execute"**
5. **✅ Résultat** :
   - Code 200
   - Token JWT dans la réponse

---

## 🗄️ Test 8 : Base de Données (Optionnel)

### Étape 8.1 : Accéder à Adminer
1. Ouvrir http://localhost:8080
2. Se connecter :

```
Système : PostgreSQL
Serveur : postgres
Utilisateur : novaclub
Mot de passe : novaclub123
Base : novaclub_db
```

### Étape 8.2 : Vérifier les données
1. Cliquer sur la table **"users"**
2. **✅ Résultat** : Votre compte admin visible
3. Cliquer sur la table **"members"**
4. **✅ Résultat** : Ahmed, Fatou (et Mamadou si créé) visibles
5. Cliquer sur la table **"payments"**
6. **✅ Résultat** : Les 2 paiements visibles

---

## 📱 Test 9 : Responsive Design

### Étape 9.1 : Tester sur mobile
1. Dans Chrome DevTools (F12), cliquer sur l'icône mobile
2. Sélectionner **"iPhone 12 Pro"**
3. **✅ Résultat** :
   - Menu burger visible
   - Layout adapté
   - Formulaires utilisables

### Étape 9.2 : Tester sur tablette
1. Sélectionner **"iPad Pro"**
2. **✅ Résultat** : Interface optimisée pour tablette

---

## ✅ Checklist Complète

Cochez chaque test réussi :

### Authentification
- [ ] Création de compte club
- [ ] Connexion
- [ ] Déconnexion
- [ ] Reconnexion

### Adhérents
- [ ] Ajout adhérent adulte
- [ ] Ajout adhérent enfant
- [ ] Modification adhérent
- [ ] Recherche adhérent
- [ ] Filtrage par ceinture
- [ ] Liste affichée correctement

### Paiements
- [ ] Enregistrement paiement cotisation
- [ ] Enregistrement paiement licence
- [ ] Recherche paiement
- [ ] Filtrage par type
- [ ] Filtrage par méthode

### Dashboard
- [ ] Statistiques affichées
- [ ] Graphiques visibles
- [ ] Derniers paiements affichés

### Mode Offline
- [ ] Données en cache accessibles
- [ ] Ajout offline fonctionne
- [ ] Synchronisation automatique

### Technique
- [ ] API accessible (Swagger)
- [ ] Base de données accessible (Adminer)
- [ ] Aucune erreur dans la console
- [ ] Responsive mobile
- [ ] Responsive tablette

---

## 🐛 Résolution de Problèmes

### Problème : "Network Error"
```bash
# Vérifier que le backend est démarré
docker-compose ps
docker-compose logs backend
```

### Problème : Données ne s'affichent pas
```bash
# Vérifier la base de données
docker-compose exec postgres psql -U novaclub -d novaclub_db -c "SELECT COUNT(*) FROM members;"
```

### Problème : Service Worker ne fonctionne pas
1. Chrome DevTools → Application → Service Workers
2. Cliquer sur **"Unregister"**
3. Rafraîchir la page (F5)
4. Service Worker se réenregistrera automatiquement

### Problème : Rebuild nécessaire
```bash
docker-compose down
docker-compose build backend
docker-compose up -d
```

---

## 📊 Résultats Attendus

Après tous les tests, vous devriez avoir :

**Base de données** :
- 1 club créé
- 1 utilisateur admin
- 2-3 adhérents
- 2 paiements (75 000 FCFA total)

**Interface** :
- Dashboard avec statistiques
- Liste d'adhérents fonctionnelle
- Liste de paiements fonctionnelle
- Mode offline opérationnel

**Aucune erreur** dans :
- Console navigateur
- Logs backend
- Network tab

---

## 🎯 Test de Performance

### Temps de chargement attendus
- Page de connexion : < 1 seconde
- Dashboard : < 2 secondes
- Liste adhérents : < 1 seconde
- Ajout adhérent : < 500ms

### Test de charge
```bash
# Installer ab (Apache Bench)
# Test avec 100 requêtes, 10 concurrentes
ab -n 100 -c 10 http://localhost:8000/api/v1/health
```

**✅ Résultat attendu** : > 95% success rate

---

## 📝 Rapport de Test

Après avoir complété tous les tests, notez :

**Date** : _______________________

**Version** : 1.0.0

**Résultats** :
- Tests réussis : _____ / 30
- Tests échoués : _____
- Bugs trouvés : _____

**Commentaires** :
_________________________________
_________________________________
_________________________________

---

## 🚀 Prêt pour la Production ?

Pour mettre en production, vérifiez :

- [ ] Tous les tests passent
- [ ] Aucune erreur dans les logs
- [ ] Performance acceptable
- [ ] Sécurité : Changer les mots de passe par défaut
- [ ] Sécurité : Changer SECRET_KEY
- [ ] Backup : Configurer les sauvegardes automatiques
- [ ] SSL : Configurer HTTPS
- [ ] Monitoring : Mettre en place des alertes

---

**✅ Félicitations !**

Si tous les tests passent, votre instance NovaClub est prête à être utilisée !

**Besoin d'aide ?** Consultez [GUIDE_UTILISATEUR.md](docs/GUIDE_UTILISATEUR.md)
