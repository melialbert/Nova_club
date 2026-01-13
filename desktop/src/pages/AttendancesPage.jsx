import { useState, useEffect } from 'react';
import { api } from '../services/api';

function AttendancesPage() {
  const [attendances, setAttendances] = useState([]);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    member_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [attendancesData, membersData] = await Promise.all([
        api.getAttendances(),
        api.getMembers()
      ]);
      setAttendances(attendancesData);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createAttendance(formData);
      setShowForm(false);
      setFormData({
        member_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present'
      });
      loadData();
    } catch (error) {
      alert('Erreur lors de la création');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
          Présences ({attendances.length})
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Annuler' : '+ Nouvelle présence'}
        </button>
      </div>

      {showForm && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '16px' }}>
              <select
                value={formData.member_id}
                onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                required
                style={{
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              >
                <option value="">Sélectionner un adhérent</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.first_name} {m.last_name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                style={{
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              >
                <option value="present">Présent</option>
                <option value="absent">Absent</option>
                <option value="excused">Excusé</option>
              </select>
            </div>
            <button
              type="submit"
              style={{
                marginTop: '16px',
                padding: '12px 24px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Enregistrer
            </button>
          </form>
        </div>
      )}

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Adhérent</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Date</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map((attendance) => (
              <tr key={attendance.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  {attendance.first_name} {attendance.last_name}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                  {new Date(attendance.date).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: attendance.status === 'present' ? '#d1fae5' : '#fee2e2',
                    color: attendance.status === 'present' ? '#059669' : '#dc2626'
                  }}>
                    {attendance.status === 'present' ? 'Présent' : attendance.status === 'absent' ? 'Absent' : 'Excusé'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {attendances.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            Aucune présence enregistrée
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendancesPage;
