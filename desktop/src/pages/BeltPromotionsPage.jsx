import { useEffect, useState } from 'react';
import { api } from '../services/api';

function BeltPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [sessionData, setSessionData] = useState({
    promotion_date: new Date().toISOString().split('T')[0],
    examiner: '',
    notes: ''
  });

  const [activeTab, setActiveTab] = useState('pending');

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

  const handleSessionDataChange = (e) => {
    const { name, value } = e.target;
    setSessionData({ ...sessionData, [name]: value });
  };

  const handleMemberSelect = (memberId) => {
    const member = members.find(m => m.id === parseInt(memberId));
    if (!member) return;

    const isAlreadySelected = selectedMembers.some(m => m.member_id === member.id);

    if (isAlreadySelected) {
      setSelectedMembers(selectedMembers.filter(m => m.member_id !== member.id));
    } else {
      const nextBelt = getNextBelt(member.belt_level || 'white');
      setSelectedMembers([...selectedMembers, {
        member_id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        previous_belt: member.belt_level || 'white',
        new_belt: nextBelt
      }]);
    }
  };

  const handleNewBeltChange = (memberId, newBelt) => {
    setSelectedMembers(selectedMembers.map(m =>
      m.member_id === memberId ? { ...m, new_belt: newBelt } : m
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedMembers.length === 0) {
      alert('Veuillez sélectionner au moins un adhérent');
      return;
    }

    try {
      await api.createBulkBeltPromotions({
        members: selectedMembers,
        promotion_date: sessionData.promotion_date,
        examiner: sessionData.examiner,
        notes: sessionData.notes
      });

      setSelectedMembers([]);
      setSessionData({
        promotion_date: new Date().toISOString().split('T')[0],
        examiner: '',
        notes: ''
      });
      setShowForm(false);
      loadPromotions();
      loadMembers();
    } catch (error) {
      console.error('Error creating promotions:', error);
      alert('Erreur lors de la création des passages de grade');
    }
  };

  const handleStatusChange = async (promotionId, status) => {
    try {
      await api.updateBeltPromotionStatus(promotionId, status);
      loadPromotions();
      loadMembers();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
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

  const getNextBelt = (currentBelt) => {
    const beltOrder = [
      'white', 'white_yellow', 'yellow', 'yellow_orange', 'orange',
      'orange_green', 'green', 'blue', 'brown', 'black',
      'black_1dan', 'black_2dan', 'black_3dan', 'black_4dan', 'black_5dan'
    ];
    const currentIndex = beltOrder.indexOf(currentBelt);
    return currentIndex >= 0 && currentIndex < beltOrder.length - 1
      ? beltOrder[currentIndex + 1]
      : currentBelt;
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

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'En attente',
      'passed': 'Réussi',
      'failed': 'Échoué'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'passed': '#10b981',
      'failed': '#ef4444'
    };
    return colors[status] || '#94a3b8';
  };

  const pendingPromotions = promotions.filter(p => p.status === 'pending');
  const completedPromotions = promotions.filter(p => p.status !== 'pending');

  const filteredMembers = members.filter(member =>
    `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrintPromotionSheet = async () => {
    const promotionsByBelt = {};

    pendingPromotions.forEach(promotion => {
      const beltKey = promotion.new_belt;
      if (!promotionsByBelt[beltKey]) {
        promotionsByBelt[beltKey] = [];
      }
      promotionsByBelt[beltKey].push(promotion);
    });

    const beltOrder = [
      'white', 'white_yellow', 'yellow', 'yellow_orange', 'orange',
      'orange_green', 'green', 'blue', 'brown', 'black',
      'black_1dan', 'black_2dan', 'black_3dan', 'black_4dan', 'black_5dan'
    ];

    const sortedBelts = Object.keys(promotionsByBelt).sort((a, b) => {
      return beltOrder.indexOf(a) - beltOrder.indexOf(b);
    });

    let clubInfo = null;
    try {
      clubInfo = await api.getClubInfo();
    } catch (error) {
      console.error('Error loading club info:', error);
    }

    const printWindow = window.open('', '', 'width=800,height=600');

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fiche de Passage de Grade</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            line-height: 1.6;
          }

          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #0f172a;
          }

          .club-name {
            font-size: 28px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 8px;
          }

          .club-info {
            font-size: 14px;
            color: #64748b;
          }

          .main-title {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            text-align: center;
            margin: 30px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .session-info {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }

          .session-info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }

          .session-info-label {
            font-weight: 600;
            color: #0f172a;
          }

          .session-info-value {
            color: #64748b;
          }

          .belt-section {
            margin-bottom: 40px;
            page-break-inside: avoid;
          }

          .belt-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 2px solid #e2e8f0;
          }

          .belt-badge {
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
            border: 2px solid #e2e8f0;
          }

          .belt-count {
            font-size: 14px;
            color: #64748b;
            font-weight: 600;
          }

          .candidates-table {
            width: 100%;
            border-collapse: collapse;
          }

          .candidates-table th {
            background-color: #f8fafc;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #0f172a;
            border: 1px solid #e2e8f0;
            font-size: 14px;
          }

          .candidates-table td {
            padding: 12px;
            border: 1px solid #e2e8f0;
            color: #0f172a;
            font-size: 14px;
          }

          .candidates-table tr:hover {
            background-color: #f8fafc;
          }

          .previous-belt-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            border: 1px solid #e2e8f0;
          }

          .result-checkbox {
            width: 20px;
            height: 20px;
            border: 2px solid #cbd5e1;
            display: inline-block;
            margin: 0 8px;
            vertical-align: middle;
          }

          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }

          @media print {
            body {
              padding: 20px;
            }

            .belt-section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${clubInfo ? `
            <div class="club-name">${clubInfo.name || 'Club de Judo'}</div>
            <div class="club-info">
              ${clubInfo.address || ''} ${clubInfo.address && clubInfo.city ? '•' : ''} ${clubInfo.city || ''}
              ${clubInfo.phone ? `• ${clubInfo.phone}` : ''}
            </div>
          ` : '<div class="club-name">Club de Judo</div>'}
        </div>

        <h1 class="main-title">🥋 Fiche de Passage de Grade</h1>

        <div class="session-info">
          <div class="session-info-row">
            <span class="session-info-label">Date:</span>
            <span class="session-info-value">${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div class="session-info-row">
            <span class="session-info-label">Nombre total de candidats:</span>
            <span class="session-info-value">${pendingPromotions.length}</span>
          </div>
          <div class="session-info-row">
            <span class="session-info-label">Examinateur:</span>
            <span class="session-info-value">_______________________________</span>
          </div>
        </div>

        ${sortedBelts.map(beltKey => {
          const candidates = promotionsByBelt[beltKey];
          const beltColor = getBeltColor(beltKey);
          const beltTextColor = getBeltTextColor(beltKey);

          return `
            <div class="belt-section">
              <div class="belt-header">
                <div class="belt-badge" style="background: ${beltColor}; color: ${beltTextColor}; ${beltKey === 'white' ? 'border-color: #94a3b8;' : ''}">
                  ${getBeltLabel(beltKey)}
                </div>
                <span class="belt-count">${candidates.length} candidat${candidates.length > 1 ? 's' : ''}</span>
              </div>

              <table class="candidates-table">
                <thead>
                  <tr>
                    <th style="width: 5%;">N°</th>
                    <th style="width: 30%;">Nom et Prénom</th>
                    <th style="width: 20%;">Ceinture actuelle</th>
                    <th style="width: 15%;">Date d'examen</th>
                    <th style="width: 15%; text-align: center;">Réussi</th>
                    <th style="width: 15%; text-align: center;">Échoué</th>
                  </tr>
                </thead>
                <tbody>
                  ${candidates.map((candidate, index) => {
                    const prevBeltColor = getBeltColor(candidate.previous_belt);
                    const prevBeltTextColor = getBeltTextColor(candidate.previous_belt);

                    return `
                      <tr>
                        <td style="text-align: center; font-weight: 600;">${index + 1}</td>
                        <td style="font-weight: 600;">${candidate.first_name} ${candidate.last_name}</td>
                        <td>
                          <span class="previous-belt-badge" style="background: ${prevBeltColor}; color: ${prevBeltTextColor};">
                            ${getBeltLabel(candidate.previous_belt)}
                          </span>
                        </td>
                        <td>${new Date(candidate.promotion_date).toLocaleDateString('fr-FR')}</td>
                        <td style="text-align: center;">
                          <span class="result-checkbox"></span>
                        </td>
                        <td style="text-align: center;">
                          <span class="result-checkbox"></span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `;
        }).join('')}

        <div class="footer">
          Document généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

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
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
            🥋 Passages de grade
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            {pendingPromotions.length} en attente • {completedPromotions.length} terminé{completedPromotions.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <span>{showForm ? '✕' : '+'}</span>
          <span>{showForm ? 'Annuler' : 'Nouvelle session'}</span>
        </button>
      </div>

      {showForm && (
        <div className="card fade-in" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              🎯 Nouvelle session de passage de grade
            </h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                Informations de la session
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div className="form-group">
                  <label>Date du passage *</label>
                  <input type="date" name="promotion_date" value={sessionData.promotion_date} onChange={handleSessionDataChange} required />
                </div>
                <div className="form-group">
                  <label>Examinateur</label>
                  <input type="text" name="examiner" value={sessionData.examiner} onChange={handleSessionDataChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={sessionData.notes}
                  onChange={handleSessionDataChange}
                  rows="2"
                  style={{ width: '100%', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                Sélectionner les adhérents ({selectedMembers.length} sélectionné{selectedMembers.length > 1 ? 's' : ''})
              </h3>
              <input
                type="text"
                placeholder="Rechercher un adhérent..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: '16px' }}
              />

              <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: '#f8fafc'
              }}>
                {filteredMembers.map(member => {
                  const isSelected = selectedMembers.some(m => m.member_id === member.id);
                  return (
                    <div
                      key={member.id}
                      onClick={() => handleMemberSelect(member.id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#dbeafe' : 'white',
                        transition: 'all 0.2s',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>
                          {member.first_name} {member.last_name}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          Ceinture actuelle: {getBeltLabel(member.belt_level || 'white')}
                        </div>
                      </div>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        border: '2px solid',
                        borderColor: isSelected ? '#3b82f6' : '#cbd5e1',
                        backgroundColor: isSelected ? '#3b82f6' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '700'
                      }}>
                        {isSelected && '✓'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedMembers.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                  Ceintures cibles
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedMembers.map(member => (
                    <div key={member.member_id} style={{
                      padding: '16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                          {member.first_name} {member.last_name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            display: 'inline-flex',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: getBeltColor(member.previous_belt),
                            color: getBeltTextColor(member.previous_belt),
                            fontSize: '12px',
                            fontWeight: '600',
                            border: '2px solid',
                            borderColor: member.previous_belt === 'white' ? '#e2e8f0' : 'transparent'
                          }}>
                            {getBeltLabel(member.previous_belt)}
                          </div>
                          <span style={{ color: '#3b82f6', fontSize: '18px' }}>→</span>
                          <select
                            value={member.new_belt}
                            onChange={(e) => handleNewBeltChange(member.member_id, e.target.value)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
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
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedMembers(selectedMembers.filter(m => m.member_id !== member.member_id))}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          color: '#ef4444',
                          fontSize: '16px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-success" disabled={selectedMembers.length === 0}>
                <span>✓</span>
                <span>Créer la session ({selectedMembers.length} adhérent{selectedMembers.length > 1 ? 's' : ''})</span>
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => {
                setShowForm(false);
                setSelectedMembers([]);
                setSearchTerm('');
              }}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '3px solid #3b82f6' : '3px solid transparent',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontWeight: '600',
            color: activeTab === 'pending' ? '#3b82f6' : '#64748b',
            fontSize: '15px',
            transition: 'all 0.2s'
          }}
        >
          En attente ({pendingPromotions.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderBottom: activeTab === 'history' ? '3px solid #3b82f6' : '3px solid transparent',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontWeight: '600',
            color: activeTab === 'history' ? '#3b82f6' : '#64748b',
            fontSize: '15px',
            transition: 'all 0.2s'
          }}
        >
          Historique ({completedPromotions.length})
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="card fade-in">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              ⏳ Passages de grade en attente
            </h2>
            {pendingPromotions.length > 0 && (
              <button
                onClick={handlePrintPromotionSheet}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>🖨️</span>
                <span>Imprimer la fiche</span>
              </button>
            )}
          </div>

          {pendingPromotions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingPromotions.map(promotion => (
                <div
                  key={promotion.id}
                  style={{
                    padding: '20px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    backgroundColor: '#fef9f5',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                        {promotion.first_name} {promotion.last_name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        {new Date(promotion.promotion_date).toLocaleDateString('fr-FR')}
                        {promotion.examiner && ` • Examinateur: ${promotion.examiner}`}
                      </div>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      {getStatusLabel(promotion.status)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{
                      display: 'inline-flex',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: getBeltColor(promotion.previous_belt),
                      color: getBeltTextColor(promotion.previous_belt),
                      fontSize: '14px',
                      fontWeight: '600',
                      border: '2px solid',
                      borderColor: promotion.previous_belt === 'white' ? '#e2e8f0' : 'transparent'
                    }}>
                      {getBeltLabel(promotion.previous_belt)}
                    </div>
                    <span style={{ color: '#3b82f6', fontSize: '24px', fontWeight: '700' }}>→</span>
                    <div style={{
                      display: 'inline-flex',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: getBeltColor(promotion.new_belt),
                      color: getBeltTextColor(promotion.new_belt),
                      fontSize: '14px',
                      fontWeight: '600',
                      border: '2px solid',
                      borderColor: promotion.new_belt === 'white' ? '#e2e8f0' : 'transparent'
                    }}>
                      {getBeltLabel(promotion.new_belt)}
                    </div>
                  </div>

                  {promotion.notes && (
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#64748b',
                      marginBottom: '16px'
                    }}>
                      {promotion.notes}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleStatusChange(promotion.id, 'passed')}
                      className="btn btn-success"
                      style={{ flex: 1 }}
                    >
                      <span>✓</span>
                      <span>Réussi</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(promotion.id, 'failed')}
                      className="btn"
                      style={{
                        flex: 1,
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca'
                      }}
                    >
                      <span>✕</span>
                      <span>Échoué</span>
                    </button>
                    <button
                      onClick={() => handleDelete(promotion)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        color: '#64748b',
                        fontSize: '16px'
                      }}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">⏳</div>
              <div className="empty-state-title">Aucun passage de grade en attente</div>
              <div className="empty-state-description">
                Créez une nouvelle session pour commencer
              </div>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <span>+</span>
                <span>Nouvelle session</span>
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card fade-in">
          <div className="card-header">
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              📜 Historique des passages de grade
            </h2>
          </div>

          {completedPromotions.length > 0 ? (
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
                    <th>Résultat</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {completedPromotions.map(promotion => (
                    <tr key={promotion.id}>
                      <td>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>
                          {promotion.first_name} {promotion.last_name}
                        </div>
                      </td>
                      <td>
                        <div style={{
                          display: 'inline-flex',
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
                      <td>{new Date(promotion.promotion_date).toLocaleDateString('fr-FR')}</td>
                      <td>{promotion.examiner || '-'}</td>
                      <td>
                        <div style={{
                          display: 'inline-flex',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: promotion.status === 'passed' ? '#dcfce7' : '#fee2e2',
                          color: promotion.status === 'passed' ? '#166534' : '#991b1b',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          {getStatusLabel(promotion.status)}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(promotion)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📜</div>
              <div className="empty-state-title">Aucun historique</div>
              <div className="empty-state-description">
                Les passages de grade terminés apparaîtront ici
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BeltPromotionsPage;
