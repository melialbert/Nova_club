# Nouvelles fonctionnalités ajoutées

## 1. Vente de kimono lors de l'inscription

Lors de l'inscription d'un nouvel adhérent, vous pouvez maintenant directement lui vendre un kimono avec une taille spécifique.

### Comment utiliser cette fonctionnalité :

1. Accédez à la page **Adhérents**
2. Cliquez sur **Nouvel adhérent**
3. Remplissez les informations de l'adhérent
4. Cochez la case **Vendre un kimono lors de l'inscription**
5. Sélectionnez :
   - Le kimono dans la liste (les kimonos disponibles proviennent du catalogue d'équipements)
   - La taille appropriée (de 100 cm à 200 cm)
   - La quantité souhaitée
6. Le montant total s'affiche automatiquement
7. Enregistrez l'adhérent

### Ce qui se passe automatiquement :

- Une vente d'équipement est créée et enregistrée
- Une transaction de type "Revenu" est ajoutée à la comptabilité
- L'historique complet est conservé avec toutes les informations

### Tailles disponibles :

- **100 cm** : 4-5 ans
- **110 cm** : 5-6 ans
- **120 cm** : 6-7 ans
- **130 cm** : 7-8 ans
- **140 cm** : 8-9 ans
- **150 cm** : 9-11 ans
- **160 cm** : 11-13 ans
- **170 cm** : 13-15 ans
- **180 cm** : Adulte S
- **190 cm** : Adulte M
- **200 cm** : Adulte L

---

## 2. Module de comptabilité complet

Un nouveau module de comptabilité a été ajouté pour gérer toutes les finances du club.

### Accès :

Le module **Comptabilité** est accessible depuis le menu principal pour :
- Les **Administrateurs**
- Les **Secrétaires**

### Fonctionnalités principales :

#### A. Tableau de bord financier

Trois indicateurs principaux sont affichés en temps réel :
- **Revenus** : Total des entrées d'argent
- **Dépenses** : Total des sorties d'argent
- **Solde** : Différence entre revenus et dépenses

#### B. Gestion des transactions

Vous pouvez :
- Ajouter des revenus ou des dépenses
- Filtrer les transactions par type (Revenus / Dépenses)
- Filtrer par période (Aujourd'hui, Cette semaine, Ce mois, Cette année, Toutes périodes)
- Visualiser l'historique complet des transactions

#### C. Types de revenus :

- **Cotisation** : Paiements mensuels des adhérents
- **Vente équipement** : Ventes de kimonos, ceintures, etc.
- **Subvention** : Aides financières reçues
- **Autre** : Autres types de revenus

#### D. Types de dépenses :

- **Loyer** : Paiement du local
- **Charges** : Eau, électricité, etc.
- **Achat équipement** : Achats de matériel pour le club
- **Autre** : Autres types de dépenses

### Comment ajouter une transaction :

1. Accédez à la page **Comptabilité**
2. Cliquez sur **Nouvelle transaction**
3. Sélectionnez le type (Revenu ou Dépense)
4. Choisissez la catégorie appropriée
5. Entrez le montant en FCFA
6. Sélectionnez la date
7. Ajoutez une description (optionnel mais recommandé)
8. Cliquez sur **Enregistrer**

### Intégration automatique :

Les transactions suivantes sont créées automatiquement :
- Ventes de kimonos lors des inscriptions
- Paiements des cotisations
- Ventes d'équipements

### Suivi et analyse :

Le module affiche :
- L'historique complet avec filtres
- Les montants totaux par catégorie
- Le solde du club en temps réel
- Une indication visuelle (couleur) pour identifier rapidement les revenus et dépenses

---

## Accès selon les rôles :

### Admin
- Toutes les fonctionnalités
- Gestion des employés
- Paramètres du système

### Secrétaire
- Adhérents (avec vente de kimono)
- Licences
- Présences
- Paiements
- **Comptabilité**

### Coach
- Consultation des adhérents
- Gestion des présences

---

## Notes importantes :

1. Toutes les transactions sont enregistrées localement et synchronisées avec le serveur
2. Les données sont conservées même en mode hors ligne
3. Le système calcule automatiquement les totaux et le solde
4. Les filtres vous permettent d'analyser les finances sur différentes périodes
5. Chaque vente de kimono génère automatiquement une transaction comptable
