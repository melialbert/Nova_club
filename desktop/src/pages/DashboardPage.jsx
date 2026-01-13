import { useState, useEffect } from 'react';
import { api } from '../services/api';

function DashboardPage() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalPayments: 0,
    pendingLicenses: 0
  });

  useEffect(() => {
    loadStats();
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

  const StatCard = ({ title, value, icon, color }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            {title}
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#0f172a'
          }}>
            {value}
          </div>
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <StatCard
          title="Total Adhérents"
          value={stats.totalMembers}
          icon="👥"
          color="#3b82f6"
        />
        <StatCard
          title="Adhérents Actifs"
          value={stats.activeMembers}
          icon="✅"
          color="#10b981"
        />
        <StatCard
          title="Revenus Totaux"
          value={`${stats.totalPayments.toFixed(2)}€`}
          icon="💰"
          color="#f59e0b"
        />
        <StatCard
          title="Licences en Attente"
          value={stats.pendingLicenses}
          icon="🎫"
          color="#8b5cf6"
        />
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#0f172a' }}>
          Bienvenue sur Club Manager
        </h2>
        <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6' }}>
          Application desktop de gestion de club - 100% locale et sans connexion internet
        </p>
      </div>
    </div>
  );
}

export default DashboardPage;
