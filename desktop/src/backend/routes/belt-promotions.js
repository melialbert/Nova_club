const express = require('express');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const promotions = db.prepare(`
      SELECT bp.*, m.first_name, m.last_name
      FROM belt_promotions bp
      JOIN members m ON bp.member_id = m.id
      WHERE bp.club_id = ?
      ORDER BY bp.promotion_date DESC
    `).all(req.clubId);
    res.json(promotions);
  } catch (error) {
    console.error('Get belt promotions error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();
    const promotion = db.prepare(`
      SELECT bp.*, m.first_name, m.last_name
      FROM belt_promotions bp
      JOIN members m ON bp.member_id = m.id
      WHERE bp.id = ? AND bp.club_id = ?
    `).get(req.params.id, req.clubId);

    if (!promotion) {
      return res.status(404).json({ error: 'Passage de grade non trouvé' });
    }

    res.json(promotion);
  } catch (error) {
    console.error('Get belt promotion error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const { member_id, previous_belt, new_belt, promotion_date, examiner, notes } = req.body;

    const result = db.prepare(`
      INSERT INTO belt_promotions (club_id, member_id, previous_belt, new_belt, promotion_date, examiner, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.clubId, member_id, previous_belt, new_belt, promotion_date, examiner, notes);

    db.prepare(`
      UPDATE members
      SET belt_level = ?
      WHERE id = ? AND club_id = ?
    `).run(new_belt, member_id, req.clubId);

    const promotion = db.prepare('SELECT * FROM belt_promotions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(promotion);
  } catch (error) {
    console.error('Create belt promotion error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();
    const { member_id, previous_belt, new_belt, promotion_date, examiner, notes } = req.body;

    db.prepare(`
      UPDATE belt_promotions
      SET member_id = ?, previous_belt = ?, new_belt = ?, promotion_date = ?, examiner = ?, notes = ?
      WHERE id = ? AND club_id = ?
    `).run(member_id, previous_belt, new_belt, promotion_date, examiner, notes, req.params.id, req.clubId);

    db.prepare(`
      UPDATE members
      SET belt_level = ?
      WHERE id = ? AND club_id = ?
    `).run(new_belt, member_id, req.clubId);

    const promotion = db.prepare('SELECT * FROM belt_promotions WHERE id = ?').get(req.params.id);
    res.json(promotion);
  } catch (error) {
    console.error('Update belt promotion error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM belt_promotions WHERE id = ? AND club_id = ?').run(req.params.id, req.clubId);
    res.status(204).send();
  } catch (error) {
    console.error('Delete belt promotion error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
