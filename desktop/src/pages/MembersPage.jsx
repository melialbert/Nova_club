import { useState, useEffect } from 'react';
import { api } from '../services/api';

function MembersPage() {
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    belt_level: '',
    date_of_birth: ''
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const data = await api.getMembers();
      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createMember(formData);
      setShowForm(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        belt_level: '',
        date_of_birth: ''
      });
      loadMembers();
    } catch (error) {
      alert('Erreur lors de la création du membre');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer ce membre ?')) {
      try {
        await api.deleteMember(id);
        loadMembers();
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
            Liste des adhérents
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {members.length} adhérent(s) total
          </p>
        </div>
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
          {showForm ? 'Annuler' : '+ Nouvel adhérent'}
        </button>
      </div>

      {showForm && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Nouvel adhérent</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <input
                type="text"
                placeholder="Prénom"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                style={{
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <input
                type="text"
                placeholder="Nom"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                style={{
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <input
                type="date"
                placeholder="Date de naissance"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                style={{
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <select
                value={formData.belt_level}
                onChange={(e) => setFormData({ ...formData, belt_level: e.target.value })}
                style={{
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="">Ceinture</option>
                <option value="Blanche">Blanche</option>
                <option value="Jaune">Jaune</option>
                <option value="Orange">Orange</option>
                <option value="Verte">Verte</option>
                <option value="Bleue">Bleue</option>
                <option value="Marron">Marron</option>
                <option value="Noire">Noire</option>
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
                fontSize: '14px',
                fontWeight: '600',
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
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Nom</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Email</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Téléphone</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Ceinture</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  {member.first_name} {member.last_name}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                  {member.email || '-'}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                  {member.phone || '-'}
                </td>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  {member.belt_level || '-'}
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleDelete(member.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            Aucun adhérent trouvé
          </div>
        )}
      </div>
    </div>
  );
}

export default MembersPage;
