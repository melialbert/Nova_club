# Correction des Erreurs - NovaClub

## Problèmes Détectés

### 1. ❌ Erreur bcrypt
```
ValueError: password cannot be longer than 72 bytes
AttributeError: module 'bcrypt' has no attribute '__about__'
```

**Cause** : Incompatibilité entre passlib et bcrypt

**Solution** : ✅ Ajout de `bcrypt==4.0.1` dans requirements.txt

### 2. ❌ Erreur CORS
```
Access-Control-Allow-Origin header is present on the requested resource
Cross-Origin Request Blocked
```

**Causes possibles** :
1. Le backend n'a pas encore redémarré avec les bonnes dépendances
2. **Vous utilisez une IP locale différente** (ex: 192.168.1.8 au lieu de localhost)

**Solution rapide si vous accédez via une IP locale** :

```bash
# Linux/Mac
./configure-ip.sh

# Windows
configure-ip.bat
```

Ce script va :
- Détecter automatiquement votre IP locale
- Configurer les CORS dans docker-compose.yml
- Redémarrer les services

**Ou manuellement** : Voir section "Configuration IP Locale" ci-dessous

---

## 🔧 Solution : Rebuild du Backend

Exécutez ces commandes dans l'ordre :

### 1. Arrêter les services
```bash
docker-compose down
```

### 2. Supprimer le volume des dépendances Python (force réinstallation)
```bash
docker volume rm novaclub_backend_venv
```

### 3. Rebuild le backend
```bash
docker-compose build backend
```

### 4. Redémarrer tout
```bash
docker-compose up -d
```

### 5. Vérifier les logs
```bash
docker-compose logs -f backend
```

**✅ Vous devriez voir** :
```
INFO:     Application startup complete.
```

---

## 🧪 Tester l'Inscription

1. Ouvrir http://localhost:3000
2. Cliquer sur "Créer un compte"
3. Remplir le formulaire
4. Cliquer sur "Créer mon compte"

**✅ Si tout fonctionne** :
- Vous serez redirigé vers le Dashboard
- Aucune erreur CORS dans la console
- Vous pourrez ajouter des adhérents

---

## Alternative Rapide (Sans Rebuild)

Si vous voulez tester immédiatement sans rebuild :

### 1. Installer bcrypt dans le conteneur en cours
```bash
docker exec -it novaclub-backend pip install bcrypt==4.0.1
```

### 2. Redémarrer le backend
```bash
docker-compose restart backend
```

**⚠️ Attention** : Cette solution est temporaire. Au prochain `docker-compose down`, il faudra rebuild.

---

## 🔍 Vérification

### Vérifier que bcrypt est bien installé
```bash
docker exec novaclub-backend pip list | grep bcrypt
```

**Attendu** :
```
bcrypt               4.0.1
passlib              1.7.4
```

### Tester l'API directement
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@club.com",
    "password": "test123",
    "first_name": "Test",
    "last_name": "User",
    "club_name": "Test Club",
    "phone": "+221776543210"
  }'
```

**✅ Réponse attendue** :
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

---

## 📋 Checklist

Après le rebuild, vérifiez :

- [ ] Backend démarre sans erreur
- [ ] PWA accessible sur http://localhost:3000
- [ ] API accessible sur http://localhost:8000/docs
- [ ] Adminer accessible sur http://localhost:8080
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Ajout d'adhérent fonctionne

---

## 🐛 Si les Problèmes Persistent

### Problème : CORS toujours présent

**Solution** : Vérifier que le backend accepte localhost:3000

```bash
docker-compose logs backend | grep CORS
```

### Problème : Backend ne démarre pas

**Solution** : Voir les logs détaillés
```bash
docker-compose logs backend --tail=100
```

### Problème : "Cannot import name..."

**Solution** : Nettoyer complètement les dépendances
```bash
docker-compose down
docker volume rm novaclub_backend_venv novaclub_backend_cache novaclub_backend_pycache
docker-compose build backend
docker-compose up -d
```

---

## 💡 Commandes Utiles

```bash
# Voir tous les logs
docker-compose logs -f

# Rebuild complet (si tout est cassé)
docker-compose down -v
docker-compose build
docker-compose up -d

# Entrer dans le conteneur backend
docker exec -it novaclub-backend bash

