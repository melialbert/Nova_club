const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/member/:memberId', async (req, res) => {
  try {
    const memberCheck = await db.query(
      'SELECT id FROM members WHERE id = $1 AND club_id = $2',
      [req.params.memberId, req.user.club_id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    const competitions = await db.query(
      `SELECT mc.*, c.name, c.competition_type, c.location, c.competition_date, c.level
       FROM member_competitions mc
       JOIN competitions c ON mc.competition_id = c.id
       WHERE mc.member_id = $1
       ORDER BY c.competition_date DESC`,
      [req.params.memberId]
    );

    const events = await db.query(
      `SELECT *
       FROM career_events
       WHERE member_id = $1
       ORDER BY event_date DESC`,
      [req.params.memberId]
    );

    const stats = await db.query(
      `SELECT
         COUNT(*) as total_competitions,
         COUNT(CASE WHEN medal = 'gold' THEN 1 END) as gold_medals,
         COUNT(CASE WHEN medal = 'silver' THEN 1 END) as silver_medals,
         COUNT(CASE WHEN medal = 'bronze' THEN 1 END) as bronze_medals,
         SUM(points_earned) as total_points
       FROM member_competitions
       WHERE member_id = $1`,
      [req.params.memberId]
    );

    res.json({
      competitions: competitions.rows,
      events: events.rows,
      stats: stats.rows[0]
    });
  } catch (error) {
    console.error('Error fetching member career:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la carrière' });
  }
});

router.post('/member/:memberId/competition', async (req, res) => {
  const { competition_id, rank_achieved, weight_category, medal, points_earned, notes } = req.body;

  if (!competition_id) {
    return res.status(400).json({ error: 'L\'ID de la compétition est requis' });
  }

  try {
    const result = await db.query(
      `INSERT INTO member_competitions
       (member_id, competition_id, rank_achieved, weight_category, medal, points_earned, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.params.memberId, competition_id, rank_achieved, weight_category, medal, points_earned, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding competition to member:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Le membre est déjà inscrit à cette compétition' });
    }
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la compétition' });
  }
});

router.put('/member/:memberId/competition/:competitionId', async (req, res) => {
  const { rank_achieved, weight_category, medal, points_earned, notes } = req.body;

  try {
    const result = await db.query(
      `UPDATE member_competitions
       SET rank_achieved = $1, weight_category = $2, medal = $3,
           points_earned = $4, notes = $5
       WHERE member_id = $6 AND competition_id = $7
       RETURNING *`,
      [rank_achieved, weight_category, medal, points_earned, notes, req.params.memberId, req.params.competitionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Participation non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating competition result:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du résultat' });
  }
});

router.delete('/member/:memberId/competition/:competitionId', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM member_competitions WHERE member_id = $1 AND competition_id = $2 RETURNING *',
      [req.params.memberId, req.params.competitionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Participation non trouvée' });
    }

    res.json({ message: 'Participation supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting competition:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la participation' });
  }
});

router.post('/member/:memberId/event', async (req, res) => {
  const { event_type, title, description, event_date, achievement_level } = req.body;

  if (!event_type || !title || !event_date) {
    return res.status(400).json({ error: 'Le type, le titre et la date sont requis' });
  }

  try {
    const result = await db.query(
      `INSERT INTO career_events
       (member_id, event_type, title, description, event_date, achievement_level)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.params.memberId, event_type, title, description, event_date, achievement_level]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating career event:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'événement' });
  }
});

router.put('/member/:memberId/event/:eventId', async (req, res) => {
  const { event_type, title, description, event_date, achievement_level } = req.body;

  try {
    const result = await db.query(
      `UPDATE career_events
       SET event_type = $1, title = $2, description = $3,
           event_date = $4, achievement_level = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND member_id = $7
       RETURNING *`,
      [event_type, title, description, event_date, achievement_level, req.params.eventId, req.params.memberId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating career event:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'événement' });
  }
});

router.delete('/member/:memberId/event/:eventId', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM career_events WHERE id = $1 AND member_id = $2 RETURNING *',
      [req.params.eventId, req.params.memberId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    res.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting career event:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'événement' });
  }
});

module.exports = router;
