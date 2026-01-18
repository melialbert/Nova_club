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
  const [user, setUser] = useState(null);
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
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
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

      let totalEncaisse = 0;
      validMembersData.forEach(data => {
        data.financialData.months.forEach(monthData => {
          if (monthData.status === 'paid') {
            totalEncaisse += monthData.amount || 0;
          } else if (monthData.paid_amount && monthData.paid_amount > 0) {
            totalEncaisse += monthData.paid_amount;
          }
        });
      });

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
                margin: 1cm;
                size: landscape;
              }
              body {
                font-family: Arial, sans-serif;
                color: #000;
                font-size: 10px;
              }
              .header {
                text-align: center;
                margin-bottom: 15px;
                padding: 10px;
                background: #0f172a;
                color: white;
              }
              .header h1 {
                margin: 0 0 5px 0;
                font-size: 18px;
                font-weight: 900;
              }
              .header-info {
                font-size: 10px;
                color: #cbd5e1;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th {
                background: #334155;
                color: white;
                padding: 6px 4px;
                text-align: center;
                font-size: 8px;
                font-weight: 700;
                border: 1px solid #475569;
              }
              th.member-col {
                text-align: left;
                width: 140px;
              }
              th.fee-col {
                width: 60px;
              }
              th.month-col {
                width: 65px;
              }
              td {
                padding: 5px 3px;
                border: 1px solid #cbd5e1;
                text-align: center;
                font-size: 7px;
              }
              td.member-name {
                text-align: left;
                font-weight: 700;
                background: #f8fafc;
                font-size: 9px;
              }
              td.monthly-fee {
                text-align: center;
                font-weight: 600;
                background: #f8fafc;
                font-size: 8px;
              }
              .status-paid {
                background: #dcfce7;
                color: #166534;
                font-weight: 700;
              }
              .status-partial {
                background: #fef3c7;
                color: #92400e;
                font-weight: 700;
              }
              .status-unpaid {
                background: #fee2e2;
                color: #991b1b;
                font-weight: 700;
              }
              .amount {
                display: block;
                font-size: 8px;
                font-weight: 800;
              }
              .partial-info {
                display: block;
                font-size: 6px;
                margin-top: 2px;
                line-height: 1.2;
              }
              .footer {
                text-align: center;
                margin-top: 10px;
                padding-top: 10px;
                border-top: 2px solid #cbd5e1;
                font-size: 8px;
                color: #64748b;
              }
              .total-encaisse {
                font-size: 14px;
                font-weight: 900;
                color: #166534;
                margin-bottom: 8px;
                padding: 8px;
                background: #f0fdf4;
                border: 2px solid #166534;
                border-radius: 4px;
              }
              .legend {
                margin-bottom: 10px;
                padding: 5px;
                background: #f8fafc;
                border: 1px solid #cbd5e1;
                font-size: 8px;
              }
              .legend span {
                margin-right: 15px;
              }
              .legend .paid {
                color: #166534;
                font-weight: 700;
              }
              .legend .partial {
                color: #92400e;
                font-weight: 700;
              }
              .legend .unpaid {
                color: #991b1b;
                font-weight: 700;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>ÉTATS FINANCIERS - ANNÉE ${selectedYear}</h1>
              <div class="header-info">
                ${clubInfo ? `${clubInfo.name || clubInfo.club_name} - ${clubInfo.city} | ` : ''}
                Imprimé le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} |
                ${validMembersData.length} adhérent(s) actif(s)
              </div>
            </div>

            <div class="legend">
              <span class="paid">✓ Payé</span>
              <span class="partial">⚠ Partiel</span>
              <span class="unpaid">✗ Impayé</span>
            </div>

            <table>
              <thead>
                <tr>
                  <th class="member-col">Adhérent</th>
                  <th class="fee-col">Cotisation</th>
                  ${MONTHS.map(month => `<th class="month-col">${month.substring(0, 3)}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${validMembersData.map(data => {
                  const { financialData } = data;
                  return `
                    <tr>
                      <td class="member-name">${financialData.member.name}</td>
                      <td class="monthly-fee">${financialData.member.monthly_fee} F</td>
                      ${financialData.months.map(monthData => {
                        const isPaid = monthData.status === 'paid';
                        const isPartial = monthData.status === 'partial';
                        const hasPartialInfo = monthData.total_amount && monthData.paid_amount && monthData.remaining_amount > 0;
                        const statusClass = isPaid ? 'status-paid' : (isPartial || hasPartialInfo ? 'status-partial' : 'status-unpaid');

                        return `
                          <td class="${statusClass}">
                            ${hasPartialInfo ? `
                              <span class="amount">${monthData.paid_amount.toLocaleString()} F</span>
                              <span class="partial-info">sur ${monthData.total_amount.toLocaleString()} F</span>
                              <span class="partial-info">Reste: ${monthData.remaining_amount.toLocaleString()} F</span>
                            ` : isPaid ? `
                              <span class="amount">${monthData.amount.toLocaleString()} F</span>
                              <span class="partial-info">✓ Payé</span>
                            ` : `
                              <span class="partial-info">✗ Impayé</span>
                            `}
                          </td>
                        `;
                      }).join('')}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <div class="footer">
              <div class="total-encaisse">
                MONTANT TOTAL ENCAISSÉ : ${totalEncaisse.toLocaleString()} F
              </div>
              <div>
                Document généré automatiquement - ${clubInfo ? `${clubInfo.name || clubInfo.club_name}` : ''} - ${new Date().toLocaleDateString('fr-FR')}
              </div>
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
                          {user?.role?.toUpperCase() !== 'SECRETARY' && (
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
                          )}
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
