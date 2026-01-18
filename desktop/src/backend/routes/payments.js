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

    const paymentsWithDefaults = payments.map(p => {
      const totalAmount = p.total_amount || p.amount;
      const paidAmount = p.paid_amount || p.amount;
      const remainingAmount = totalAmount - paidAmount;

      return {
        ...p,
        payment_type: p.payment_type || 'other',
        month_year: p.month_year || null,
        total_amount: totalAmount,
        paid_amount: paidAmount,
        remaining_amount: remainingAmount
      };
    });

    res.json(paymentsWithDefaults);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const { member_id, amount, total_amount, paid_amount, payment_date, payment_method, description, status, payment_type, month_year, notes } = req.body;

    const finalTotalAmount = total_amount || amount;
    const finalPaidAmount = paid_amount || amount;
    const finalStatus = finalPaidAmount >= finalTotalAmount ? 'completed' : (finalPaidAmount > 0 ? 'partial' : 'unpaid');

    const result = db.prepare(`
      INSERT INTO payments (club_id, member_id, amount, total_amount, paid_amount, payment_date, payment_method, payment_type, month_year, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.clubId,
      member_id,
      finalPaidAmount,
      finalTotalAmount,
      finalPaidAmount,
      payment_date,
      payment_method,
      payment_type || 'other',
      month_year,
      notes || description,
      status || finalStatus
    );

    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid);

    if (payment_type === 'monthly_fee' && month_year) {
      const [year, month] = month_year.split('-').map(Number);

      const existing = db.prepare(
        'SELECT id FROM monthly_fees WHERE member_id = ? AND year = ? AND month = ?'
      ).get(member_id, year, month);

      if (existing) {
        const feeStatus = finalPaidAmount >= finalTotalAmount ? 'paid' : (finalPaidAmount > 0 ? 'partial' : 'unpaid');
        db.prepare(`
          UPDATE monthly_fees
          SET status = ?, paid_date = ?, payment_method = ?, amount = ?
          WHERE id = ?
        `).run(feeStatus, payment_date, payment_method, finalTotalAmount, existing.id);
      } else {
        const feeStatus = finalPaidAmount >= finalTotalAmount ? 'paid' : (finalPaidAmount > 0 ? 'partial' : 'unpaid');
        db.prepare(`
          INSERT INTO monthly_fees
          (member_id, club_id, year, month, amount, paid_date, status, payment_method)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(member_id, req.clubId, year, month, finalTotalAmount, payment_date, feeStatus, payment_method);
      }
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();

    const payment = db.prepare('SELECT * FROM payments WHERE id = ? AND club_id = ?').get(req.params.id, req.clubId);

    if (payment && payment.payment_type === 'monthly_fee' && payment.month_year) {
      const [year, month] = payment.month_year.split('-').map(Number);

      db.prepare(`
        UPDATE monthly_fees
        SET status = 'unpaid', paid_date = NULL, payment_method = NULL
        WHERE member_id = ? AND year = ? AND month = ?
      `).run(payment.member_id, year, month);
    }

    db.prepare('DELETE FROM payments WHERE id = ? AND club_id = ?').run(req.params.id, req.clubId);
    res.status(204).send();
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
