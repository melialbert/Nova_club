# NovaClub - Démarrage Rapide

## Installation en 3 Étapes

### 1. Installer Docker

**Windows/Mac** : Télécharger [Docker Desktop](https://www.docker.com/products/docker-desktop)

**Linux** :
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 2. Lancer NovaClub

**Linux/Mac** :
```bash
./start.sh
```

**Windows** :
```cmd
start.bat
```

### 3. Créer votre compte

Ouvrir http://localhost:3000 et créer votre compte club.

---

## Accès Rapide

- 🌐 **Application Web** : http://localhost:3000
- 🔧 **API** : http://localhost:8000
- 📚 **Documentation API** : http://localhost:8000/docs
- 🗄️ **Adminer (DB)** : http://localhost:8080

### Connexion Adminer
- Système : PostgreSQL
- Serveur : `postgres`
- Utilisateur : `novaclub`
- Mot de passe : `novaclub123`
- Base : `novaclub_db`

---

## Commandes Essentielles

### Démarrage
```bash
docker-compose up -d        # Démarrer tout
docker-compose start        # Redémarrer rapidement
```

### Arrêt
```bash
docker-compose stop         # Arrêter (garde tout)
docker-compose down         # Arrêter et supprimer conteneurs
```

### Monitoring
```bash
docker-compose ps           # État des services
docker-compose logs -f      # Voir les logs en temps réel
docker-compose logs backend # Logs du backend
```

### Gestion des Volumes
```bash
./manage-volumes.sh status      # État des volumes
./manage-volumes.sh backup      # Sauvegarder la DB
./manage-volumes.sh clean-cache # Nettoyer les caches
```

---

## Problèmes Courants

### Les services ne démarrent pas

```bash
# Voir les erreurs
docker-compose logs

# Redémarrer complètement
docker-compose down
docker-compose build
docker-compose up -d
```

### Module manquant (Backend)

```bash
# Reconstruire le backend
docker-compose build backend
docker-compose up -d backend
```

### node_modules manquant (PWA)

```bash
# Reconstruire la PWA
docker-compose build pwa
docker-compose up -d pwa
```

### Base de données vide

C'est normal au premier démarrage. Créez votre compte via l'interface web.

---

## Workflow Quotidien

### Matin
```bash
docker-compose start        # Démarrer
```

### Soir
```bash
docker-compose stop         # Arrêter
```

### Modification du Code
```bash
docker-compose restart      # Redémarrer
```

### Mise à Jour
```bash
docker-compose down
git pull                    # Ou copier les nouveaux fichiers
docker-compose build
docker-compose up -d
```

---

## Sauvegarde

### Sauvegarde Rapide
```bash
./manage-volumes.sh backup
```

### Sauvegarde Manuelle
```bash
docker exec novaclub-postgres pg_dump -U novaclub novaclub_db > backup.sql
```

### Restauration
```bash
cat backup.sql | docker exec -i novaclub-postgres psql -U novaclub novaclub_db
```

---

## Accès Réseau Local

Pour accéder depuis d'autres appareils du réseau :

1. Trouver votre IP :
   ```bash
   # Linux/Mac
   ip addr show

   # Windows
   ipconfig
   ```

2. Modifier `docker-compose.yml` :
   - Remplacer `192.168.1.8` par votre IP
   - Dans `ALLOWED_ORIGINS` et `VITE_API_URL`

3. Redémarrer :
   ```bash
   docker-compose restart
   ```

4. Accéder depuis un autre PC :
   - http://VOTRE_IP:3000

---

## Documentation Complète

- **README.md** : Documentation complète
- **docs/GUIDE_INSTALLATION_CLUBS.md** : Installation pour clubs
- **docs/GUIDE_UTILISATEUR.md** : Guide utilisateur
- **docs/GESTION_VOLUMES.md** : Gestion des volumes
- **docs/DEPLOIEMENT_PRODUCTION.md** : Déploiement production
- **ARCHITECTURE.md** : Architecture technique
- **FEATURES.md** : État des fonctionnalités
- **NEXT_STEPS.md** : Roadmap

---

## Support

En cas de problème :

1. Consulter les logs : `docker-compose logs -f`
2. Vérifier l'espace disque : `df -h`
3. Lire la documentation dans `docs/`
4. Vérifier que Docker fonctionne : `docker ps`

---

## Prochaines Étapes

1. ✅ Créer votre compte club
2. ✅ Ajouter vos premiers adhérents
3. ✅ Enregistrer des paiements
4. ✅ Tester le mode offline (couper Internet)
5. 📱 Développer les apps mobiles (voir NEXT_STEPS.md)

---

**NovaClub** - Gestion de clubs de judo offline-first pour l'Afrique
