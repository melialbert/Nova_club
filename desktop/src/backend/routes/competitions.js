const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, (req, res) => {
  try {
    const db = getDb();

    const result = db.prepare(`
      SELECT c.*,
        COUNT(DISTINCT mc.member_id) as participant_count
      FROM competitions c
      LEFT JOIN member_competitions mc ON c.id = mc.competition_id
      WHERE c.club_id = ?
      GROUP BY c.id
      ORDER BY c.competition_date DESC
    `).all(req.clubId);

    res.json(result);
  } catch (error) {
    console.error('Error fetching competitions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des compétitions' });
  }
});

router.get('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();

    const result = db.prepare('SELECT * FROM competitions WHERE id = ? AND club_id = ?')
      .get(req.params.id, req.clubId);

    if (!result) {
      return res.status(404).json({ error: 'Compétition non trouvée' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching competition:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la compétition' });
  }
});

router.post('/', authenticate, (req, res) => {
  const { name, competition_type, location, competition_date, description, level } = req.body;

  if (!name || !competition_date) {
    return res.status(400).json({ error: 'Le nom et la date sont requis' });
  }

  try {
    const db = getDb();

    const result = db.prepare(`
      INSERT INTO competitions
      (club_id, name, competition_type, location, competition_date, description, level)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.clubId, name, competition_type, location, competition_date, description, level);

    const inserted = db.prepare('SELECT * FROM competitions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(inserted);
  } catch (error) {
    console.error('Error creating competition:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la compétition' });
  }
});

router.put('/:id', authenticate, (req, res) => {
  const { name, competition_type, location, competition_date, description, level } = req.body;

  try {
    const db = getDb();

    const result = db.prepare(`
      UPDATE competitions
      SET name = ?, competition_type = ?, location = ?,
          competition_date = ?, description = ?, level = ?
      WHERE id = ? AND club_id = ?
    `).run(name, competition_type, location, competition_date, description, level, req.params.id, req.clubId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Compétition non trouvée' });
    }

    const updated = db.prepare('SELECT * FROM competitions WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating competition:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la compétition' });
  }
});

router.delete('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();

    const result = db.prepare('DELETE FROM competitions WHERE id = ? AND club_id = ?')
      .run(req.params.id, req.clubId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Compétition non trouvée' });
    }

    res.json({ message: 'Compétition supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting competition:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la compétition' });
  }
});

router.get('/:id/participants', authenticate, (req, res) => {
  try {
    const db = getDb();

    const result = db.prepare(`
      SELECT mc.*, m.first_name, m.last_name, m.photo_url
      FROM member_competitions mc
      JOIN members m ON mc.member_id = m.id
      WHERE mc.competition_id = ?
      ORDER BY mc.rank_achieved ASC
    `).all(req.params.id);

    res.json(result);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des participants' });
  }
});

module.exports = router;
