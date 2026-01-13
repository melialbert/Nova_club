const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');
const authRoutes = require('./routes/auth');
const membersRoutes = require('./routes/members');
const attendancesRoutes = require('./routes/attendances');
const paymentsRoutes = require('./routes/payments');
const licensesRoutes = require('./routes/licenses');
const employeesRoutes = require('./routes/employees');
const transactionsRoutes = require('./routes/transactions');
const clubRoutes = require('./routes/club');
const competitionsRoutes = require('./routes/competitions');
const careerRoutes = require('./routes/career');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

initDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/attendances', attendancesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/licenses', licensesRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/club', clubRoutes);
app.use('/api/competitions', competitionsRoutes);
app.use('/api/career', careerRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend running' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  if (process.send) {
    process.send({ status: 'ready', port: PORT });
  }
});

module.exports = app;
