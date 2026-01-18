const express = require('express');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/member/:memberId', authenticate, async (req, res) => {
  try {
    const { memberId } = req.params;
    const { year } = req.query;
    const db = getDb();
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const fees = db.prepare(`
      SELECT * FROM monthly_fees
      WHERE member_id = ? AND year = ?
      ORDER BY month
    `).all(memberId, currentYear);

    const member = db.prepare('SELECT first_name, last_name, monthly_fee FROM members WHERE id = ?').get(memberId);

    if (!member) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    const monthlyFeeAmount = member.monthly_fee || 50;

    const payments = db.prepare(`
      SELECT total_amount, paid_amount, month_year
      FROM payments
      WHERE member_id = ? AND payment_type = 'monthly_fee' AND month_year LIKE ?
    `).all(memberId, `${currentYear}-%`);

    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const existingFee = fees.find(f => f.month === month);
      const monthYear = `${currentYear}-${String(month).padStart(2, '0')}`;
      const payment = payments.find(p => p.month_year === monthYear);

      const monthData = existingFee || {
        id: null,
        member_id: parseInt(memberId),
        club_id: req.clubId,
        year: currentYear,
        month,
        amount: monthlyFeeAmount,
        paid_date: null,
        status: 'unpaid',
        payment_method: null,
        notes: null
      };

      if (payment) {
        monthData.total_amount = payment.total_amount || monthData.amount;
        monthData.paid_amount = payment.paid_amount || monthData.amount;
        monthData.remaining_amount = (payment.total_amount || monthData.amount) - (payment.paid_amount || monthData.amount);
      }

      return monthData;
    });

    const stats = {
      total: allMonths.length,
      paid: allMonths.filter(f => f.status === 'paid').length,
      unpaid: allMonths.filter(f => f.status === 'unpaid').length,
      partial: allMonths.filter(f => f.status === 'partial').length,
      totalAmount: allMonths.reduce((sum, f) => sum + f.amount, 0),
      paidAmount: allMonths.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0),
      unpaidAmount: allMonths.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0)
    };

    res.json({
      member: {
        id: parseInt(memberId),
        name: `${member.first_name} ${member.last_name}`,
        monthly_fee: monthlyFeeAmount
      },
      year: currentYear,
      months: allMonths,
      stats
    });
  } catch (error) {
    console.error('Get monthly fees error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/mark-paid', authenticate, async (req, res) => {
  try {
    const { member_id, year, month, amount, payment_method, notes } = req.body;
    const db = getDb();
    const paid_date = new Date().toISOString().split('T')[0];
    const month_year = `${year}-${String(month).padStart(2, '0')}`;

    const existing = db.prepare(
      'SELECT id FROM monthly_fees WHERE member_id = ? AND year = ? AND month = ?'
    ).get(member_id, year, month);

    if (existing) {
      db.prepare(`
        UPDATE monthly_fees
        SET status = 'paid', paid_date = ?, payment_method = ?, notes = ?, amount = ?
        WHERE id = ?
      `).run(paid_date, payment_method, notes, amount, existing.id);

      const updated = db.prepare('SELECT * FROM monthly_fees WHERE id = ?').get(existing.id);

      const existingPayment = db.prepare(
        'SELECT id FROM payments WHERE member_id = ? AND month_year = ? AND payment_type = ?'
      ).get(member_id, month_year, 'monthly_fee');

      if (existingPayment) {
        db.prepare(`
          UPDATE payments
          SET amount = ?, payment_date = ?, payment_method = ?
          WHERE id = ?
        `).run(amount, paid_date, payment_method, existingPayment.id);
      } else {
        db.prepare(`
          INSERT INTO payments (club_id, member_id, amount, payment_date, payment_method, payment_type, month_year, description, status)
          VALUES (?, ?, ?, ?, ?, 'monthly_fee', ?, ?, 'completed')
        `).run(req.clubId, member_id, amount, paid_date, payment_method, month_year, notes || `Cotisation ${month_year}`);
      }

      return res.json(updated);
    } else {
      const result = db.prepare(`
        INSERT INTO monthly_fees
        (member_id, club_id, year, month, amount, paid_date, status, payment_method, notes)
        VALUES (?, ?, ?, ?, ?, ?, 'paid', ?, ?)
      `).run(member_id, req.clubId, year, month, amount, paid_date, payment_method, notes);

      db.prepare(`
        INSERT INTO payments (club_id, member_id, amount, payment_date, payment_method, payment_type, month_year, description, status)
        VALUES (?, ?, ?, ?, ?, 'monthly_fee', ?, ?, 'completed')
      `).run(req.clubId, member_id, amount, paid_date, payment_method, month_year, notes || `Cotisation ${month_year}`);

      const inserted = db.prepare('SELECT * FROM monthly_fees WHERE id = ?').get(result.lastInsertRowid);
      res.json(inserted);
    }
  } catch (error) {
    console.error('Mark fee as paid error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/mark-unpaid', authenticate, async (req, res) => {
  try {
    const { member_id, year, month } = req.body;
    const db = getDb();
    const month_year = `${year}-${String(month).padStart(2, '0')}`;

    const existing = db.prepare(
      'SELECT id FROM monthly_fees WHERE member_id = ? AND year = ? AND month = ?'
    ).get(member_id, year, month);

    if (existing) {
      db.prepare(`
        UPDATE monthly_fees
        SET status = 'unpaid', paid_date = NULL, payment_method = NULL
        WHERE id = ?
      `).run(existing.id);

      db.prepare(`
        DELETE FROM payments
        WHERE member_id = ? AND month_year = ? AND payment_type = ?
      `).run(member_id, month_year, 'monthly_fee');

      const updated = db.prepare('SELECT * FROM monthly_fees WHERE id = ?').get(existing.id);
      res.json(updated);
    } else {
      res.json({ message: 'Aucune cotisation à marquer comme non payée' });
    }
  } catch (error) {
    console.error('Mark fee as unpaid error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/statistics/:year', authenticate, async (req, res) => {
  try {
    const { year } = req.params;
    const db = getDb();

    const stats = db.prepare(`
      SELECT
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'unpaid' THEN 1 END) as unpaid_count,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN status = 'unpaid' THEN amount ELSE 0 END) as total_unpaid
      FROM monthly_fees
      WHERE club_id = ? AND year = ?
    `).get(req.clubId, year);

    res.json(stats);
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
