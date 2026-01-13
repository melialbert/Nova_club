# Suivi de Carrière des Adhérents

Cette fonctionnalité permet de suivre la carrière sportive de chaque adhérent, incluant leurs participations aux compétitions et autres événements importants.

## Installation

### 1. Appliquer la migration de base de données

**Sur Windows:**
```bash
apply-career-migration.bat
```

**Sur Linux/Mac:**
```bash
chmod +x apply-career-migration.sh
./apply-career-migration.sh
```

### 2. Redémarrer l'application

Redémarrez l'application Desktop pour que les nouvelles routes API soient prises en compte.

## Fonctionnalités

### 1. Vue d'ensemble de la carrière
- Statistiques globales (nombre de compétitions, médailles)
- Compétitions récentes
- Résumé visuel des performances

### 2. Gestion des compétitions
- Créer des compétitions au niveau du club
- Inscrire des adhérents aux compétitions
- Enregistrer les résultats (classement, médailles, points)
- Suivre les catégories de poids
- Ajouter des notes sur les performances

### 3. Événements de carrière
Les types d'événements suivants peuvent être enregistrés:
- **Certifications**: Certifications officielles obtenues
- **Passage de grade**: Progression dans les ceintures/grades
- **Réalisations**: Accomplissements sportifs notables
- **Récompenses**: Prix et distinctions reçus
- **Séminaires**: Participation à des stages et formations
- **Autre**: Tout autre événement pertinent

## Utilisation

### Consulter la carrière d'un adhérent

1. Allez dans la page **Adhérents**
2. Cliquez sur le bouton 🏆 (trophée) à côté du nom de l'adhérent
3. Une fenêtre modale s'ouvrira avec trois onglets:
   - **Vue d'ensemble**: Statistiques et aperçu rapide
   - **Compétitions**: Liste complète des compétitions avec résultats
   - **Événements**: Autres jalons de carrière

### Ajouter une compétition

1. Dans le modal de carrière, allez dans l'onglet **Compétitions**
2. Cliquez sur **+ Ajouter**
3. Remplissez les informations:
   - Sélectionnez la compétition
   - Indiquez le classement obtenu
   - Ajoutez la médaille (or, argent, bronze) si applicable
   - Notez les points gagnés
   - Précisez la catégorie de poids
   - Ajoutez des notes supplémentaires
4. Cliquez sur **Enregistrer**

### Créer une nouvelle compétition

Les compétitions doivent d'abord être créées au niveau du club. Utilisez l'API suivante:

```javascript
await api.createCompetition({
  name: "Championnat National 2024",
  competition_type: "Championnat",
  location: "Yaoundé",
  competition_date: "2024-06-15",
  description: "Championnat national de judo",
  level: "National"
});
```

### Ajouter un événement de carrière

1. Dans le modal de carrière, allez dans l'onglet **Événements**
2. Cliquez sur **+ Ajouter**
3. Remplissez les informations:
   - Type d'événement
   - Titre descriptif
   - Date de l'événement
   - Description détaillée (optionnel)
4. Cliquez sur **Enregistrer**

## Structure de la base de données

### Table: competitions
Stocke les compétitions organisées ou auxquelles le club participe.

Colonnes:
- `id`: Identifiant unique
- `club_id`: Référence au club
- `name`: Nom de la compétition
- `competition_type`: Type (championnat, tournoi, etc.)
- `location`: Lieu
- `competition_date`: Date
- `description`: Description
- `level`: Niveau (local, régional, national, international)

### Table: member_competitions
Lie les adhérents aux compétitions avec leurs résultats.

Colonnes:
- `id`: Identifiant unique
- `member_id`: Référence à l'adhérent
- `competition_id`: Référence à la compétition
- `rank_achieved`: Classement obtenu
- `weight_category`: Catégorie de poids
- `medal`: Médaille (gold, silver, bronze)
- `points_earned`: Points gagnés
- `notes`: Notes supplémentaires

### Table: career_events
Stocke les autres événements importants de la carrière d'un adhérent.

Colonnes:
- `id`: Identifiant unique
- `member_id`: Référence à l'adhérent
- `event_type`: Type d'événement
- `title`: Titre
- `description`: Description
- `event_date`: Date
- `achievement_level`: Niveau d'accomplissement

## API

### Obtenir la carrière d'un adhérent
```javascript
const career = await api.getMemberCareer(memberId);
// Retourne: { competitions: [...], events: [...], stats: {...} }
```

### Ajouter une compétition à un adhérent
```javascript
await api.addCompetitionToMember(memberId, {
  competition_id: 1,
  rank_achieved: 2,
  medal: 'silver',
  weight_category: '-66kg',
  points_earned: 50,
  notes: 'Excellent combat en demi-finale'
});
```

### Ajouter un événement de carrière
```javascript
await api.addCareerEvent(memberId, {
  event_type: 'belt_promotion',
  title: 'Passage ceinture noire',
  description: 'Réussite de l\'examen de passage',
  event_date: '2024-01-15',
  achievement_level: '1er Dan'
});
```

## Avantages

1. **Historique complet**: Gardez une trace de toutes les réalisations sportives
2. **Motivation**: Les adhérents peuvent voir leur progression
3. **Analyse**: Identifiez les adhérents performants
4. **Communication**: Mettez en valeur les succès du club
5. **Suivi**: Suivez l'évolution de chaque adhérent au fil du temps

## Prochaines améliorations possibles

- Export PDF du palmarès d'un adhérent
- Graphiques de progression
- Classement des adhérents par performances
- Statistiques comparatives
- Notifications pour les compétitions à venir
- Galerie photos des compétitions
