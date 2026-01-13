const express = require('express');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const club = db.prepare('SELECT * FROM clubs WHERE id = ?').get(req.clubId);

    if (!club) {
      return res.status(404).json({ error: 'Club non trouvé' });
    }

    res.json(club);
  } catch (error) {
    console.error('Get club error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const { name, address, phone, email, logo_url } = req.body;

    db.prepare(`
      UPDATE clubs
      SET name = ?, address = ?, phone = ?, email = ?, logo_url = ?
      WHERE id = ?
    `).run(name, address, phone, email, logo_url, req.clubId);

    const club = db.prepare('SELECT * FROM clubs WHERE id = ?').get(req.clubId);
    res.json(club);
  } catch (error) {
    console.error('Update club error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
