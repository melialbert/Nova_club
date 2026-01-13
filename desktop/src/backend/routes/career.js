const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

router.get('/member/:memberId', authenticate, (req, res) => {
  try {
    const db = getDb();

    const memberCheck = db.prepare('SELECT id FROM members WHERE id = ? AND club_id = ?')
      .get(req.params.memberId, req.clubId);

    if (!memberCheck) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    const competitions = db.prepare(`
      SELECT mc.*, c.name, c.competition_type, c.location, c.competition_date, c.level
      FROM member_competitions mc
      JOIN competitions c ON mc.competition_id = c.id
      WHERE mc.member_id = ?
      ORDER BY c.competition_date DESC
    `).all(req.params.memberId);

    const events = db.prepare(`
      SELECT *
      FROM career_events
      WHERE member_id = ?
      ORDER BY event_date DESC
    `).all(req.params.memberId);

    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_competitions,
        COUNT(CASE WHEN medal = 'gold' THEN 1 END) as gold_medals,
        COUNT(CASE WHEN medal = 'silver' THEN 1 END) as silver_medals,
        COUNT(CASE WHEN medal = 'bronze' THEN 1 END) as bronze_medals,
        SUM(points_earned) as total_points
      FROM member_competitions
      WHERE member_id = ?
    `).get(req.params.memberId) || {
      total_competitions: 0,
      gold_medals: 0,
      silver_medals: 0,
      bronze_medals: 0,
      total_points: 0
    };

    res.json({
      competitions: competitions,
      events: events,
      stats: stats
    });
  } catch (error) {
    console.error('Error fetching member career:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la carrière' });
  }
});

router.post('/member/:memberId/competition', authenticate, (req, res) => {
  const { competition_id, rank_achieved, weight_category, medal, points_earned, notes } = req.body;

  if (!competition_id) {
    return res.status(400).json({ error: 'L\'ID de la compétition est requis' });
  }

  try {
    const db = getDb();

    const result = db.prepare(`
      INSERT INTO member_competitions
      (member_id, competition_id, rank_achieved, weight_category, medal, points_earned, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.params.memberId, competition_id, rank_achieved, weight_category, medal, points_earned, notes);

    const inserted = db.prepare('SELECT * FROM member_competitions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(inserted);
  } catch (error) {
    console.error('Error adding competition to member:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Le membre est déjà inscrit à cette compétition' });
    }
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la compétition' });
  }
});

router.put('/member/:memberId/competition/:competitionId', authenticate, (req, res) => {
  const { rank_achieved, weight_category, medal, points_earned, notes } = req.body;

  try {
    const db = getDb();

    const result = db.prepare(`
      UPDATE member_competitions
      SET rank_achieved = ?, weight_category = ?, medal = ?,
          points_earned = ?, notes = ?
      WHERE member_id = ? AND competition_id = ?
    `).run(rank_achieved, weight_category, medal, points_earned, notes, req.params.memberId, req.params.competitionId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Participation non trouvée' });
    }

    const updated = db.prepare('SELECT * FROM member_competitions WHERE member_id = ? AND competition_id = ?')
      .get(req.params.memberId, req.params.competitionId);
    res.json(updated);
  } catch (error) {
    console.error('Error updating competition result:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du résultat' });
  }
});

router.delete('/member/:memberId/competition/:competitionId', authenticate, (req, res) => {
  try {
    const db = getDb();

    const result = db.prepare('DELETE FROM member_competitions WHERE member_id = ? AND competition_id = ?')
      .run(req.params.memberId, req.params.competitionId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Participation non trouvée' });
    }

    res.json({ message: 'Participation supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting competition:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la participation' });
  }
});

router.post('/member/:memberId/event', authenticate, (req, res) => {
  const { event_type, title, description, event_date, achievement_level } = req.body;

  if (!event_type || !title || !event_date) {
    return res.status(400).json({ error: 'Le type, le titre et la date sont requis' });
  }

  try {
    const db = getDb();

    const result = db.prepare(`
      INSERT INTO career_events
      (member_id, event_type, title, description, event_date, achievement_level)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.params.memberId, event_type, title, description, event_date, achievement_level);

    const inserted = db.prepare('SELECT * FROM career_events WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(inserted);
  } catch (error) {
    console.error('Error creating career event:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'événement' });
  }
});

router.put('/member/:memberId/event/:eventId', authenticate, (req, res) => {
  const { event_type, title, description, event_date, achievement_level } = req.body;

  try {
    const db = getDb();

    const result = db.prepare(`
      UPDATE career_events
      SET event_type = ?, title = ?, description = ?,
          event_date = ?, achievement_level = ?
      WHERE id = ? AND member_id = ?
    `).run(event_type, title, description, event_date, achievement_level, req.params.eventId, req.params.memberId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    const updated = db.prepare('SELECT * FROM career_events WHERE id = ?').get(req.params.eventId);
    res.json(updated);
  } catch (error) {
    console.error('Error updating career event:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'événement' });
  }
});

router.delete('/member/:memberId/event/:eventId', authenticate, (req, res) => {
  try {
    const db = getDb();

    const result = db.prepare('DELETE FROM career_events WHERE id = ? AND member_id = ?')
      .run(req.params.eventId, req.params.memberId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    res.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting career event:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'événement' });
  }
});

module.exports = router;
