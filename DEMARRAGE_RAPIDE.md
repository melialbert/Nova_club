# Démarrage Rapide - NovaClub

## Étape 1 : Démarrer l'application

```bash
./start.sh
```

Ou sur Windows :
```cmd
start.bat
```

Le script va :
- Détecter automatiquement Docker Compose (ancienne ou nouvelle version)
- Démarrer tous les services (PostgreSQL, Redis, Backend, PWA, Adminer)
- Attendre 30 secondes que tout soit prêt

## Étape 2 : Créer les utilisateurs de test

**Attendez que l'étape 1 soit terminée**, puis exécutez :

```bash
./creer-utilisateurs.sh
```

Ou sur Windows :
```cmd
creer-utilisateurs.bat
```

Le script va créer automatiquement :
- Le club de test "Club de Judo Excellence"
- 3 utilisateurs avec leurs rôles

## Étape 3 : Se connecter

Ouvrez http://localhost:3000 et connectez-vous avec :

- **Admin** : `admin@club.com` / `password123`
- **Secrétaire** : `secretaire@club.com` / `password123`
- **Coach** : `coach@club.com` / `password123`

---

## Problèmes courants

### "Docker Compose n'est pas installé"

Vérifiez que Docker est bien installé :
```bash
docker --version
docker compose version
```

Si `docker compose version` ne fonctionne pas, essayez :
```bash
docker-compose --version
```

### "Le conteneur n'est pas en cours d'exécution"

Vérifiez que les conteneurs tournent :
```bash
docker ps
```

Vous devriez voir :
- novaclub-postgres
- novaclub-backend
- novaclub-pwa
- novaclub-redis
- novaclub-adminer

### "Connection refused" lors de la création des utilisateurs

Attendez 10-20 secondes de plus après le démarrage avant de lancer `creer-utilisateurs.sh`

---

## Commandes utiles

```bash
# Voir les services
docker compose ps

# Voir les logs
docker compose logs -f

# Voir les logs d'un service spécifique
docker compose logs -f backend

# Arrêter les services
docker compose stop

# Tout supprimer (données incluses)
docker compose down -v

# Redémarrer un service
docker compose restart backend
```

---

## Accès aux différents services

- **Application Web** : http://localhost:3000
- **API Backend** : http://localhost:8000
- **Documentation API** : http://localhost:8000/docs
- **Adminer (DB)** : http://localhost:8080
  - Serveur : `postgres`
  - Utilisateur : `novaclub`
  - Mot de passe : `novaclub123`
  - Base de données : `novaclub_db`
