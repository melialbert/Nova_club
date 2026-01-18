const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const users = db.prepare(`
      SELECT id, email, first_name, last_name, role, phone, created_at
      FROM users
      WHERE club_id = ? AND role IN ('admin', 'coach', 'secretary')
      ORDER BY last_name, first_name
    `).all(req.clubId);
    res.json(users);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la liste des employés.' });
  }
});

router.post('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const { first_name, last_name, email, phone, role, password } = req.body;

    if (!first_name || !last_name || !email || !role || !password) {
      return res.status(400).json({ error: 'Tous les champs requis doivent être remplis (prénom, nom, email, rôle, mot de passe).' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: `Un utilisateur avec l'email ${email} existe déjà. Veuillez utiliser un autre email.` });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const normalizedRole = role.toLowerCase();

    console.log(`Creating user: ${email} with role: ${normalizedRole}`);

    const result = db.prepare(`
      INSERT INTO users (club_id, email, password_hash, role, first_name, last_name, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.clubId, email, passwordHash, normalizedRole, first_name, last_name, phone || null);

    const user = db.prepare(`
      SELECT id, email, first_name, last_name, role, phone, created_at
      FROM users WHERE id = ?
    `).get(result.lastInsertRowid);

    console.log(`User created successfully: ID=${user.id}, Email=${user.email}, Role=${user.role}`);

    res.status(201).json(user);
  } catch (error) {
    console.error('Create employee error:', error);
    if (error.message && error.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà.' });
    } else {
      res.status(500).json({ error: 'Erreur lors de la création de l\'employé. Vérifiez les données saisies.' });
    }
  }
});

router.put('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();
    const { first_name, last_name, email, phone, role, password } = req.body;

    if (!first_name || !last_name || !email || !role) {
      return res.status(400).json({ error: 'Tous les champs requis doivent être remplis (prénom, nom, email, rôle).' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.params.id);
    if (existingUser) {
      return res.status(400).json({ error: `Un autre utilisateur utilise déjà l'email ${email}. Veuillez utiliser un autre email.` });
    }

    const normalizedRole = role.toLowerCase();

    if (password && password.trim() !== '') {
      const passwordHash = bcrypt.hashSync(password, 10);
      db.prepare(`
        UPDATE users
        SET first_name = ?, last_name = ?, email = ?, phone = ?, role = ?, password_hash = ?
        WHERE id = ? AND club_id = ?
      `).run(first_name, last_name, email, phone || null, normalizedRole, passwordHash, req.params.id, req.clubId);
    } else {
      db.prepare(`
        UPDATE users
        SET first_name = ?, last_name = ?, email = ?, phone = ?, role = ?
        WHERE id = ? AND club_id = ?
      `).run(first_name, last_name, email, phone || null, normalizedRole, req.params.id, req.clubId);
    }

    const user = db.prepare(`
      SELECT id, email, first_name, last_name, role, phone, created_at
      FROM users WHERE id = ?
    `).get(req.params.id);

    res.json(user);
  } catch (error) {
    console.error('Update employee error:', error);
    if (error.message && error.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'Un autre utilisateur utilise déjà cet email.' });
    } else {
      res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'employé. Vérifiez les données saisies.' });
    }
  }
});

router.delete('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();

    const user = db.prepare('SELECT role FROM users WHERE id = ? AND club_id = ?').get(req.params.id, req.clubId);
    if (!user) {
      return res.status(404).json({ error: 'Employé introuvable. Il a peut-être déjà été supprimé.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Impossible de supprimer un administrateur. Les comptes administrateurs ne peuvent pas être supprimés.' });
    }

    db.prepare('DELETE FROM users WHERE id = ? AND club_id = ?').run(req.params.id, req.clubId);
    res.status(204).send();
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'employé. Veuillez réessayer.' });
  }
});

module.exports = router;
