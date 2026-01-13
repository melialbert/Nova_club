import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllFromStore } from '../db';
import { useAppStore } from '../utils/store';
import Layout from '../components/Layout';

function DashboardPage() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingPayments: 0,
    monthlyRevenue: 0
  });
  const { isOnline } = useAppStore();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const members = await getAllFromStore('members');
    const payments = await getAllFromStore('payments');

    const activeMembers = members.filter(m => m.status === 'active').length;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyRevenue = payments
      .filter(p => p.month_year === currentMonth && p.status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    setStats({
      totalMembers: members.length,
      activeMembers,
      pendingPayments: members.length - activeMembers,
      monthlyRevenue
    });
  };

  return (
    <Layout>
      <div className="container">
        <h1 style={{ marginBottom: '32px' }}>Tableau de bord</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#666', marginBottom: '12px' }}>Total adhérents</h3>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1976d2' }}>{stats.totalMembers}</div>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#666', marginBottom: '12px' }}>Actifs</h3>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#4caf50' }}>{stats.activeMembers}</div>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#666', marginBottom: '12px' }}>Paiements en attente</h3>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#ff9800' }}>{stats.pendingPayments}</div>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#666', marginBottom: '12px' }}>Revenus du mois</h3>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#2e7d32' }}>{stats.monthlyRevenue} FCFA</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <Link to="/members" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'transform 0.3s' }}>
              <h3 style={{ color: '#1976d2', marginBottom: '12px' }}>Adhérents</h3>
              <p style={{ color: '#666' }}>Gérer les membres du club</p>
            </div>
          </Link>

          <Link to="/payments" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'transform 0.3s' }}>
              <h3 style={{ color: '#1976d2', marginBottom: '12px' }}>Paiements</h3>
              <p style={{ color: '#666' }}>Enregistrer les cotisations</p>
            </div>
          </Link>
        </div>

        {!isOnline && (
          <div className="offline-indicator">
            Mode hors ligne - Les données seront synchronisées automatiquement
          </div>
        )}
      </div>
    </Layout>
  );
}

export default DashboardPage;
