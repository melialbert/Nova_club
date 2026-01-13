# Guide de Déploiement en Production NovaClub

Ce guide explique comment déployer NovaClub en production pour un usage professionnel.

## Prérequis

- Serveur Linux (Ubuntu 22.04 recommandé)
- Nom de domaine (exemple: novaclub.sn)
- Certificat SSL (Let's Encrypt recommandé)
- Minimum 4 GB RAM, 20 GB disque

## Installation du Serveur

### 1. Mise à jour du système

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Installation de Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 3. Installation de Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Configuration de Production

### 1. Variables d'environnement

Créer `/opt/novaclub/.env`:

```bash
# Base de données
DATABASE_URL=postgresql://novaclub_prod:STRONG_PASSWORD_HERE@postgres:5432/novaclub_prod

# Redis
REDIS_URL=redis://redis:6379

# Sécurité
SECRET_KEY=GENERATE_A_STRONG_SECRET_KEY_HERE
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS
ALLOWED_ORIGINS=https://novaclub.sn,https://www.novaclub.sn

# API
VITE_API_URL=https://api.novaclub.sn
VITE_APP_NAME=NovaClub
```

### 2. Docker Compose Production

Créer `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: novaclub-postgres
    environment:
      POSTGRES_USER: novaclub_prod
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: novaclub_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - novaclub-network
    restart: always

  redis:
    image: redis:7-alpine
    container_name: novaclub-redis
    networks:
      - novaclub-network
    restart: always

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: novaclub-backend
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
    networks:
      - novaclub-network
    restart: always

  pwa:
    build:
      context: ./pwa
      dockerfile: Dockerfile.prod
    container_name: novaclub-pwa
    networks:
      - novaclub-network
    restart: always

  nginx:
    image: nginx:alpine
    container_name: novaclub-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./pwa/dist:/usr/share/nginx/html
    depends_on:
      - backend
      - pwa
    networks:
      - novaclub-network
    restart: always

networks:
  novaclub-network:
    driver: bridge

volumes:
  postgres_data:
```

### 3. Configuration Nginx

Créer `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=3r/m;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Frontend
    server {
        listen 80;
        listen 443 ssl;
        server_name novaclub.sn www.novaclub.sn;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/v1/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

### 4. Dockerfile Backend Production

Créer `backend/Dockerfile.prod`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

Ajouter à `requirements.txt`:
```
gunicorn==21.2.0
```

### 5. Dockerfile PWA Production

Créer `pwa/Dockerfile.prod`:

```dockerfile
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

## Certificat SSL avec Let's Encrypt

### Installation Certbot

```bash
sudo apt install certbot
```

### Génération du certificat

```bash
sudo certbot certonly --standalone -d novaclub.sn -d www.novaclub.sn
```

### Copier les certificats

```bash
sudo cp /etc/letsencrypt/live/novaclub.sn/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/novaclub.sn/privkey.pem ./nginx/ssl/
sudo chown $USER:$USER ./nginx/ssl/*
```

### Renouvellement automatique

Créer un cron job:
```bash
sudo crontab -e
```

Ajouter:
```
0 0 * * 0 certbot renew --quiet && docker-compose restart nginx
```

## Déploiement

### 1. Transférer les fichiers

```bash
# Sur votre machine locale
scp -r novaclub user@serveur:/opt/
```

### 2. Configuration

```bash
ssh user@serveur
cd /opt/novaclub
nano .env  # Configurer les variables
```

### 3. Build et démarrage

```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Vérification

```bash
docker-compose ps
docker-compose logs -f
```

## Sauvegardes Automatiques

### Script de sauvegarde

Créer `/opt/novaclub/scripts/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/novaclub/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Sauvegarde PostgreSQL
docker exec novaclub-postgres pg_dump -U novaclub_prod novaclub_prod > $BACKUP_DIR/db_$DATE.sql

# Compression
gzip $BACKUP_DIR/db_$DATE.sql

# Supprimer les sauvegardes de plus de 30 jours
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Sauvegarde terminée: db_$DATE.sql.gz"
```

### Cron job

```bash
sudo crontab -e
```

Ajouter:
```
0 2 * * * /opt/novaclub/scripts/backup.sh
```

## Monitoring

### Logs

```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f backend

# Dernières 100 lignes
docker-compose logs --tail=100
```

### Ressources

```bash
# Utilisation
docker stats

# Espace disque
df -h

# État des services
docker-compose ps
```

## Maintenance

### Mise à jour

```bash
cd /opt/novaclub
git pull  # ou copier les nouveaux fichiers
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Nettoyage

```bash
# Supprimer les images inutilisées
docker image prune -a

# Supprimer les volumes inutilisés
docker volume prune
```

## Sécurité

### 1. Pare-feu

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Fail2ban

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Mises à jour automatiques

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 4. Surveillance

Installer un outil de monitoring comme:
- Prometheus + Grafana
- Netdata
- Zabbix

## Performance

### 1. PostgreSQL

Optimiser `postgresql.conf`:
```
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
max_connections = 100
```

### 2. Redis

Configurer la mémoire max:
```
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### 3. Nginx

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
client_max_body_size 10M;
```

## Support Multi-Clubs

### Par sous-domaine

Chaque club a son sous-domaine:
- club1.novaclub.sn
- club2.novaclub.sn

Configurer Nginx pour router vers différentes instances.

### Par base de données

Chaque club = une base de données séparée.

## Troubleshooting Production

### Service ne démarre pas

```bash
docker-compose logs service_name
docker-compose restart service_name
```

### Base de données corrompue

Restaurer depuis la sauvegarde:
```bash
gunzip -c backup.sql.gz | docker exec -i novaclub-postgres psql -U novaclub_prod novaclub_prod
```

### Espace disque plein

```bash
# Voir l'utilisation
du -sh /var/lib/docker

# Nettoyer
docker system prune -a
```

## Checklist de Déploiement

- [ ] Serveur configuré et à jour
- [ ] Docker et Docker Compose installés
- [ ] Variables d'environnement configurées
- [ ] SSL activé
- [ ] Pare-feu configuré
- [ ] Sauvegardes automatiques configurées
- [ ] Monitoring en place
- [ ] Tests de connexion réussis
- [ ] Documentation à jour
- [ ] Formation des utilisateurs

## Support

En cas de problème en production:
1. Consulter les logs
2. Vérifier les sauvegardes
3. Contacter le support technique
