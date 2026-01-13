import { useState, useEffect } from 'react';
import { api } from '../services/api';

function CareerModal({ member, onClose }) {
  const [careerData, setCareerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddCompetition, setShowAddCompetition] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [competitions, setCompetitions] = useState([]);

  const [competitionForm, setCompetitionForm] = useState({
    competition_id: '',
    rank_achieved: '',
    weight_category: '',
    medal: '',
    points_earned: 0,
    notes: ''
  });

  const [eventForm, setEventForm] = useState({
    event_type: 'certification',
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    achievement_level: ''
  });

  useEffect(() => {
    loadCareerData();
    loadCompetitions();
  }, [member.id]);

  const loadCareerData = async () => {
    try {
      const data = await api.getMemberCareer(member.id);
      setCareerData(data);
    } catch (error) {
      console.error('Error loading career:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompetitions = async () => {
    try {
      const data = await api.getCompetitions();
      setCompetitions(data);
    } catch (error) {
      console.error('Error loading competitions:', error);
    }
  };

  const handleAddCompetition = async (e) => {
    e.preventDefault();
    try {
      await api.addCompetitionToMember(member.id, competitionForm);
      setShowAddCompetition(false);
      setCompetitionForm({
        competition_id: '',
        rank_achieved: '',
        weight_category: '',
        medal: '',
        points_earned: 0,
        notes: ''
      });
      loadCareerData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await api.addCareerEvent(member.id, eventForm);
      setShowAddEvent(false);
      setEventForm({
        event_type: 'certification',
        title: '',
        description: '',
        event_date: new Date().toISOString().split('T')[0],
        achievement_level: ''
      });
      loadCareerData();
    } catch (error) {
      alert(error.message);
    }
  };

  const getMedalEmoji = (medal) => {
    if (medal === 'gold') return '🥇';
    if (medal === 'silver') return '🥈';
    if (medal === 'bronze') return '🥉';
    return '';
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (loading || !careerData) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
              Carrière de {member.first_name} {member.last_name}
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
              Historique des compétitions et événements
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#64748b',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'overview' ? '#3b82f6' : 'transparent',
                color: activeTab === 'overview' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('competitions')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'competitions' ? '#3b82f6' : 'transparent',
                color: activeTab === 'competitions' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Compétitions
            </button>
            <button
              onClick={() => setActiveTab('events')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'events' ? '#3b82f6' : 'transparent',
                color: activeTab === 'events' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Événements
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Compétitions</div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a' }}>
                    {careerData.stats.total_competitions || 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#fef3c7', padding: '20px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>Médailles d'or</div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#92400e' }}>
                    🥇 {careerData.stats.gold_medals || 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: '14px', color: '#475569', marginBottom: '8px' }}>Médailles d'argent</div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#475569' }}>
                    🥈 {careerData.stats.silver_medals || 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#fef2f2', padding: '20px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '14px', color: '#991b1b', marginBottom: '8px' }}>Médailles de bronze</div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#991b1b' }}>
                    🥉 {careerData.stats.bronze_medals || 0}
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Compétitions récentes</h3>
              {careerData.competitions.slice(0, 5).map((comp) => (
                <div key={comp.id} style={{
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                        {comp.name} {comp.medal && getMedalEmoji(comp.medal)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        {formatDate(comp.competition_date)} • {comp.location}
                      </div>
                      {comp.rank_achieved && (
                        <div style={{ fontSize: '14px', color: '#3b82f6', marginTop: '4px' }}>
                          Classement: {comp.rank_achieved}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {careerData.competitions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  Aucune compétition enregistrée
                </div>
              )}
            </div>
          )}

          {activeTab === 'competitions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Toutes les compétitions</h3>
                <button
                  onClick={() => setShowAddCompetition(true)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  + Ajouter
                </button>
              </div>

              {showAddCompetition && (
                <form onSubmit={handleAddCompetition} style={{
                  backgroundColor: '#f8fafc',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>
                        Compétition
                      </label>
                      <select
                        value={competitionForm.competition_id}
                        onChange={(e) => setCompetitionForm({...competitionForm, competition_id: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px'
                        }}
                      >
                        <option value="">Sélectionner une compétition</option>
                        {competitions.map(comp => (
                          <option key={comp.id} value={comp.id}>
                            {comp.name} - {formatDate(comp.competition_date)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>
                          Classement
                        </label>
                        <input
                          type="number"
                          value={competitionForm.rank_achieved}
                          onChange={(e) => setCompetitionForm({...competitionForm, rank_achieved: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>
                          Médaille
                        </label>
                        <select
                          value={competitionForm.medal}
                          onChange={(e) => setCompetitionForm({...competitionForm, medal: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px'
                          }}
                        >
                          <option value="">Aucune</option>
                          <option value="gold">Or</option>
                          <option value="silver">Argent</option>
                          <option value="bronze">Bronze</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>
                          Points
                        </label>
                        <input
                          type="number"
                          value={competitionForm.points_earned}
                          onChange={(e) => setCompetitionForm({...competitionForm, points_earned: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>
                        Catégorie de poids
                      </label>
                      <input
                        type="text"
                        value={competitionForm.weight_category}
                        onChange={(e) => setCompetitionForm({...competitionForm, weight_category: e.target.value})}
                        placeholder="-60kg"
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>
                        Notes
                      </label>
                      <textarea
                        value={competitionForm.notes}
                        onChange={(e) => setCompetitionForm({...competitionForm, notes: e.target.value})}
                        rows="2"
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setShowAddCompetition(false)}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: 'white',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {careerData.competitions.map((comp) => (
                <div key={comp.id} style={{
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px', fontSize: '16px' }}>
                        {comp.name} {comp.medal && getMedalEmoji(comp.medal)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                        {formatDate(comp.competition_date)} • {comp.location}
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                        {comp.rank_achieved && (
                          <div style={{ color: '#3b82f6' }}>
                            Classement: {comp.rank_achieved}
                          </div>
                        )}
                        {comp.weight_category && (
                          <div style={{ color: '#64748b' }}>
                            Catégorie: {comp.weight_category}
                          </div>
                        )}
                        {comp.points_earned > 0 && (
                          <div style={{ color: '#10b981' }}>
                            Points: {comp.points_earned}
                          </div>
                        )}
                      </div>
                      {comp.notes && (
                        <div style={{ marginTop: '8px', fontSize: '14px', color: '#64748b', fontStyle: 'italic' }}>
                          {comp.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {careerData.competitions.length === 0 && !showAddCompetition && (
                <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  Aucune compétition enregistrée
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Événements de carrière</h3>
                <button
                  onClick={() => setShowAddEvent(true)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  + Ajouter
                </button>
              </div>

              {showAddEvent && (
                <form onSubmit={handleAddEvent} style={{
                  backgroundColor: '#f8fafc',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>
                          Type d'événement
                        </label>
                        <select
                          value={eventForm.event_type}
                          onChange={(e) => setEventForm({...eventForm, event_type: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px'
                          }}
                        >
                          <option value="certification">Certification</option>
                          <option value="belt_promotion">Passage de grade</option>
                          <option value="achievement">Réalisation</option>
                          <option value="award">Récompense</option>
                          <option value="seminar">Séminaire</option>
                          <option value="other">Autre</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>
                          Date
                        </label>
                        <input
                          type="date"
                          value={eventForm.event_date}
                          onChange={(e) => setEventForm({...eventForm, event_date: e.target.value})}
                          required
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>
                        Titre
                      </label>
                      <input
                        type="text"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                        required
                        placeholder="Ex: Passage ceinture noire"
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>
                        Description
                      </label>
                      <textarea
                        value={eventForm.description}
                        onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setShowAddEvent(false)}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: 'white',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {careerData.events.map((event) => (
                <div key={event.id} style={{
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        {event.event_type}
                      </div>
                      <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px', fontSize: '16px' }}>
                        {event.title}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                        {formatDate(event.event_date)}
                      </div>
                      {event.description && (
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                          {event.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {careerData.events.length === 0 && !showAddEvent && (
                <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  Aucun événement enregistré
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CareerModal;
