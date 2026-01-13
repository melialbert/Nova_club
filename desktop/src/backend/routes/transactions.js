const express = require('express');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const transactions = db.prepare('SELECT * FROM transactions WHERE club_id = ? ORDER BY transaction_date DESC').all(req.clubId);
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const { type, category, amount, description, transaction_date } = req.body;

    const result = db.prepare(`
      INSERT INTO transactions (club_id, type, category, amount, description, transaction_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.clubId, type, category, amount, description, transaction_date);

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM transactions WHERE id = ? AND club_id = ?').run(req.params.id, req.clubId);
    res.status(204).send();
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
