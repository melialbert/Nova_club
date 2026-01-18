const express = require('express');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const attendances = db.prepare(`
      SELECT a.*, m.first_name, m.last_name
      FROM attendances a
      JOIN members m ON a.member_id = m.id
      WHERE a.club_id = ?
      ORDER BY a.date DESC
    `).all(req.clubId);
    res.json(attendances);
  } catch (error) {
    console.error('Get attendances error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const { member_id, date, status, notes } = req.body;

    if (!member_id || !date) {
      return res.status(400).json({ error: 'member_id et date sont requis' });
    }

    const attendanceStatus = status || 'present';

    const result = db.prepare(`
      INSERT INTO attendances (club_id, member_id, date, status, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.clubId, member_id, date, attendanceStatus, notes || null);

    const attendance = db.prepare('SELECT * FROM attendances WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();
    const { status, notes } = req.body;

    db.prepare(`
      UPDATE attendances
      SET status = ?, notes = ?
      WHERE id = ? AND club_id = ?
    `).run(status, notes, req.params.id, req.clubId);

    const attendance = db.prepare('SELECT * FROM attendances WHERE id = ?').get(req.params.id);
    res.json(attendance);
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM attendances WHERE id = ? AND club_id = ?').run(req.params.id, req.clubId);
    res.status(204).send();
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
