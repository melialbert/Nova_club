const express = require('express');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const employees = db.prepare('SELECT * FROM employees WHERE club_id = ? ORDER BY last_name, first_name').all(req.clubId);
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const { first_name, last_name, position, email, phone, salary, hire_date } = req.body;

    const result = db.prepare(`
      INSERT INTO employees (club_id, first_name, last_name, position, email, phone, salary, hire_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.clubId, first_name, last_name, position, email, phone, salary, hire_date);

    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(employee);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();
    const { first_name, last_name, position, email, phone, salary, hire_date, is_active } = req.body;

    db.prepare(`
      UPDATE employees
      SET first_name = ?, last_name = ?, position = ?, email = ?, phone = ?, salary = ?, hire_date = ?, is_active = ?
      WHERE id = ? AND club_id = ?
    `).run(first_name, last_name, position, email, phone, salary, hire_date, is_active, req.params.id, req.clubId);

    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    res.json(employee);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM employees WHERE id = ? AND club_id = ?').run(req.params.id, req.clubId);
    res.status(204).send();
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
