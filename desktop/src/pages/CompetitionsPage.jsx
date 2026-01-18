import { useState, useEffect } from 'react';
import { api } from '../services/api';

function CompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    competition_type: 'regional',
    location: '',
    competition_date: new Date().toISOString().split('T')[0],
    description: '',
    level: 'minime'
  });

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      setLoading(true);
      const data = await api.getCompetitions();
      setCompetitions(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.updateCompetition(editingId, formData);
      } else {
        await api.createCompetition(formData);
      }

      resetForm();
      loadCompetitions();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (competition) => {
    setEditingId(competition.id);
    setFormData({
      name: competition.name,
      competition_type: competition.competition_type || 'regional',
      location: competition.location || '',
      competition_date: competition.competition_date || new Date().toISOString().split('T')[0],
      description: competition.description || '',
      level: competition.level || 'minime'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette compétition ?')) return;

    try {
      await api.deleteCompetition(id);
      loadCompetitions();
    } catch (error) {
      alert(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      competition_type: 'regional',
      location: '',
      competition_date: new Date().toISOString().split('T')[0],
      description: '',
      level: 'minime'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredCompetitions = competitions.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (comp.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || comp.competition_type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeLabel = (type) => {
    const labels = {
      'regional': 'Régionale',
      'national': 'Nationale',
      'international': 'Internationale',
      'club': 'Interne au club'
    };
    return labels[type] || type;
  };

  const getLevelLabel = (level) => {
    const labels = {
      'minime': 'Minime',
      'cadet': 'Cadet',
      'junior': 'Junior',
      'senior': 'Senior'
    };
    return labels[level] || level;
  };

  const getTypeColor = (type) => {
    const colors = {
      'regional': '#3b82f6',
      'national': '#10b981',
      'international': '#f59e0b',
      'club': '#6366f1'
    };
    return colors[type] || '#64748b';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '18px', color: '#64748b' }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
          Compétitions
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px' }}>
          Gérez les compétitions du club
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flex: 1 }}>
          <input
            type="text"
            placeholder="Rechercher une compétition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '12px 16px',
              fontSize: '15px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              flex: '1',
              minWidth: '250px'
            }}
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '12px 16px',
              fontSize: '15px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="all">Tous les types</option>
            <option value="regional">Régionale</option>
            <option value="national">Nationale</option>
            <option value="international">Internationale</option>
            <option value="club">Interne au club</option>
          </select>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          + Nouvelle compétition
        </button>
      </div>

      {showForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
            {editingId ? 'Modifier la compétition' : 'Nouvelle compétition'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                    Nom de la compétition *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="Ex: Championnat Régional Judo 2024"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.competition_date}
                    onChange={(e) => setFormData({...formData, competition_date: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                    Type
                  </label>
                  <select
                    value={formData.competition_type}
                    onChange={(e) => setFormData({...formData, competition_type: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="regional">Régionale</option>
                    <option value="national">Nationale</option>
                    <option value="international">Internationale</option>
                    <option value="club">Interne au club</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                    Niveau
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="minime">Minime</option>
                    <option value="cadet">Cadet</option>
                    <option value="junior">Junior</option>
                    <option value="senior">Senior</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                    Lieu
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Ville ou pays"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  placeholder="Informations complémentaires..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '15px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'white',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {editingId ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {filteredCompetitions.map((competition) => (
          <div
            key={competition.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <div style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  backgroundColor: getTypeColor(competition.competition_type) + '15',
                  color: getTypeColor(competition.competition_type),
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  marginBottom: '12px'
                }}>
                  {getTypeLabel(competition.competition_type)}
                </div>
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                {competition.participant_count || 0} participant{(competition.participant_count || 0) > 1 ? 's' : ''}
              </div>
            </div>

            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '8px',
              lineHeight: '1.4'
            }}>
              {competition.name}
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600' }}>Date:</span> {new Date(competition.competition_date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              {competition.location && (
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600' }}>Lieu:</span> {competition.location}
                </div>
              )}
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                <span style={{ fontWeight: '600' }}>Niveau:</span> {getLevelLabel(competition.level)}
              </div>
            </div>

            {competition.description && (
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                marginBottom: '16px',
                lineHeight: '1.6',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {competition.description}
              </p>
            )}

            <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <button
                onClick={() => handleEdit(competition)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f1f5f9'}
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(competition.id)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#fef2f2'}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCompetitions.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '64px 32px',
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '2px dashed #e2e8f0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            Aucune compétition trouvée
          </h3>
          <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '24px' }}>
            {searchTerm || filterType !== 'all'
              ? 'Essayez de modifier vos filtres de recherche'
              : 'Commencez par créer votre première compétition'}
          </p>
          {!searchTerm && filterType === 'all' && (
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Créer une compétition
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CompetitionsPage;
