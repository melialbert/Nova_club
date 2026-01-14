import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  } else if (days > 0) {
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return 'À l\'instant';
  }
}

function DashboardPage() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalPayments: 0,
    pendingLicenses: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    loadStats();
    loadRecentActivities();
  }, []);

  const loadStats = async () => {
    try {
      const members = await api.getMembers();
      const payments = await api.getPayments();
      const licenses = await api.getLicenses();

      setStats({
        totalMembers: members.length,
        activeMembers: members.filter(m => m.is_active).length,
        totalPayments: payments.reduce((sum, p) => sum + p.amount, 0),
        pendingLicenses: licenses.filter(l => l.status === 'pending').length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const [members, payments, attendances, transactions] = await Promise.all([
        api.getMembers(),
        api.getPayments(),
        api.getAttendances(),
        api.getTransactions()
      ]);

      const activities = [];

      members
        .sort((a, b) => new Date(b.registration_date) - new Date(a.registration_date))
        .slice(0, 3)
        .forEach(member => {
          activities.push({
            type: 'member',
            icon: '👤',
            color: '#3b82f6',
            bgColor: 'rgba(59, 130, 246, 0.1)',
            title: 'Nouveau membre',
            description: `${member.first_name} ${member.last_name} a rejoint le club`,
            date: new Date(member.registration_date)
          });
        });

      payments
        .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
        .slice(0, 3)
        .forEach(payment => {
          activities.push({
            type: 'payment',
            icon: '💰',
            color: '#10b981',
            bgColor: 'rgba(16, 185, 129, 0.1)',
            title: 'Paiement reçu',
            description: `${Math.round(payment.amount).toLocaleString()} FCFA - ${payment.payment_method || 'Non spécifié'}`,
            date: new Date(payment.payment_date)
          });
        });

      attendances
        .sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date))
        .slice(0, 2)
        .forEach(attendance => {
          activities.push({
            type: 'attendance',
            icon: '✅',
            color: '#f59e0b',
            bgColor: 'rgba(245, 158, 11, 0.1)',
            title: 'Présence enregistrée',
            description: `Séance du ${new Date(attendance.attendance_date).toLocaleDateString('fr-FR')}`,
            date: new Date(attendance.attendance_date)
          });
        });

      transactions
        .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
        .slice(0, 3)
        .forEach(transaction => {
          activities.push({
            type: transaction.type,
            icon: transaction.type === 'income' ? '📈' : '📉',
            color: transaction.type === 'income' ? '#10b981' : '#ef4444',
            bgColor: transaction.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            title: transaction.type === 'income' ? 'Revenu' : 'Dépense',
            description: `${transaction.category} - ${Math.round(transaction.amount).toLocaleString()} FCFA`,
            date: new Date(transaction.transaction_date)
          });
        });

      activities.sort((a, b) => b.date - a.date);
      setRecentActivities(activities.slice(0, 10));
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
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
      label: 'Revenus Totaux',
      value: `${Math.round(stats.totalPayments).toLocaleString()} FCFA`,
      icon: '💰',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      trend: '+18%'
    },
    {
      label: 'Licences en Attente',
      value: stats.pendingLicenses,
      icon: '🎫',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      trend: '-3%'
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
          <h2 className="card-title">
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
          <h2 className="card-title">
            📊 Activité Récente
          </h2>
        </div>

        {recentActivities.length === 0 ? (
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
        ) : (
          <div style={{ padding: '8px' }}>
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.borderColor = activity.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: activity.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    marginRight: '16px',
                    flexShrink: 0
                  }}
                >
                  {activity.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '4px'
                  }}>
                    {activity.title}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#64748b',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {activity.description}
                  </div>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginLeft: '16px',
                  flexShrink: 0,
                  textAlign: 'right'
                }}>
                  {formatRelativeTime(activity.date)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
