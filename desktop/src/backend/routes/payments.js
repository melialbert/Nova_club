const express = require('express');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const payments = db.prepare(`
      SELECT p.*, m.first_name, m.last_name
      FROM payments p
      JOIN members m ON p.member_id = m.id
      WHERE p.club_id = ?
      ORDER BY p.payment_date DESC
    `).all(req.clubId);
    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const { member_id, amount, payment_date, payment_method, description, status } = req.body;

    const result = db.prepare(`
      INSERT INTO payments (club_id, member_id, amount, payment_date, payment_method, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.clubId, member_id, amount, payment_date, payment_method, description, status || 'completed');

    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(payment);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM payments WHERE id = ? AND club_id = ?').run(req.params.id, req.clubId);
    res.status(204).send();
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
