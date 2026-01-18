# Comptes de test

## 🚀 Comment créer les utilisateurs de test

Après avoir démarré l'application avec `./start.sh` (ou `start.bat`), exécutez :

```bash
./creer-utilisateurs.sh
```

Ou sur Windows :
```cmd
creer-utilisateurs.bat
```

Ce script va insérer automatiquement les 2 utilisateurs de test dans votre base de données PostgreSQL locale.

---

## 📝 Comptes disponibles

## Admin
- **Email:** admin@club.com
- **Mot de passe:** password123
- **Rôle:** Administrateur
- **Accès:** Toutes les fonctionnalités (Tableau de bord, Adhérents, Licences, Présences, Paiements, Employés, Paramètres)

## Secrétaire
- **Email:** secretaire@club.com
- **Mot de passe:** password123
- **Rôle:** Secrétaire
- **Accès:** Tableau de bord, Adhérents, Licences, Présences, Paiements

## Gestion des employés

Seul l'administrateur peut créer, modifier et supprimer des employés depuis la page "Employés".

Les rôles disponibles sont :
- **Admin** : Accès complet à toutes les fonctionnalités
- **Secrétaire** : Gestion des adhérents, licences, présences et paiements

## Notes importantes

- L'inscription publique a été désactivée
- Seuls les administrateurs peuvent créer de nouveaux comptes utilisateurs
- Chaque utilisateur voit uniquement les pages auxquelles son rôle a accès
- Le mot de passe par défaut pour tous les comptes de test est : `password123`
