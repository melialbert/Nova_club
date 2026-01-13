# Migrations de base de données

Ce dossier contient les scripts SQL de migration pour la base de données.

## Comment appliquer les migrations

Depuis le conteneur PostgreSQL ou via un client SQL:

```bash
# Se connecter au conteneur PostgreSQL
docker exec -it <nom_du_conteneur_postgres> psql -U <username> -d <database_name>

# Exécuter le script de migration
\i /path/to/migration/001_simplify_clubs_table.sql
```

Ou via psql en ligne de commande:

```bash
psql -U <username> -d <database_name> -f backend/migrations/001_simplify_clubs_table.sql
```

## Migrations disponibles

- `001_simplify_clubs_table.sql`: Simplifie la table clubs en ne gardant que les champs essentiels (nom, ville, slogan, logo)
