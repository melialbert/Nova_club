# Gestion des Volumes Docker - NovaClub

Ce document explique la gestion des volumes persistants dans NovaClub.

## Volumes Configurés

NovaClub utilise **7 volumes persistants** pour conserver les données et optimiser les performances :

### 1. postgres_data
- **Contenu** : Toutes les données PostgreSQL
- **Taille** : Variable selon vos données
- **Critique** : ⚠️ OUI - Contient toutes les données de votre club

### 2. redis_data
- **Contenu** : Cache Redis et sessions
- **Taille** : Quelques MB
- **Critique** : NON - Peut être recréé

### 3. backend_venv
- **Contenu** : Dépendances Python installées
- **Taille** : ~200 MB
- **Critique** : NON - Peut être recréé avec `pip install`
- **Avantage** : Évite de réinstaller les packages Python à chaque redémarrage

### 4. backend_cache
- **Contenu** : Cache pip
- **Taille** : ~100 MB
- **Critique** : NON
- **Avantage** : Accélère l'installation des packages Python

### 5. backend_pycache
- **Contenu** : Fichiers Python compilés (.pyc)
- **Taille** : Quelques MB
- **Critique** : NON
- **Avantage** : Accélère le démarrage de l'application

### 6. pwa_node_modules
- **Contenu** : Dépendances npm installées
- **Taille** : ~300 MB
- **Critique** : NON - Peut être recréé avec `npm install`
- **Avantage** : Évite de réinstaller node_modules à chaque redémarrage

### 7. pwa_cache
- **Contenu** : Cache npm
- **Taille** : ~100 MB
- **Critique** : NON
- **Avantage** : Accélère l'installation des packages npm

## Commandes Utiles

### Voir tous les volumes

```bash
docker volume ls
```

### Inspecter un volume spécifique

```bash
docker volume inspect novaclub_postgres_data
```

### Voir l'espace utilisé par les volumes

```bash
docker system df -v
```

### Emplacement des volumes sur votre machine

#### Linux/Mac
```bash
/var/lib/docker/volumes/
```

#### Windows (Docker Desktop)
```
\\wsl$\docker-desktop-data\version-pack-data\community\docker\volumes\
```

## Cycle de Vie

### Démarrage Normal

Avec les volumes persistants, vous pouvez maintenant :

```bash
# Arrêter les conteneurs
docker-compose stop

# Les redémarrer rapidement (garde tout)
docker-compose start
```

**Avantages** :
- ⚡ Démarrage ultra-rapide (pas de réinstallation)
- ✅ Toutes les données conservées
- ✅ Configuration préservée

### Redémarrage après Modification du Code

Si vous modifiez le code source :

```bash
# Redémarrer un service spécifique
docker-compose restart backend

# Ou redémarrer tout
docker-compose restart
```

Pas besoin de rebuild, le code est monté en volume !

### Mise à Jour des Dépendances

Si vous modifiez `requirements.txt` ou `package.json` :

```bash
# Rebuild juste le service concerné
docker-compose build backend
docker-compose up -d backend

# Ou pour la PWA
docker-compose build pwa
docker-compose up -d pwa
```

Les volumes conservent les dépendances, donc seules les nouvelles seront installées.

### Nettoyage Partiel (Garde les données)

Pour nettoyer les caches sans perdre les données :

```bash
# Supprimer les volumes de cache seulement
docker volume rm novaclub_backend_cache
docker volume rm novaclub_backend_pycache
docker volume rm novaclub_pwa_cache

# Redémarrer
docker-compose up -d
```

**Résultat** : Les dépendances sont conservées, juste le cache est nettoyé.

### Nettoyage Complet (Garde les données critiques)

```bash
# Arrêter tout
docker-compose down

# Supprimer les volumes non-critiques
docker volume rm novaclub_backend_venv
docker volume rm novaclub_backend_cache
docker volume rm novaclub_backend_pycache
docker volume rm novaclub_pwa_node_modules
docker volume rm novaclub_pwa_cache
docker volume rm novaclub_redis_data

# Rebuild et redémarrer
docker-compose build
docker-compose up -d
```

**Résultat** : PostgreSQL conserve toutes vos données (membres, paiements, etc.)

### Reset Total (⚠️ Perte de TOUTES les données)

⚠️ **ATTENTION** : Ceci supprime TOUT, y compris votre base de données !

```bash
# Arrêter et tout supprimer
docker-compose down -v

# Rebuild complet
docker-compose build
docker-compose up -d
```

Utilisez uniquement si :
- Vous voulez repartir de zéro
- Vous avez une sauvegarde
- Vous êtes en phase de développement

