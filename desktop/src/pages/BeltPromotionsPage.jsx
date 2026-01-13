import { useEffect, useState } from 'react';
import { api } from '../services/api';

function BeltPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [formData, setFormData] = useState({
    member_id: '',
    previous_belt: '',
    new_belt: '',
    promotion_date: new Date().toISOString().split('T')[0],
    examiner: '',
    notes: ''
  });

  useEffect(() => {
    loadPromotions();
    loadMembers();
  }, []);

  const loadPromotions = async () => {
    try {
      const data = await api.getBeltPromotions();
      setPromotions(data);
    } catch (error) {
      console.error('Error loading promotions:', error);
    }
  };

  const loadMembers = async () => {
    try {
      const data = await api.getMembers();
      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'member_id' && value) {
      const selectedMember = members.find(m => m.id === parseInt(value));
      if (selectedMember) {
        setFormData(prev => ({ ...prev, previous_belt: selectedMember.belt_level || '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingPromotion) {
        await api.updateBeltPromotion(editingPromotion.id, formData);
        setEditingPromotion(null);
      } else {
        await api.createBeltPromotion(formData);
      }

      setFormData({
        member_id: '',
        previous_belt: '',
        new_belt: '',
        promotion_date: new Date().toISOString().split('T')[0],
        examiner: '',
        notes: ''
      });
      setShowForm(false);
      loadPromotions();
      loadMembers();
    } catch (error) {
      console.error('Error saving promotion:', error);
      alert('Erreur lors de l\'enregistrement du passage de grade');
    }
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      member_id: promotion.member_id,
      previous_belt: promotion.previous_belt,
      new_belt: promotion.new_belt,
      promotion_date: promotion.promotion_date,
      examiner: promotion.examiner || '',
      notes: promotion.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (promotion) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ce passage de grade ?`)) {
      try {
        await api.deleteBeltPromotion(promotion.id);
        loadPromotions();
      } catch (error) {
        console.error('Error deleting promotion:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingPromotion(null);
    setFormData({
      member_id: '',
      previous_belt: '',
      new_belt: '',
      promotion_date: new Date().toISOString().split('T')[0],
      examiner: '',
      notes: ''
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

  const filteredPromotions = promotions.filter(promotion =>
    `${promotion.first_name} ${promotion.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getBeltLabel(promotion.new_belt).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
            {promotions.length} passage{promotions.length > 1 ? 's' : ''} de grade enregistré{promotions.length > 1 ? 's' : ''}
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
          <span>{showForm ? 'Annuler' : 'Nouveau passage de grade'}</span>
        </button>
      </div>

      {showForm && (
        <div className="card fade-in" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              {editingPromotion ? '✏️ Modifier un passage de grade' : '🥋 Ajouter un passage de grade'}
            </h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label>Adhérent *</label>
                <select name="member_id" value={formData.member_id} onChange={handleChange} required>
                  <option value="">Sélectionner un adhérent</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ceinture actuelle *</label>
                <select name="previous_belt" value={formData.previous_belt} onChange={handleChange} required>
                  <option value="">Sélectionner</option>
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
                <label>Nouvelle ceinture *</label>
                <select name="new_belt" value={formData.new_belt} onChange={handleChange} required>
                  <option value="">Sélectionner</option>
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
                <label>Date du passage *</label>
                <input type="date" name="promotion_date" value={formData.promotion_date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Examinateur</label>
                <input type="text" name="examiner" value={formData.examiner} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                style={{ width: '100%', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-success">
                <span>✓</span>
                <span>{editingPromotion ? 'Mettre à jour' : 'Enregistrer'}</span>
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
            🥋 Passages de grade
          </h2>
          <input
            type="text"
            placeholder="Rechercher..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredPromotions.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Adhérent</th>
                  <th>Ceinture précédente</th>
                  <th style={{ textAlign: 'center' }}>→</th>
                  <th>Nouvelle ceinture</th>
                  <th>Date</th>
                  <th>Examinateur</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromotions.map(promotion => (
                  <tr key={promotion.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>
                        {promotion.first_name} {promotion.last_name}
                      </div>
                    </td>
                    <td>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: getBeltColor(promotion.previous_belt),
                        color: getBeltTextColor(promotion.previous_belt),
                        fontWeight: '600',
                        fontSize: '13px',
                        border: '2px solid',
                        borderColor: promotion.previous_belt === 'white' ? '#e2e8f0' : 'transparent'
                      }}>
                        {getBeltLabel(promotion.previous_belt)}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '20px', color: '#3b82f6' }}>→</td>
                    <td>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: getBeltColor(promotion.new_belt),
                        color: getBeltTextColor(promotion.new_belt),
                        fontWeight: '600',
                        fontSize: '13px',
                        border: '2px solid',
                        borderColor: promotion.new_belt === 'white' ? '#e2e8f0' : 'transparent'
                      }}>
                        {getBeltLabel(promotion.new_belt)}
                      </div>
                    </td>
                    <td>
                      {new Date(promotion.promotion_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td>{promotion.examiner || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(promotion)}
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
                          onClick={() => handleDelete(promotion)}
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
            <div className="empty-state-icon">🥋</div>
            <div className="empty-state-title">
              {searchTerm ? 'Aucun résultat' : 'Aucun passage de grade'}
            </div>
            <div className="empty-state-description">
              {searchTerm
                ? 'Aucun passage de grade ne correspond à votre recherche'
                : 'Commencez par ajouter votre premier passage de grade'}
            </div>
            {!searchTerm && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <span>+</span>
                <span>Ajouter un passage de grade</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BeltPromotionsPage;
