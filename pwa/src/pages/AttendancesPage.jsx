import { useEffect, useState } from 'react';
import { getAllFromStore, addToStore } from '../db';
import { queueChange } from '../services/syncService';
import { useMemberStore } from '../utils/store';
import Layout from '../components/Layout';

function AttendancesPage() {
  const { members, setMembers } = useMemberStore();
  const [attendances, setAttendances] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    const membersData = await getAllFromStore('members');
    const attendancesData = await getAllFromStore('attendances');
    setMembers(membersData);
    setAttendances(attendancesData.filter(a => a.date === selectedDate));
    setLoading(false);
  };

  const handleToggleAttendance = async (member) => {
    const existingAttendance = attendances.find(
      a => a.member_id === member.id && a.date === selectedDate
    );

    if (existingAttendance) {
      const updatedAttendances = attendances.filter(a => a.id !== existingAttendance.id);
      setAttendances(updatedAttendances);
    } else {
      const newAttendance = {
        id: crypto.randomUUID(),
        member_id: member.id,
        date: selectedDate,
        present: true,
        club_id: 'current_club_id',
        created_at: new Date().toISOString()
      };

      await addToStore('attendances', newAttendance);
      await queueChange('attendances', newAttendance.id, newAttendance);
      setAttendances([...attendances, newAttendance]);
    }
  };

  const isPresent = (memberId) => {
    return attendances.some(a => a.member_id === memberId);
  };

  const filteredMembers = members.filter(member =>
    member.status === 'active' &&
    (`${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const presentCount = attendances.length;
  const absentCount = filteredMembers.length - presentCount;
  const attendanceRate = filteredMembers.length > 0
    ? Math.round((presentCount / filteredMembers.length) * 100)
    : 0;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="fade-in">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              {formatDate(selectedDate)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            />
          </div>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981'
              }}
            >
              ✅
            </div>
            <div className="stat-value">{presentCount}</div>
            <div className="stat-label">Présents</div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444'
              }}
            >
              ❌
            </div>
            <div className="stat-value">{absentCount}</div>
            <div className="stat-label">Absents</div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6'
              }}
            >
              📊
            </div>
            <div className="stat-value">{attendanceRate}%</div>
            <div className="stat-label">Taux de présence</div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                color: '#f59e0b'
              }}
            >
              👥
            </div>
            <div className="stat-value">{filteredMembers.length}</div>
            <div className="stat-label">Total adhérents actifs</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              📋 Feuille de présence
            </h2>
            <input
              type="text"
              placeholder="Rechercher un adhérent..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Chargement...
            </div>
          ) : filteredMembers.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
              padding: '8px'
            }}>
              {filteredMembers.map(member => {
                const present = isPresent(member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() => handleToggleAttendance(member)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: `2px solid ${present ? '#10b981' : '#e2e8f0'}`,
                      backgroundColor: present ? '#f0fdf4' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: present
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '16px',
                      flexShrink: 0
                    }}>
                      {present ? '✓' : member.first_name[0] + member.last_name[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#0f172a',
                        fontSize: '15px',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {member.first_name} {member.last_name}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className="badge badge-blue" style={{ fontSize: '11px' }}>
                          {member.category}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {member.discipline}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${present ? '#10b981' : '#cbd5e1'}`,
                      backgroundColor: present ? '#10b981' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {present && (
                        <span style={{ color: 'white', fontSize: '12px', fontWeight: '700' }}>✓</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-title">
                {searchTerm ? 'Aucun résultat' : 'Aucun adhérent actif'}
              </div>
              <div className="empty-state-description">
                {searchTerm
                  ? 'Aucun adhérent ne correspond à votre recherche'
                  : 'Commencez par ajouter des adhérents actifs'}
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-header">
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              💡 Conseils
            </h2>
          </div>
          <div style={{ padding: '8px' }}>
            <ul style={{ margin: 0, paddingLeft: '24px', color: '#64748b', lineHeight: '1.8' }}>
              <li>Cliquez sur une carte pour marquer la présence ou l'absence d'un adhérent</li>
              <li>Les cartes vertes indiquent les présents, les blanches les absents</li>
              <li>Changez la date en haut pour voir ou modifier les présences d'un autre jour</li>
              <li>Les modifications sont automatiquement sauvegardées et synchronisées</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AttendancesPage;
