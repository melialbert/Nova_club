const express = require('express');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const members = db.prepare('SELECT * FROM members WHERE club_id = ? ORDER BY last_name, first_name').all(req.clubId);
    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();
    const member = db.prepare('SELECT * FROM members WHERE id = ? AND club_id = ?').get(req.params.id, req.clubId);

    if (!member) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    res.json(member);
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      belt_level,
      phone,
      email,
      address,
      emergency_contact,
      emergency_phone,
      photo_url,
      category,
      discipline,
      status,
      monthly_fee,
      registration_date
    } = req.body;

    const result = db.prepare(`
      INSERT INTO members (
        club_id, first_name, last_name, date_of_birth, gender, belt_level,
        phone, email, address, emergency_contact, emergency_phone, photo_url,
        category, discipline, status, monthly_fee, registration_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.clubId, first_name, last_name, date_of_birth, gender, belt_level,
      phone, email, address, emergency_contact, emergency_phone, photo_url,
      category, discipline, status, monthly_fee, registration_date
    );

    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(member);
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();
    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      belt_level,
      phone,
      email,
      address,
      emergency_contact,
      emergency_phone,
      photo_url,
      category,
      discipline,
      status,
      monthly_fee,
      registration_date,
      is_active
    } = req.body;

    db.prepare(`
      UPDATE members
      SET first_name = ?, last_name = ?, date_of_birth = ?, gender = ?, belt_level = ?,
          phone = ?, email = ?, address = ?, emergency_contact = ?, emergency_phone = ?,
          photo_url = ?, category = ?, discipline = ?, status = ?, monthly_fee = ?,
          registration_date = ?, is_active = ?
      WHERE id = ? AND club_id = ?
    `).run(
      first_name, last_name, date_of_birth, gender, belt_level,
      phone, email, address, emergency_contact, emergency_phone, photo_url,
      category, discipline, status, monthly_fee, registration_date, is_active,
      req.params.id, req.clubId
    );

    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
    res.json(member);
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM members WHERE id = ? AND club_id = ?').run(req.params.id, req.clubId);
    res.status(204).send();
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
