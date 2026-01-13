import { useEffect, useState } from 'react';
import { getAllFromStore, addToStore } from '../db';
import { queueChange } from '../services/syncService';
import { useMemberStore } from '../utils/store';
import Layout from '../components/Layout';

function MembersPage() {
  const { members, setMembers, addMember } = useMemberStore();
  const [showForm, setShowForm] = useState(false);
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

    const newMember = {
      id: crypto.randomUUID(),
      ...formData,
      club_id: 'current_club_id',
      created_at: new Date().toISOString()
    };

    await addToStore('members', newMember);
    await queueChange('members', newMember.id, newMember);
    addMember(newMember);

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

  return (
    <Layout>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1>Adhérents</h1>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : 'Nouvel adhérent'}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2 style={{ marginBottom: '20px' }}>Ajouter un adhérent</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Prénom</label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Date de naissance</label>
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
                  <input type="text" name="belt_level" value={formData.belt_level} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Cotisation mensuelle (FCFA)</label>
                  <input type="number" name="monthly_fee" value={formData.monthly_fee} onChange={handleChange} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Enregistrer</button>
            </form>
          </div>
        )}

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Nom complet</th>
                <th>Catégorie</th>
                <th>Discipline</th>
                <th>Ceinture</th>
                <th>Statut</th>
                <th>Cotisation</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id}>
                  <td>{member.first_name} {member.last_name}</td>
                  <td>{member.category}</td>
                  <td>{member.discipline}</td>
                  <td>{member.belt_level}</td>
                  <td>
                    <span className={`status-badge status-${member.status}`}>
                      {member.status}
                    </span>
                  </td>
                  <td>{member.monthly_fee} FCFA</td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              Aucun adhérent enregistré
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default MembersPage;
