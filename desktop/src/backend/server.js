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
const beltPromotionsRoutes = require('./routes/belt-promotions');
const monthlyFeesRoutes = require('./routes/monthly-fees');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
app.use('/api/belt-promotions', beltPromotionsRoutes);
app.use('/api/monthly-fees', monthlyFeesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend running' });
});

const server = app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  if (process.send) {
    process.send({ status: 'ready', port: PORT });
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('\n❌ ERREUR: Le port 3001 est déjà utilisé!\n');
    console.log('Solutions:');
    console.log('  1. Arrêtez l\'autre instance qui utilise ce port');
    console.log('  2. Utilisez la commande: pkill -f "node.*server.js"');
    console.log('  3. Ou redémarrez votre ordinateur\n');
    process.exit(1);
  } else {
    console.error('Erreur serveur:', err);
    process.exit(1);
  }
});

module.exports = app;
