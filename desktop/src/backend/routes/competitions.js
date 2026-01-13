const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*,
        COUNT(DISTINCT mc.member_id) as participant_count
       FROM competitions c
       LEFT JOIN member_competitions mc ON c.id = mc.competition_id
       WHERE c.club_id = $1
       GROUP BY c.id
       ORDER BY c.competition_date DESC`,
      [req.user.club_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching competitions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des compétitions' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM competitions WHERE id = $1 AND club_id = $2',
      [req.params.id, req.user.club_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Compétition non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching competition:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la compétition' });
  }
});

router.post('/', async (req, res) => {
  const { name, competition_type, location, competition_date, description, level } = req.body;

  if (!name || !competition_date) {
    return res.status(400).json({ error: 'Le nom et la date sont requis' });
  }

  try {
    const result = await db.query(
      `INSERT INTO competitions
       (club_id, name, competition_type, location, competition_date, description, level)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.club_id, name, competition_type, location, competition_date, description, level]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating competition:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la compétition' });
  }
});

router.put('/:id', async (req, res) => {
  const { name, competition_type, location, competition_date, description, level } = req.body;

  try {
    const result = await db.query(
      `UPDATE competitions
       SET name = $1, competition_type = $2, location = $3,
           competition_date = $4, description = $5, level = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND club_id = $8
       RETURNING *`,
      [name, competition_type, location, competition_date, description, level, req.params.id, req.user.club_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Compétition non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating competition:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la compétition' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM competitions WHERE id = $1 AND club_id = $2 RETURNING *',
      [req.params.id, req.user.club_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Compétition non trouvée' });
    }

    res.json({ message: 'Compétition supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting competition:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la compétition' });
  }
});

router.get('/:id/participants', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT mc.*, m.first_name, m.last_name, m.photo_url
       FROM member_competitions mc
       JOIN members m ON mc.member_id = m.id
       WHERE mc.competition_id = $1
       ORDER BY mc.rank_achieved ASC NULLS LAST`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des participants' });
  }
});

module.exports = router;
