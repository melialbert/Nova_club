import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import CareerModal from '../components/CareerModal';
import FinancialStatusModal from '../components/FinancialStatusModal';

function MembersPage() {
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [editingMember, setEditingMember] = useState(null);
  const [selectedMemberForCareer, setSelectedMemberForCareer] = useState(null);
  const [selectedMemberForFinances, setSelectedMemberForFinances] = useState(null);
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

  const [sellKimono, setSellKimono] = useState(false);
  const [kimonoData, setKimonoData] = useState({
    size: '140',
    quantity: 1,
    price: 15000
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

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingMember) {
        await api.updateMember(editingMember.id, formData);
        setEditingMember(null);
      } else {
        const newMember = await api.createMember(formData);

        if (sellKimono) {
          const totalAmount = kimonoData.price * kimonoData.quantity;

          const kimonoTransaction = {
            type: 'income',
            category: 'equipment_sale',
            amount: totalAmount,
            transaction_date: new Date().toISOString().split('T')[0],
            description: `Vente kimono - ${kimonoData.size}cm (x${kimonoData.quantity}) - ${formData.first_name} ${formData.last_name}`
          };

          await api.createTransaction(kimonoTransaction);

          const kimonoPayment = {
            member_id: newMember.id,
            amount: totalAmount,
            payment_type: 'equipment',
            payment_method: 'cash',
            payment_date: new Date().toISOString().split('T')[0],
            notes: `Kimono - ${kimonoData.size}cm (x${kimonoData.quantity})`
          };

          await api.createPayment(kimonoPayment);
        }
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
      setSellKimono(false);
      setKimonoData({
        size: '140',
        quantity: 1,
        price: 15000
      });
      setShowForm(false);
      loadMembers();
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Erreur lors de l\'enregistrement de l\'adhérent');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      date_of_birth: member.date_of_birth,
      gender: member.gender || 'male',
      phone: member.phone || '',
      email: member.email || '',
      category: member.category || 'benjamin',
      discipline: member.discipline || 'judo',
      belt_level: member.belt_level,
      status: member.status || 'active',
      monthly_fee: member.monthly_fee || '',
      registration_date: member.registration_date || new Date().toISOString().split('T')[0],
      is_active: member.is_active !== undefined ? member.is_active : 1
    });
    setShowForm(true);
  };

  const handleDelete = async (member) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${member.first_name} ${member.last_name} ?`)) {
      try {
        await api.deleteMember(member.id);
        loadMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleToggleActive = async (member) => {
    try {
      await api.toggleMemberActive(member.id);
      loadMembers();
    } catch (error) {
      console.error('Error toggling member active state:', error);
      alert('Erreur lors de la modification du statut');
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
    setSellKimono(false);
    setKimonoData({
      size: '140',
      quantity: 1,
      price: 15000
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

  const filteredMembers = members.filter(member => {
    const matchesSearch = `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.category && member.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.discipline && member.discipline.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesActiveFilter =
      activeFilter === 'all' ? true :
      activeFilter === 'active' ? member.is_active === 1 :
      member.is_active === 0;

    return matchesSearch && matchesActiveFilter;
  });

  const activeCount = members.filter(m => m.is_active === 1).length;
  const inactiveCount = members.filter(m => m.is_active === 0).length;

  const handlePrintAllFinancialStatuses = async () => {
    const selectedYear = new Date().getFullYear();
    const activeMembers = members.filter(m => m.is_active === 1);

    if (activeMembers.length === 0) {
      alert('Aucun adhérent actif à imprimer');
      return;
    }

    try {
      const clubInfo = await api.getClub();
      const allMembersData = await Promise.all(
        activeMembers.map(async (member) => {
          try {
            const financialData = await api.getMemberMonthlyFees(member.id, selectedYear);
            return { member, financialData };
          } catch (error) {
            console.error(`Error loading data for member ${member.id}:`, error);
            return null;
          }
        })
      );

      const validMembersData = allMembersData.filter(data => data !== null);

      if (validMembersData.length === 0) {
        alert('Aucune donnée financière disponible');
        return;
      }

      const MONTHS = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ];

      const PAYMENT_METHODS = {
        'cash': 'Espèces',
        'card': 'Carte bancaire',
        'check': 'Chèque',
        'transfer': 'Virement'
      };

      const printContent = `
        <html>
          <head>
            <title>États Financiers - Tous les adhérents</title>
            <style>
              @page {
                margin: 2cm;
              }
              body {
                font-family: Arial, sans-serif;
                color: #000;
              }
              .page-break {
                page-break-after: always;
              }
              .main-header {
                text-align: center;
                margin-bottom: 40px;
                border-bottom: 4px solid #0f172a;
                padding-bottom: 20px;
              }
              .main-header h1 {
                margin: 0;
                font-size: 32px;
                color: #0f172a;
              }
              .main-header .club-name {
                font-size: 18px;
                color: #64748b;
                margin-top: 8px;
              }
              .main-header .date {
                font-size: 14px;
                color: #64748b;
                margin-top: 5px;
              }
              .member-section {
                margin-bottom: 50px;
              }
              .member-header {
                background: #f8fafc;
                padding: 20px;
                border-left: 5px solid #3b82f6;
                margin-bottom: 20px;
              }
              .member-header h2 {
                margin: 0 0 10px 0;
                font-size: 24px;
                color: #0f172a;
              }
              .member-header p {
                margin: 5px 0;
                font-size: 14px;
                color: #475569;
              }
              .stats {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 15px;
                margin: 20px 0;
              }
              .stat-card {
                padding: 15px;
                text-align: center;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
              }
              .stat-card .label {
                font-size: 11px;
                color: #64748b;
                font-weight: 600;
                margin-bottom: 5px;
                text-transform: uppercase;
              }
              .stat-card .value {
                font-size: 22px;
                font-weight: 800;
                color: #0f172a;
                margin: 5px 0;
              }
              .stat-card .amount {
                font-size: 11px;
                color: #64748b;
                font-weight: 600;
              }
              .months-table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
                font-size: 12px;
              }
              .months-table th,
              .months-table td {
                padding: 8px 10px;
                text-align: left;
                border: 1px solid #e2e8f0;
              }
              .months-table th {
                background: #f8fafc;
                font-weight: 700;
                color: #0f172a;
              }
              .status-paid {
                color: #059669;
                font-weight: 700;
              }
              .status-unpaid {
                color: #dc2626;
                font-weight: 700;
              }
              .footer {
                margin-top: 30px;
                padding-top: 15px;
                border-top: 2px solid #e2e8f0;
                text-align: center;
                font-size: 11px;
                color: #64748b;
              }
            </style>
          </head>
          <body>
            <div class="main-header">
              <h1>ÉTATS FINANCIERS - TOUS LES ADHÉRENTS</h1>
              ${clubInfo ? `<div class="club-name">${clubInfo.name || clubInfo.club_name} - ${clubInfo.city}</div>` : ''}
              <div class="date">Année ${selectedYear} - Imprimé le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            </div>

            ${validMembersData.map((data, index) => {
              const { financialData } = data;
              return `
                <div class="member-section ${index < validMembersData.length - 1 ? 'page-break' : ''}">
                  <div class="member-header">
                    <h2>${financialData.member.name}</h2>
                    <p><strong>Cotisation mensuelle:</strong> ${financialData.member.monthly_fee} FCFA</p>
                  </div>

                  <div class="stats">
                    <div class="stat-card">
                      <div class="label">Total</div>
                      <div class="value">${financialData.stats.total}</div>
                      <div class="amount">${financialData.stats.totalAmount} FCFA</div>
                    </div>
                    <div class="stat-card">
                      <div class="label">Payés</div>
                      <div class="value">${financialData.stats.paid}</div>
                      <div class="amount">${financialData.stats.paidAmount} FCFA</div>
                    </div>
                    <div class="stat-card">
                      <div class="label">Non payés</div>
                      <div class="value">${financialData.stats.unpaid}</div>
                      <div class="amount">${financialData.stats.unpaidAmount} FCFA</div>
                    </div>
                    <div class="stat-card">
                      <div class="label">Taux</div>
                      <div class="value">${Math.round((financialData.stats.paid / financialData.stats.total) * 100)}%</div>
                      <div class="amount">complété</div>
                    </div>
                  </div>

                  <table class="months-table">
                    <thead>
                      <tr>
                        <th>Mois</th>
                        <th>Montant</th>
                        <th>Statut</th>
                        <th>Date paiement</th>
                        <th>Méthode</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${financialData.months.map(monthData => `
                        <tr>
                          <td>${MONTHS[monthData.month - 1]}</td>
                          <td>${monthData.amount} FCFA</td>
                          <td class="${monthData.status === 'paid' ? 'status-paid' : 'status-unpaid'}">
                            ${monthData.status === 'paid' ? '✓ Payé' : '✗ Non payé'}
                          </td>
                          <td>${monthData.paid_date ? new Date(monthData.paid_date).toLocaleDateString('fr-FR') : '-'}</td>
                          <td>${monthData.payment_method ? PAYMENT_METHODS[monthData.payment_method] || monthData.payment_method : '-'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `;
            }).join('')}

            <div class="footer">
              ${clubInfo ? `${clubInfo.name || clubInfo.club_name} - ${clubInfo.city}` : ''} | Document généré le ${new Date().toLocaleDateString('fr-FR')} | ${validMembersData.length} adhérent(s) actif(s)
            </div>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } catch (error) {
      console.error('Error printing all financial statuses:', error);
      alert('Erreur lors de la génération du document d\'impression');
    }
  };

  return (
    <>
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
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-success"
              onClick={handlePrintAllFinancialStatuses}
              title="Imprimer les états financiers de tous les adhérents actifs"
            >
              <span>🖨️</span>
              <span>Imprimer tous les états</span>
            </button>
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
                  <label>Âge</label>
                  <input
                    type="text"
                    value={formData.date_of_birth ? `${calculateAge(formData.date_of_birth)} ans` : ''}
                    readOnly
                    style={{
                      backgroundColor: '#f8fafc',
                      cursor: 'not-allowed',
                      color: '#475569',
                      fontWeight: '600'
                    }}
                    placeholder="Calculé automatiquement"
                  />
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

              {!editingMember && (
                <>
                  <div style={{
                    marginTop: '24px',
                    padding: '20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#0f172a'
                      }}>
                        <input
                          type="checkbox"
                          checked={sellKimono}
                          onChange={(e) => setSellKimono(e.target.checked)}
                          style={{
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer'
                          }}
                        />
                        <span>Vendre un kimono lors de l'inscription</span>
                      </label>
                    </div>

                    {sellKimono && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginTop: '16px'
                      }}>
                        <div className="form-group">
                          <label>Taille *</label>
                          <select
                            value={kimonoData.size}
                            onChange={(e) => setKimonoData({ ...kimonoData, size: e.target.value })}
                            required
                          >
                            <option value="100">100 cm (4-5 ans)</option>
                            <option value="110">110 cm (5-6 ans)</option>
                            <option value="120">120 cm (6-7 ans)</option>
                            <option value="130">130 cm (7-8 ans)</option>
                            <option value="140">140 cm (8-9 ans)</option>
                            <option value="150">150 cm (9-11 ans)</option>
                            <option value="160">160 cm (11-13 ans)</option>
                            <option value="170">170 cm (13-15 ans)</option>
                            <option value="180">180 cm (Adulte S)</option>
                            <option value="190">190 cm (Adulte M)</option>
                            <option value="200">200 cm (Adulte L)</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Quantité *</label>
                          <input
                            type="number"
                            min="1"
                            value={kimonoData.quantity}
                            onChange={(e) => setKimonoData({ ...kimonoData, quantity: parseInt(e.target.value) || 1 })}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Prix unitaire (FCFA) *</label>
                          <input
                            type="number"
                            min="0"
                            value={kimonoData.price}
                            onChange={(e) => setKimonoData({ ...kimonoData, price: parseInt(e.target.value) || 0 })}
                            required
                          />
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          padding: '12px',
                          backgroundColor: '#10b981',
                          borderRadius: '8px',
                          color: 'white'
                        }}>
                          <div style={{ width: '100%' }}>
                            <div style={{ fontSize: '12px', opacity: 0.9 }}>Montant total</div>
                            <div style={{ fontSize: '20px', fontWeight: '700' }}>
                              {(kimonoData.price * kimonoData.quantity).toLocaleString()} FCFA
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

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
          <div className="card-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveFilter('all')}
                style={{
                  padding: '8px 16px',
                  border: '2px solid',
                  borderColor: activeFilter === 'all' ? '#3b82f6' : '#e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: activeFilter === 'all' ? '#eff6ff' : 'white',
                  color: activeFilter === 'all' ? '#3b82f6' : '#64748b',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Tous ({members.length})
              </button>
              <button
                onClick={() => setActiveFilter('active')}
                style={{
                  padding: '8px 16px',
                  border: '2px solid',
                  borderColor: activeFilter === 'active' ? '#10b981' : '#e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: activeFilter === 'active' ? '#d1fae5' : 'white',
                  color: activeFilter === 'active' ? '#10b981' : '#64748b',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Actifs ({activeCount})
              </button>
              <button
                onClick={() => setActiveFilter('inactive')}
                style={{
                  padding: '8px 16px',
                  border: '2px solid',
                  borderColor: activeFilter === 'inactive' ? '#f97316' : '#e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: activeFilter === 'inactive' ? '#ffedd5' : 'white',
                  color: activeFilter === 'inactive' ? '#f97316' : '#64748b',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Inactifs ({inactiveCount})
              </button>
            </div>
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
                    <th>État</th>
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
                          {member.category || '-'}
                        </span>
                      </td>
                      <td>{member.discipline || '-'}</td>
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
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          backgroundColor: member.is_active === 1 ? '#d1fae5' : '#fee2e2',
                          color: member.is_active === 1 ? '#059669' : '#dc2626'
                        }}>
                          {member.is_active === 1 ? '✓ Actif' : '✗ Inactif'}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600', color: '#10b981' }}>
                        {parseFloat(member.monthly_fee || 0).toLocaleString()} FCFA
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleToggleActive(member)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: member.is_active === 1 ? '#fee2e2' : '#d1fae5',
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'all 0.2s',
                              fontWeight: '600',
                              color: member.is_active === 1 ? '#dc2626' : '#059669'
                            }}
                            title={member.is_active === 1 ? 'Désactiver' : 'Activer'}
                          >
                            {member.is_active === 1 ? '⏸' : '▶'}
                          </button>
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
                            onClick={() => setSelectedMemberForCareer(member)}
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
                              e.target.style.backgroundColor = '#fef3c7';
                              e.target.style.borderColor = '#fbbf24';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'white';
                              e.target.style.borderColor = '#e2e8f0';
                            }}
                            title="Voir carrière"
                          >
                            🏆
                          </button>
                          <button
                            onClick={() => setSelectedMemberForFinances(member)}
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
                              e.target.style.backgroundColor = '#d1fae5';
                              e.target.style.borderColor = '#10b981';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'white';
                              e.target.style.borderColor = '#e2e8f0';
                            }}
                            title="État financier"
                          >
                            💰
                          </button>
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

      {selectedMemberForCareer && (
        <CareerModal
          member={selectedMemberForCareer}
          onClose={() => setSelectedMemberForCareer(null)}
        />
      )}

      {selectedMemberForFinances && (
        <FinancialStatusModal
          member={selectedMemberForFinances}
          onClose={() => setSelectedMemberForFinances(null)}
        />
      )}
    </>
  );
}

export default MembersPage;
