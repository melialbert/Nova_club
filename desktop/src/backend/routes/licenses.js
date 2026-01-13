const express = require('express');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const licenses = db.prepare(`
      SELECT l.*, m.first_name, m.last_name
      FROM licenses l
      JOIN members m ON l.member_id = m.id
      WHERE l.club_id = ?
      ORDER BY l.expiry_date DESC
    `).all(req.clubId);
    res.json(licenses);
  } catch (error) {
    console.error('Get licenses error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const { member_id, license_number, issue_date, expiry_date, status } = req.body;

    const result = db.prepare(`
      INSERT INTO licenses (club_id, member_id, license_number, issue_date, expiry_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.clubId, member_id, license_number, issue_date, expiry_date, status || 'active');

    const license = db.prepare('SELECT * FROM licenses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(license);
  } catch (error) {
    console.error('Create license error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();
    const { license_number, issue_date, expiry_date, status } = req.body;

    db.prepare(`
      UPDATE licenses
      SET license_number = ?, issue_date = ?, expiry_date = ?, status = ?
      WHERE id = ? AND club_id = ?
    `).run(license_number, issue_date, expiry_date, status, req.params.id, req.clubId);

    const license = db.prepare('SELECT * FROM licenses WHERE id = ?').get(req.params.id);
    res.json(license);
  } catch (error) {
    console.error('Update license error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM licenses WHERE id = ? AND club_id = ?').run(req.params.id, req.clubId);
    res.status(204).send();
  } catch (error) {
    console.error('Delete license error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
