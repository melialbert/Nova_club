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

  const statCards = [
    {
      label: 'Total Adhérents',
      value: stats.totalMembers,
      icon: '👥',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      trend: '+12%'
    },
    {
      label: 'Membres Actifs',
      value: stats.activeMembers,
      icon: '✅',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      trend: '+5%'
    },
    {
      label: 'Paiements en Attente',
      value: stats.pendingPayments,
      icon: '⏳',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      trend: '-3%'
    },
    {
      label: 'Revenus du Mois',
      value: `${stats.monthlyRevenue.toLocaleString()} FCFA`,
      icon: '💰',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      trend: '+18%'
    }
  ];

  const quickActions = [
    {
      title: 'Adhérents',
      description: 'Gérer les membres du club',
      icon: '👥',
      path: '/members',
      color: '#3b82f6'
    },
    {
      title: 'Paiements',
      description: 'Enregistrer les cotisations',
      icon: '💳',
      path: '/payments',
      color: '#10b981'
    }
  ];

  return (
    <Layout>
      <div className="fade-in">
        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <div key={index} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div
                  className="stat-icon"
                  style={{
                    backgroundColor: stat.bgColor,
                    color: stat.color
                  }}
                >
                  {stat.icon}
                </div>
                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: stat.color === '#f59e0b' ? '#fef3c7' : '#d1fae5',
                    color: stat.color === '#f59e0b' ? '#92400e' : '#065f46'
                  }}
                >
                  {stat.trend}
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              🚀 Actions Rapides
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                style={{
                  textDecoration: 'none',
                  display: 'block',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = action.color;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${action.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: `${action.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  marginBottom: '16px'
                }}>
                  {action.icon}
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '8px'
                }}>
                  {action.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: 0
                }}>
                  {action.description}
                </p>
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  color: action.color,
                  fontSize: '20px'
                }}>
                  →
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              📊 Activité Récente
            </h2>
          </div>

          <div style={{
            padding: '32px',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
              Aucune activité récente
            </p>
            <p style={{ fontSize: '14px', margin: 0 }}>
              Les activités récentes apparaîtront ici
            </p>
          </div>
        </div>

        {!isOnline && (
          <div className="offline-indicator">
            <span style={{ marginRight: '8px' }}>📡</span>
            Mode hors ligne - Synchronisation automatique activée
          </div>
        )}
      </div>
    </Layout>
  );
}

export default DashboardPage;