# Tester manuellement
python -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto'); print(pwd_context.hash('test'))"
```

---

## ✅ Résumé

**Modifications faites** :
1. ✅ Ajout de `bcrypt==4.0.1` dans requirements.txt
2. ✅ Ajout de `email-validator==2.1.0` dans requirements.txt

**Actions requises** :
1. 🔄 Rebuild du backend : `docker-compose build backend`
2. 🚀 Redémarrer : `docker-compose up -d`
3. ✅ Tester l'inscription

Après ces étapes, tout devrait fonctionner parfaitement !

---

## 🌐 Configuration IP Locale

### Problème : Accès via IP locale (ex: 192.168.1.8)

Si vous accédez à l'application via votre IP locale au lieu de localhost, vous devez configurer les CORS.

**Symptômes** :
- Erreur CORS dans la console du navigateur
- "Cross-Origin Request Blocked"
- L'application fonctionne sur localhost mais pas sur l'IP

### Solution Automatique (Recommandé)

**Linux/Mac** :
```bash
./configure-ip.sh
```

**Windows** :
```cmd
configure-ip.bat
```

Le script va :
1. Détecter votre IP locale automatiquement
2. Mettre à jour `docker-compose.yml`
3. Rebuild le backend
4. Redémarrer tous les services

### Solution Manuelle

#### Étape 1 : Trouver votre IP locale

**Linux** :
```bash
ip addr show
# ou
hostname -I
```

**Mac** :
```bash
ifconfig | grep 'inet '
```

**Windows** :
```cmd
ipconfig
```

Cherchez votre IP (généralement 192.168.x.x ou 10.0.x.x)

#### Étape 2 : Modifier docker-compose.yml

Ouvrez `docker-compose.yml` et remplacez `192.168.1.8` par votre IP :

```yaml
backend:
  environment:
    ALLOWED_ORIGINS: http://VOTRE_IP:3000,http://localhost:3000,http://127.0.0.1:3000

pwa:
  environment:
    VITE_API_URL: http://VOTRE_IP:8000
```

**Exemple avec IP 192.168.1.15** :
```yaml
backend:
  environment:
    ALLOWED_ORIGINS: http://192.168.1.15:3000,http://localhost:3000,http://127.0.0.1:3000

pwa:
  environment:
    VITE_API_URL: http://192.168.1.15:8000
```

#### Étape 3 : Redémarrer les services

```bash
docker-compose down
docker-compose build backend
docker-compose up -d
```

#### Étape 4 : Accéder via votre IP

- **PWA** : http://VOTRE_IP:3000
- **API** : http://VOTRE_IP:8000
- **Adminer** : http://VOTRE_IP:8080

### Accès depuis d'autres appareils

Une fois configuré, vous pouvez accéder à NovaClub depuis :
- 📱 Votre téléphone (sur le même WiFi)
- 💻 Autres ordinateurs du réseau local
- 📟 Tablettes

**Important** : Tous les appareils doivent être sur le même réseau WiFi/local.

### Vérification

**Test 1 : Backend accepte l'IP**
```bash
# Remplacez VOTRE_IP par votre IP
curl http://VOTRE_IP:8000/health
```

**Résultat attendu** :
```json
{"status": "healthy"}
```

**Test 2 : PWA accessible**

Ouvrez dans votre navigateur : `http://VOTRE_IP:3000`

**Test 3 : Pas d'erreur CORS**

1. Ouvrir la console du navigateur (F12)
2. Onglet "Console"
3. Aucune erreur CORS ne doit apparaître

### Plusieurs IPs

Si vous voulez accepter plusieurs IPs (ex: bureau + maison) :

```yaml
backend:
  environment:
    ALLOWED_ORIGINS: http://192.168.1.8:3000,http://192.168.0.15:3000,http://localhost:3000
```

### Troubleshooting

**Erreur : "Network Error"**
- Vérifiez que votre firewall autorise les ports 3000, 8000, 8080
- Sous Linux : `sudo ufw allow 3000` (si ufw activé)

**Erreur : "Connection refused"**
- Vérifiez que Docker bind sur 0.0.0.0 (déjà configuré)
- Testez : `netstat -tulpn | grep -E '3000|8000'`

**L'IP a changé**
- Relancez `./configure-ip.sh` (ou `.bat`)
- Ou modifiez manuellement `docker-compose.yml`

### Configuration Production

Pour la production, utilisez un nom de domaine au lieu d'une IP :

```yaml
ALLOWED_ORIGINS: https://novaclub.votredomaine.com,https://www.votredomaine.com
VITE_API_URL: https://api.votredomaine.com
```

Voir [docs/DEPLOIEMENT_PRODUCTION.md](docs/DEPLOIEMENT_PRODUCTION.md) pour plus de détails.
