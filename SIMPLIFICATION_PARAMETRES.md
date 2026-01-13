# Simplification de l'onglet Paramètres

## Résumé des modifications

L'onglet Paramètres a été simplifié pour ne garder que les informations essentielles du club :
- Logo du club
- Nom du club
- Ville
- Slogan

Tous les autres champs ont été supprimés (adresse, téléphone, email, site web, réseaux sociaux, bureau directeur, etc.).

## Modifications effectuées

### 1. Interface utilisateur (Frontend)
- **Fichier modifié** : `pwa/src/pages/SettingsPage.jsx`
- Formulaire simplifié avec seulement 4 champs
- Interface épurée et plus facile à utiliser
- Section "Logo du club" conservée avec téléchargement d'image

### 2. Modèle de données (Backend)
- **Fichier modifié** : `backend/app/models/club.py`
- Colonnes conservées : `name`, `city`, `slogan`, `logo_url`, `is_active`
- Colonnes supprimées : `address`, `phone`, `email`

### 3. Migration de base de données
- **Fichier créé** : `backend/migrations/001_simplify_clubs_table.sql`
- Ajout des colonnes `city` et `slogan`
- Suppression des colonnes `address`, `phone`, `email`

## Comment appliquer la migration

### Linux/Mac :
```bash
./apply-migration.sh
```

### Windows :
```bash
apply-migration.bat
```

Ou manuellement :
```bash
docker exec -i novaclub-postgres psql -U novaclub -d novaclub_db < backend/migrations/001_simplify_clubs_table.sql
```

## Structure finale de la table clubs

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| name | VARCHAR(200) | Nom du club |
| city | VARCHAR(100) | Ville du club |
| slogan | VARCHAR(500) | Slogan du club |
| logo_url | VARCHAR(500) | URL/Chemin du logo |
| is_active | BOOLEAN | Statut actif/inactif |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de mise à jour |

## Avant/Après

### Avant (15 champs)
- Nom, Adresse, Ville, Code postal, Téléphone, Email, Site web, Logo
- Description, Facebook, Instagram, Président, Trésorier, Secrétaire

### Après (4 champs)
- Logo
- Nom du club
- Ville
- Slogan

## Note importante

Les données existantes dans les colonnes supprimées seront perdues après l'application de la migration. Assurez-vous de sauvegarder ces informations si nécessaire avant d'exécuter le script de migration.
