# ⚡ Démarrage Rapide - NovaClub

Guide ultra-rapide pour tester NovaClub en 5 minutes.

---

## 📋 Prérequis (1 minute)

Vérifiez que vous avez Docker installé :

```bash
docker --version
docker-compose --version
```

**Pas installé ?**
- **Windows/Mac** : [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux** : [Docker Engine](https://docs.docker.com/engine/install/)

---

## 🚀 Installation (2 minutes)

### Étape 1 : Lancer les services

**Si c'est la première fois** :
```bash
# Linux/Mac
./fix-and-restart.sh

# Windows
fix-and-restart.bat
```

**OU manuellement** :
```bash
docker-compose up -d
```

### Étape 2 : Attendre le démarrage

Les services prennent 30-60 secondes à démarrer.

**Vérifier l'état** :
```bash
# Linux/Mac
./test-services.sh

# Windows
test-services.bat

# Ou manuellement
docker-compose ps
```

**✅ Tous les services doivent être "Up"**

---

## 🎯 Premier Test (2 minutes)

### 1. Créer votre compte club

1. Ouvrir http://localhost:3000
2. Cliquer sur **"Créer un compte"**
3. Remplir le formulaire :

```
Nom du club : Mon Club Test
Téléphone : +221776543210
Prénom : Votre prénom
Nom : Votre nom
Email : admin@test.com
Mot de passe : Test123456!
```

4. Cliquer sur **"Créer mon compte"**

**✅ Vous êtes redirigé vers le Dashboard**

### 2. Ajouter votre premier adhérent

1. Cliquer sur **"Adhérents"** dans le menu
2. Cliquer sur **"+ Nouvel adhérent"**
3. Remplir les informations minimales :

```
Prénom : Ahmed
Nom : Test
Date de naissance : 01/01/2000
Sexe : Masculin
Téléphone : +221776543211
Adresse : Dakar
Ville : Dakar
Pays : Sénégal
Ceinture : Blanche
Type licence : Loisir
```

4. Cliquer sur **"Enregistrer"**

**✅ Ahmed apparaît dans la liste**

### 3. Enregistrer un paiement

1. Cliquer sur **"Paiements"** dans le menu
2. Cliquer sur **"+ Nouveau paiement"**
3. Remplir :

```
Type : Cotisation
Adhérent : Ahmed Test
Montant : 50000
Méthode : Espèces
Description : Cotisation janvier
```

4. Cliquer sur **"Enregistrer"**

**✅ Paiement enregistré**

### 4. Consulter le dashboard

1. Cliquer sur **"Tableau de bord"**
2. **✅ Vous voyez** :
   - 1 adhérent actif
   - 50 000 FCFA de revenus
   - Graphiques et statistiques

---

## 🎉 Félicitations !

Votre instance NovaClub fonctionne parfaitement !

---

## 📱 URLs Importantes

| Service | URL | Description |
|---------|-----|-------------|
| **PWA Web** | http://localhost:3000 | Interface principale |
| **API Docs** | http://localhost:8000/docs | Documentation API Swagger |
| **Adminer** | http://localhost:8080 | Gestionnaire de base de données |

**Connexion Adminer** :
- Système : PostgreSQL
- Serveur : `postgres`
- Utilisateur : `novaclub`
- Mot de passe : `novaclub123`
- Base : `novaclub_db`

---

## 🧪 Tests Avancés

Pour tester toutes les fonctionnalités : **[GUIDE_TEST.md](GUIDE_TEST.md)**

Le guide complet couvre :
- ✅ Authentification
- 👥 Gestion complète des adhérents
- 💰 Gestion des paiements
- 📊 Statistiques et rapports
- 🔄 Mode hors ligne (PWA)
- 🗄️ Accès direct à la base de données
- 📱 Tests responsive (mobile/tablette)

---

## 🐛 Problèmes Courants

### ❌ Erreur CORS

**Symptôme** : "Access-Control-Allow-Origin" error

**Solution** :
```bash
# Rebuild le backend
docker-compose down
docker volume rm novaclub_backend_venv
docker-compose build backend
docker-compose up -d
```

### ❌ Erreur bcrypt

**Symptôme** : "ValueError: password cannot be longer than 72 bytes"

**Solution** : Déjà corrigé ! Lancez simplement :
```bash
./fix-and-restart.sh  # ou .bat sur Windows
```

### ❌ Service ne démarre pas

**Symptôme** : Container "Exited"

**Solution** :
```bash
# Voir les logs
docker-compose logs backend

# Redémarrer
docker-compose restart backend
```

### ❌ Port déjà utilisé

**Symptôme** : "port is already allocated"

**Solution** :
```bash
# Arrêter les autres services sur les ports 3000, 8000, 5432
# Ou changer les ports dans docker-compose.yml
```

---

## 📚 Documentation Complète

| Document | Description |
|----------|-------------|
| [README.md](README.md) | Documentation principale |
| [GUIDE_TEST.md](GUIDE_TEST.md) | Guide de test complet (30 tests) |
| [FIX_ERRORS.md](FIX_ERRORS.md) | Résolution de problèmes |
| [FEATURES.md](FEATURES.md) | Liste des fonctionnalités |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architecture technique |
| [GUIDE_UTILISATEUR.md](docs/GUIDE_UTILISATEUR.md) | Guide utilisateur |

---

## 🛠️ Commandes Utiles

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Voir les logs
docker-compose logs -f

# Voir les logs d'un service
docker-compose logs -f backend

# Redémarrer un service
docker-compose restart backend

# Rebuild un service
docker-compose build backend

# Tout supprimer et recommencer
docker-compose down -v
docker-compose up -d
```

---

## 🔄 Mode Hors Ligne

NovaClub fonctionne en mode hors ligne grâce à la PWA !

**Test rapide** :
1. Utiliser l'application normalement
2. Dans Chrome DevTools (F12) → Network → Cocher "Offline"
3. Ajouter un adhérent
4. **✅ Il est sauvegardé localement**
5. Décocher "Offline"
6. **✅ Synchronisation automatique**

---

## 📊 Données de Test

Pour tester rapidement avec des données :

### Utilisateur Admin
```
Email : admin@test.com
Mot de passe : Test123456!
```

### Adhérents de Test
```
1. Ahmed Diallo - Adulte - Ceinture Blanche - Compétition
2. Fatou Ndiaye - Enfant - Ceinture Jaune - Loisir
3. Mamadou Sow - Ado - Ceinture Orange - Compétition
```

### Paiements de Test
```
1. Cotisation - Ahmed - 50 000 FCFA - Espèces
2. Licence - Fatou - 25 000 FCFA - Wave
3. Équipement - Mamadou - 15 000 FCFA - Orange Money
```

---

## 🎯 Checklist de Démarrage

- [ ] Docker installé et fonctionnel
- [ ] Services démarrés (docker-compose up -d)
- [ ] PWA accessible (http://localhost:3000)
- [ ] Compte club créé
- [ ] Premier adhérent ajouté
- [ ] Premier paiement enregistré
- [ ] Dashboard consulté
- [ ] Aucune erreur dans les logs

**✅ Tout coché ?** Vous êtes prêt à utiliser NovaClub !

---

## 🚀 Prochaines Étapes

1. **Personnaliser** : Ajouter vos vrais adhérents
2. **Explorer** : Tester toutes les fonctionnalités
3. **Configurer** : Adapter les paramètres à votre club
4. **Former** : Montrer aux autres membres du bureau
5. **Produire** : Déployer en production (voir DEPLOIEMENT_PRODUCTION.md)

---

## 💡 Conseils

### Pour bien démarrer
1. Créez d'abord 5-10 adhérents tests
2. Enregistrez quelques paiements
3. Consultez les statistiques
4. Testez la recherche et les filtres
5. Testez le mode hors ligne

### Pour la production
1. Changez tous les mots de passe par défaut
2. Configurez les sauvegardes automatiques
3. Activez HTTPS
4. Limitez l'accès réseau
5. Mettez en place des alertes de monitoring

---

## 🆘 Besoin d'Aide ?

1. **Erreurs** → [FIX_ERRORS.md](FIX_ERRORS.md)
2. **Tests** → [GUIDE_TEST.md](GUIDE_TEST.md)
3. **Utilisation** → [GUIDE_UTILISATEUR.md](docs/GUIDE_UTILISATEUR.md)
4. **Architecture** → [ARCHITECTURE.md](ARCHITECTURE.md)

---

## ⏱️ Temps Estimés

| Tâche | Temps |
|-------|-------|
| Installation Docker | 5-10 min |
| Premier démarrage | 2-3 min |
| Création compte | 1 min |
| Ajout adhérent | 2 min |
| Paiement | 1 min |
| Test complet | 10-15 min |

**Total** : ~20-30 minutes pour tout tester

---

**✨ Bonne découverte de NovaClub !**