## Sauvegarde des Volumes

### Sauvegarder PostgreSQL (CRITIQUE)

```bash
# Créer un backup SQL
docker exec novaclub-postgres pg_dump -U novaclub novaclub_db > backup_$(date +%Y%m%d).sql

# Ou avec compression
docker exec novaclub-postgres pg_dump -U novaclub novaclub_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restaurer PostgreSQL

```bash
# Depuis un fichier SQL
cat backup_20260113.sql | docker exec -i novaclub-postgres psql -U novaclub novaclub_db

# Depuis un fichier compressé
gunzip -c backup_20260113.sql.gz | docker exec -i novaclub-postgres psql -U novaclub novaclub_db
```

### Sauvegarder un Volume Complet

```bash
# Créer une archive d'un volume
docker run --rm \
  -v novaclub_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

### Restaurer un Volume Complet

```bash
# Restaurer depuis une archive
docker run --rm \
  -v novaclub_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## Optimisations de Performance

### Si vous avez un SSD

Les volumes Docker bénéficient automatiquement de votre SSD.

### Si vous manquez d'espace disque

Supprimez les volumes de cache qui ne sont pas critiques :

```bash
docker volume rm novaclub_backend_cache
docker volume rm novaclub_pwa_cache
```

Gain : ~200 MB

### Nettoyage Régulier

Une fois par mois :

```bash
# Nettoyer les images inutilisées
docker image prune -a

# Nettoyer le système complet (garde les volumes utilisés)
docker system prune
```

## Surveillance des Volumes

### Script de Monitoring

Créez `check-volumes.sh` :

```bash
#!/bin/bash
echo "=== État des Volumes NovaClub ==="
echo ""
docker volume ls | grep novaclub
echo ""
echo "=== Espace Utilisé ==="
docker system df -v | grep volume
```

### Alerte Espace Disque

```bash
# Voir l'espace disponible
df -h | grep docker
```

Si < 10% disponible, faites un nettoyage.

## Troubleshooting

### "No space left on device"

```bash
# Nettoyer le système
docker system prune -a --volumes

# Ou nettoyer juste les caches
docker volume rm novaclub_backend_cache novaclub_pwa_cache
```

### Volume corrompu

```bash
# Supprimer et recréer un volume spécifique
docker-compose down
docker volume rm novaclub_backend_venv
docker-compose up -d backend
```

### Performances lentes

Sur Windows/Mac, les volumes peuvent être lents. Solution :

1. Utiliser Docker Desktop avec WSL 2 (Windows)
2. Désactiver le monitoring antivirus sur les volumes Docker
3. Utiliser des volumes nommés (déjà fait ✅)

## Migration

### Vers un Nouveau Serveur

```bash
# Sur l'ancien serveur
docker exec novaclub-postgres pg_dump -U novaclub novaclub_db > novaclub.sql

# Copier le fichier sur le nouveau serveur
scp novaclub.sql user@nouveau-serveur:/backup/

# Sur le nouveau serveur
cat /backup/novaclub.sql | docker exec -i novaclub-postgres psql -U novaclub novaclub_db
```

## Bonnes Pratiques

1. **Sauvegardez PostgreSQL tous les jours**
   ```bash
   # Créer un cron job
   0 2 * * * docker exec novaclub-postgres pg_dump -U novaclub novaclub_db | gzip > /backups/novaclub_$(date +\%Y\%m\%d).sql.gz
   ```

2. **Gardez 30 jours de sauvegardes**
   ```bash
   find /backups -name "novaclub_*.sql.gz" -mtime +30 -delete
   ```

3. **Testez vos sauvegardes**
   - Une fois par mois, restaurez sur un environnement de test

4. **Surveillez l'espace disque**
   - Gardez au moins 20% d'espace libre

5. **Documentez vos modifications**
   - Notez quand vous modifiez des volumes

## Résumé des Avantages

Avec les volumes persistants, vous pouvez maintenant :

✅ **Redémarrer rapidement** sans tout réinstaller
✅ **Conserver vos données** même après `docker-compose down`
✅ **Mettre à jour le code** sans perdre la config
✅ **Économiser du temps** (pas de réinstallation à chaque fois)
✅ **Économiser de la bande passante** (pas de re-téléchargement)

## Support

En cas de problème avec les volumes :

1. Vérifier l'espace disque : `df -h`
2. Vérifier les logs : `docker-compose logs`
3. Lister les volumes : `docker volume ls`
4. Consulter ce guide

---

**Note** : Les volumes sont stockés par Docker et survivent aux redémarrages du système.
