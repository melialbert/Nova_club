const express = require('express');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

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
    const { name, address, phone, email, logo_url, city, slogan } = req.body;

    db.prepare(`
      UPDATE clubs
      SET name = ?, address = ?, phone = ?, email = ?, logo_url = ?, city = ?, slogan = ?
      WHERE id = ?
    `).run(name, address, phone, email, logo_url, city, slogan, req.clubId);

    const club = db.prepare('SELECT * FROM clubs WHERE id = ?').get(req.clubId);
    res.json(club);
  } catch (error) {
    console.error('Update club error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/reset-database', authenticate, (req, res) => {
  try {
    const db = getDb();

    db.close();

    const dbPath = path.join(__dirname, '../../../data/club_management.db');

    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('Base de donnees supprimee:', dbPath);
    }

    const dbShmPath = `${dbPath}-shm`;
    const dbWalPath = `${dbPath}-wal`;

    if (fs.existsSync(dbShmPath)) {
      fs.unlinkSync(dbShmPath);
    }

    if (fs.existsSync(dbWalPath)) {
      fs.unlinkSync(dbWalPath);
    }

    res.json({
      success: true,
      message: 'Base de donnees reinitialise avec succes'
    });

    setTimeout(() => {
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error('Reset database error:', error);
    res.status(500).json({ error: 'Erreur lors de la reinitialisation' });
  }
});

module.exports = router;
