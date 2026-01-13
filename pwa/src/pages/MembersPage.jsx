import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllFromStore, addToStore, updateInStore, deleteFromStore } from '../db';
import { queueChange } from '../services/syncService';
import { useMemberStore } from '../utils/store';
import Layout from '../components/Layout';

function MembersPage() {
  const { members, setMembers, addMember, updateMember, removeMember } = useMemberStore();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'male',
    phone: '',
    email: '',
    category: 'benjamin',
    discipline: 'judo',
    belt_level: 'white',
    status: 'active',
    monthly_fee: '',
    registration_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    const data = await getAllFromStore('members');
    setMembers(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingMember) {
      const updatedMember = {
        ...editingMember,
        ...formData,
        updated_at: new Date().toISOString()
      };

      await updateInStore('members', updatedMember);
      await queueChange('members', updatedMember.id, updatedMember);
      updateMember(updatedMember);
      setEditingMember(null);
    } else {
      const newMember = {
        id: crypto.randomUUID(),
        ...formData,
        club_id: 'current_club_id',
        created_at: new Date().toISOString()
      };

      await addToStore('members', newMember);
      await queueChange('members', newMember.id, newMember);
      addMember(newMember);
    }

    setFormData({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: 'male',
      phone: '',
      email: '',
      category: 'benjamin',
      discipline: 'judo',
      belt_level: 'white',
      status: 'active',
      monthly_fee: '',
      registration_date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      date_of_birth: member.date_of_birth,
      gender: member.gender,
      phone: member.phone || '',
      email: member.email || '',
      category: member.category,
      discipline: member.discipline,
      belt_level: member.belt_level,
      status: member.status,
      monthly_fee: member.monthly_fee,
      registration_date: member.registration_date
    });
    setShowForm(true);
  };

  const handleDelete = async (member) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${member.first_name} ${member.last_name} ?`)) {
      await deleteFromStore('members', member.id);
      await queueChange('members', member.id, null);
      removeMember(member.id);
    }
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setFormData({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: 'male',
      phone: '',
      email: '',
      category: 'benjamin',
      discipline: 'judo',
      belt_level: 'white',
      status: 'active',
      monthly_fee: '',
      registration_date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  const getBeltLabel = (beltCode) => {
    const belts = {
      'white': 'Blanche',
      'white_yellow': 'Blanche-jaune',
      'yellow': 'Jaune',
      'yellow_orange': 'Jaune-orange',
      'orange': 'Orange',
      'orange_green': 'Orange-verte',
      'green': 'Verte',
      'blue': 'Bleue',
      'brown': 'Marron',
      'black': 'Noire',
      'black_1dan': 'Noire 1er dan',
      'black_2dan': 'Noire 2ème dan',
      'black_3dan': 'Noire 3ème dan',
      'black_4dan': 'Noire 4ème dan',
      'black_5dan': 'Noire 5ème dan'
    };
    return belts[beltCode] || beltCode;
  };

  const getBeltColor = (beltCode) => {
    const colors = {
      'white': '#ffffff',
      'white_yellow': 'linear-gradient(90deg, #ffffff 50%, #fbbf24 50%)',
      'yellow': '#fbbf24',
      'yellow_orange': 'linear-gradient(90deg, #fbbf24 50%, #f97316 50%)',
      'orange': '#f97316',
      'orange_green': 'linear-gradient(90deg, #f97316 50%, #22c55e 50%)',
      'green': '#22c55e',
      'blue': '#3b82f6',
      'brown': '#92400e',
      'black': '#0f172a',
      'black_1dan': '#0f172a',
      'black_2dan': '#0f172a',
      'black_3dan': '#0f172a',
      'black_4dan': '#0f172a',
      'black_5dan': '#0f172a'
    };
    return colors[beltCode] || '#cbd5e1';
  };

  const getBeltTextColor = (beltCode) => {
    const lightBelts = ['white', 'white_yellow', 'yellow', 'yellow_orange', 'orange', 'orange_green'];
    return lightBelts.includes(beltCode) ? '#0f172a' : '#ffffff';
  };

  const filteredMembers = members.filter(member =>
    `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.discipline.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {members.length} membre{members.length > 1 ? 's' : ''} enregistré{members.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (showForm) {
                handleCancelEdit();
              } else {
                setShowForm(true);
              }
            }}
          >
            <span>{showForm ? '✕' : '+'}</span>
            <span>{showForm ? 'Annuler' : 'Nouvel adhérent'}</span>
          </button>
        </div>

        {showForm && (
          <div className="card fade-in" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                {editingMember ? '✏️ Modifier un adhérent' : '👤 Ajouter un adhérent'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div className="form-group">
                  <label>Prénom *</label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Date de naissance *</label>
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Sexe</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="male">Masculin</option>
                    <option value="female">Féminin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Catégorie</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    <option value="mini_poussin">Mini-poussin</option>
                    <option value="poussin">Poussin</option>
                    <option value="benjamin">Benjamin</option>
                    <option value="minime">Minime</option>
                    <option value="cadet">Cadet</option>
                    <option value="junior">Junior</option>
                    <option value="senior">Senior</option>
                    <option value="veteran">Vétéran</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discipline</label>
                  <select name="discipline" value={formData.discipline} onChange={handleChange}>
                    <option value="judo">Judo</option>
                    <option value="ju_jitsu">Ju-jitsu</option>
                    <option value="taiso">Taïso</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ceinture</label>
                  <select name="belt_level" value={formData.belt_level} onChange={handleChange}>
                    <option value="white">Blanche</option>
                    <option value="white_yellow">Blanche-jaune</option>
                    <option value="yellow">Jaune</option>
                    <option value="yellow_orange">Jaune-orange</option>
                    <option value="orange">Orange</option>
                    <option value="orange_green">Orange-verte</option>
                    <option value="green">Verte</option>
                    <option value="blue">Bleue</option>
                    <option value="brown">Marron</option>
                    <option value="black">Noire</option>
                    <option value="black_1dan">Noire 1er dan</option>
                    <option value="black_2dan">Noire 2ème dan</option>
                    <option value="black_3dan">Noire 3ème dan</option>
                    <option value="black_4dan">Noire 4ème dan</option>
                    <option value="black_5dan">Noire 5ème dan</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cotisation mensuelle (FCFA) *</label>
                  <input type="number" name="monthly_fee" value={formData.monthly_fee} onChange={handleChange} required />
                </div>
              </div>
              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-success">
                  <span>✓</span>
                  <span>{editingMember ? 'Mettre à jour' : 'Enregistrer'}</span>
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              👥 Liste des adhérents
            </h2>
            <input
              type="text"
              placeholder="Rechercher un adhérent..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredMembers.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nom complet</th>
                    <th>Catégorie</th>
                    <th>Discipline</th>
                    <th>Ceinture</th>
                    <th>Statut</th>
                    <th>Cotisation</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(member => (
                    <tr key={member.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '14px'
                          }}>
                            {member.first_name[0]}{member.last_name[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>
                              {member.first_name} {member.last_name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              {member.phone || member.email || 'Pas de contact'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-blue">
                          {member.category}
                        </span>
                      </td>
                      <td>{member.discipline}</td>
                      <td>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: getBeltColor(member.belt_level),
                          color: getBeltTextColor(member.belt_level),
                          fontWeight: '600',
                          fontSize: '13px',
                          border: '2px solid',
                          borderColor: member.belt_level === 'white' ? '#e2e8f0' : 'transparent'
                        }}>
                          {getBeltLabel(member.belt_level)}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${member.status}`}>
                          {member.status === 'active' ? 'Actif' : member.status === 'pending' ? 'En attente' : 'Suspendu'}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600', color: '#10b981' }}>
                        {parseFloat(member.monthly_fee || 0).toLocaleString()} FCFA
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link
                            to="/licenses"
                            state={{ memberId: member.id }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: 'white',
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'all 0.2s',
                              textDecoration: 'none',
                              display: 'inline-block'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#f0fdf4';
                              e.target.style.borderColor = '#10b981';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'white';
                              e.target.style.borderColor = '#e2e8f0';
                            }}
                            title="Créer une licence"
                          >
                            🎫
                          </Link>
                          <button
                            onClick={() => handleEdit(member)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: 'white',
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#f8fafc';
                              e.target.style.borderColor = '#3b82f6';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'white';
                              e.target.style.borderColor = '#e2e8f0';
                            }}
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(member)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: 'white',
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#fef2f2';
                              e.target.style.borderColor = '#ef4444';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'white';
                              e.target.style.borderColor = '#e2e8f0';
                            }}
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-title">
                {searchTerm ? 'Aucun résultat' : 'Aucun adhérent'}
              </div>
              <div className="empty-state-description">
                {searchTerm
                  ? 'Aucun adhérent ne correspond à votre recherche'
                  : 'Commencez par ajouter votre premier adhérent'}
              </div>
              {!searchTerm && (
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  <span>+</span>
                  <span>Ajouter un adhérent</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default MembersPage;
