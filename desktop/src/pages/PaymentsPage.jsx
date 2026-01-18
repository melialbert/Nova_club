import { useEffect, useState } from 'react';
import { api } from '../services/api';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(15);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [clubInfo, setClubInfo] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    member_id: '',
    amount: '',
    payment_type: 'monthly_fee',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    month_year: new Date().toISOString().slice(0, 7),
    notes: ''
  });

  useEffect(() => {
    loadData();
    loadClubInfo();
  }, []);

  const loadClubInfo = async () => {
    try {
      const club = await api.getClub();
      setClubInfo(club);
    } catch (error) {
      console.error('Error loading club info:', error);
    }
  };

  const loadData = async () => {
    try {
      const [paymentsData, membersData] = await Promise.all([
        api.getPayments(),
        api.getMembers()
      ]);
      setPayments(paymentsData);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.payment_type === 'monthly_fee' && selectedMonths.length === 0) {
      alert('Veuillez sélectionner au moins un mois');
      return;
    }

    try {
      if (selectedMonths.length > 0) {
        for (const month of selectedMonths) {
          const monthYear = `${selectedYear}-${String(month).padStart(2, '0')}`;
          await api.createPayment({
            ...formData,
            month_year: monthYear
          });
        }
      } else {
        await api.createPayment(formData);
      }

      setFormData({
        member_id: '',
        amount: '',
        payment_type: 'monthly_fee',
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        month_year: new Date().toISOString().slice(0, 7),
        notes: ''
      });
      setSelectedMonths([]);
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating payment:', error);
      alert("Erreur lors de l\'enregistrement du paiement");
    }
  };

  const toggleMonth = (month) => {
    setSelectedMonths(prev =>
      prev.includes(month)
        ? prev.filter(m => m !== month)
        : [...prev, month].sort((a, b) => a - b)
    );
  };

  const handleDelete = async (payment) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ce paiement de ${parseFloat(payment.amount).toLocaleString()} FCFA ?`)) {
      return;
    }

    try {
      await api.deletePayment(payment.id);
      loadData();
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Erreur lors de la suppression du paiement');
    }
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handlePrintReceipt = (payment) => {
    const member = members.find(m => m.id === payment.member_id);

    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <html>
        <head>
          <title>Facture - ${member ? `${member.first_name} ${member.last_name}` : 'Paiement'}</title>
          <style>
            @page {
              margin: 2cm;
            }
            body {
              font-family: Arial, sans-serif;
              color: #000;
              line-height: 1.6;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 40px;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 30px;
            }
            .logo-section {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .logo {
              max-width: 120px;
              max-height: 120px;
              object-fit: contain;
            }
            .club-name {
              font-size: 24px;
              font-weight: 700;
              color: #1f2937;
            }
            .club-info {
              font-size: 14px;
              color: #6b7280;
            }
            .invoice-title {
              text-align: right;
            }
            .invoice-title h1 {
              font-size: 32px;
              color: #3b82f6;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .invoice-number {
              font-size: 14px;
              color: #6b7280;
            }
            .receipt-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin: 30px 0;
            }
            .info-section {
              padding: 20px;
              background: #f8fafc;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
            }
            .info-section h3 {
              margin: 0 0 15px 0;
              font-size: 16px;
              color: #0f172a;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-section p {
              margin: 8px 0;
              font-size: 14px;
              color: #475569;
            }
            .info-section strong {
              color: #0f172a;
              font-weight: 600;
            }
            .amount-section {
              margin: 40px 0;
              padding: 30px;
              background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
              border: 3px solid #10b981;
              border-radius: 12px;
              text-align: center;
            }
            .amount-section .label {
              font-size: 16px;
              color: #065f46;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 10px;
            }
            .amount-section .amount {
              font-size: 48px;
              font-weight: 800;
              color: #059669;
              margin: 10px 0;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
            }
            .details-table th {
              background: #f3f4f6;
              padding: 16px;
              text-align: left;
              font-size: 13px;
              color: #374151;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .details-table td {
              padding: 20px 16px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 15px;
              color: #1f2937;
            }
            .details-table tr:last-child td {
              border-bottom: none;
            }
            .notes-section {
              margin: 30px 0;
              padding: 20px;
              background: #fffbeb;
              border-left: 4px solid #f59e0b;
              border-radius: 4px;
            }
            .notes-section h4 {
              margin: 0 0 10px 0;
              font-size: 14px;
              color: #92400e;
              font-weight: 700;
              text-transform: uppercase;
            }
            .notes-section p {
              margin: 0;
              font-size: 14px;
              color: #78350f;
              line-height: 1.6;
            }
            .total-section {
              display: flex;
              justify-content: flex-end;
              margin-top: 30px;
            }
            .total-box {
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              color: white;
              padding: 24px 40px;
              border-radius: 12px;
              min-width: 300px;
            }
            .total-label {
              font-size: 14px;
              opacity: 0.9;
              margin-bottom: 8px;
            }
            .total-amount {
              font-size: 36px;
              font-weight: 700;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
            }
            .footer .powered-by {
              font-size: 13px;
              color: #6b7280;
              margin-top: 20px;
              padding-top: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
            }
            .footer .date {
              font-size: 12px;
              color: #64748b;
              margin-bottom: 5px;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-section">
              ${clubInfo && clubInfo.logo_url ? `<img src="${clubInfo.logo_url}" alt="Logo" class="logo" />` : ''}
              <div>
                <div class="club-name">${clubInfo ? (clubInfo.name || clubInfo.club_name) : 'Mon Club'}</div>
                <div class="club-info">
                  ${clubInfo ? (clubInfo.city || '') : ''}
                </div>
              </div>
            </div>
            <div class="invoice-title">
              <h1>FACTURE</h1>
              <div class="invoice-number">N° ${String(payment.id).padStart(8, '0')}</div>
            </div>
          </div>

          <div class="receipt-info">
            <div class="info-section">
              <h3>Adhérent</h3>
              <p><strong>Nom:</strong> ${member ? `${member.first_name} ${member.last_name}` : 'Inconnu'}</p>
              ${member && member.phone ? `<p><strong>Téléphone:</strong> ${member.phone}</p>` : ''}
              ${member && member.email ? `<p><strong>Email:</strong> ${member.email}</p>` : ''}
            </div>

            <div class="info-section">
              <h3>Informations de paiement</h3>
              <p><strong>Date:</strong> ${new Date(payment.payment_date).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}</p>
              <p><strong>Méthode:</strong> ${getPaymentMethodLabel(payment.payment_method)}</p>
              <p><strong>Statut:</strong> <span style="color: #10b981; font-weight: 600;">Payé</span></p>
            </div>
          </div>

          <table class="details-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Période</th>
                <th style="text-align: right;">Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${getPaymentTypeLabel(payment.payment_type)}</strong>
                </td>
                <td>
                  ${payment.month_year ? new Date(payment.month_year + '-01').toLocaleDateString('fr-FR', {
                    month: 'long',
                    year: 'numeric'
                  }) : '-'}
                </td>
                <td style="text-align: right; font-weight: 700;">
                  ${parseFloat(payment.amount).toLocaleString()} FCFA
                </td>
              </tr>
            </tbody>
          </table>

          ${payment.notes ? `
            <div class="notes-section">
              <h4>Notes</h4>
              <p>${payment.notes}</p>
            </div>
          ` : ''}

          <div class="total-section">
            <div class="total-box">
              <div class="total-label">MONTANT TOTAL</div>
              <div class="total-amount">${parseFloat(payment.amount).toLocaleString()} FCFA</div>
            </div>
          </div>

          <div class="footer">
            <p>Merci pour votre paiement</p>
            <p style="margin-top: 8px;">Cette facture a été générée le ${new Date().toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}</p>
            <div class="powered-by">
              <span>Propulsé par</span>
              <img src="${window.location.origin}/image.png" alt="Nova Company Technology" style="max-width: 180px; max-height: 60px; object-fit: contain; vertical-align: middle;" />
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getPaymentTypeLabel = (type) => {
    const types = {
      'monthly_fee': 'Cotisation mensuelle',
      'registration': 'Inscription',
      'equipment': 'Équipement',
      'other': 'Autre'
    };
    return types[type] || type;
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      'cash': 'Espèces',
      'mobile_money': 'Mobile Money',
      'bank_transfer': 'Virement bancaire',
      'card': 'Carte bancaire'
    };
    return methods[method] || method;
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      'cash': '💵',
      'mobile_money': '📱',
      'bank_transfer': '🏦',
      'card': '💳'
    };
    return icons[method] || '💰';
  };

  const filteredPayments = payments.filter(payment => {
    const member = members.find(m => m.id === payment.member_id);
    const memberName = member ? `${member.first_name} ${member.last_name}`.toLowerCase() : '';
    const matchesSearch = memberName.includes(searchTerm.toLowerCase()) ||
      getPaymentTypeLabel(payment.payment_type).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || payment.payment_type === filterType;

    const paymentDate = new Date(payment.payment_date);
    const matchesDateFrom = !dateFrom || paymentDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || paymentDate <= new Date(dateTo);

    return matchesSearch && matchesFilter && matchesDateFrom && matchesDateTo;
  }).sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));

  const displayedPayments = filteredPayments.slice(0, displayLimit);

  const totalAmount = filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyAmount = payments
    .filter(p => p.month_year === currentMonth && p.status === 'paid')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const paymentsByType = {
    monthly_fee: payments.filter(p => p.payment_type === 'monthly_fee').length,
    registration: payments.filter(p => p.payment_type === 'registration').length,
    equipment: payments.filter(p => p.payment_type === 'equipment').length,
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
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            {filteredPayments.length} paiement{filteredPayments.length > 1 ? 's' : ''} enregistré{filteredPayments.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          className="btn btn-success"
          onClick={() => setShowForm(!showForm)}
        >
          <span>{showForm ? '✕' : '+'}</span>
          <span>{showForm ? 'Annuler' : 'Nouveau paiement'}</span>
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981'
            }}
          >
            💰
          </div>
          <div className="stat-value">{totalAmount.toLocaleString()} FCFA</div>
          <div className="stat-label">Total encaissé</div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6'
            }}
          >
            📅
          </div>
          <div className="stat-value">{monthlyAmount.toLocaleString()} FCFA</div>
          <div className="stat-label">Ce mois-ci</div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: '#f59e0b'
            }}
          >
            📊
          </div>
          <div className="stat-value">{paymentsByType.monthly_fee}</div>
          <div className="stat-label">Cotisations</div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: '#8b5cf6'
            }}
          >
            📋
          </div>
          <div className="stat-value">{paymentsByType.equipment}</div>
          <div className="stat-label">Équipements</div>
        </div>
      </div>

      {showForm && (
        <div className="card fade-in" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              💳 Enregistrer un paiement
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
                <label>Montant (FCFA) *</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Type de paiement</label>
                <select name="payment_type" value={formData.payment_type} onChange={handleChange}>
                  <option value="monthly_fee">Cotisation mensuelle</option>
                  <option value="registration">Inscription</option>
                  <option value="equipment">Équipement</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div className="form-group">
                <label>Méthode de paiement</label>
                <select name="payment_method" value={formData.payment_method} onChange={handleChange}>
                  <option value="cash">Espèces</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Virement bancaire</option>
                  <option value="card">Carte bancaire</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date de paiement *</label>
                <input type="date" name="payment_date" value={formData.payment_date} onChange={handleChange} required />
              </div>
            </div>

            {formData.payment_type === 'monthly_fee' && (
              <div className="form-group">
                <label style={{ marginBottom: '12px', display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                  Mois concernés *
                </label>
                <div style={{ marginBottom: '12px' }}>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    style={{
                      padding: '10px 14px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#0f172a',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '10px',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  border: '2px solid #e2e8f0'
                }}>
                  {MONTHS.map((monthName, index) => {
                    const monthNumber = index + 1;
                    const isSelected = selectedMonths.includes(monthNumber);

                    return (
                      <div
                        key={monthNumber}
                        onClick={() => toggleMonth(monthNumber)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #10b981' : '2px solid #e2e8f0',
                          backgroundColor: isSelected ? '#d1fae5' : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'center',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: isSelected ? '#059669' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        {isSelected && <span style={{ fontSize: '16px' }}>✓</span>}
                        <span>{monthName}</span>
                      </div>
                    );
                  })}
                </div>
                {selectedMonths.length > 0 && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '8px',
                    border: '1px solid #3b82f6',
                    fontSize: '14px',
                    color: '#1e40af',
                    fontWeight: '600'
                  }}>
                    {selectedMonths.length} mois sélectionné{selectedMonths.length > 1 ? 's' : ''} : {selectedMonths.map(m => MONTHS[m - 1]).join(', ')}
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label>Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" placeholder="Informations complémentaires..."></textarea>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-success">
                <span>✓</span>
                <span>Enregistrer le paiement</span>
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              💳 Historique des paiements
            </h2>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              {displayedPayments.length} sur {filteredPayments.length} affichés
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                backgroundColor: '#f8fafc',
                cursor: 'pointer'
              }}
            >
              <option value="all">Tous les types</option>
              <option value="monthly_fee">Cotisations</option>
              <option value="registration">Inscriptions</option>
              <option value="equipment">Équipements</option>
              <option value="other">Autres</option>
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="Du..."
              style={{
                padding: '10px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                backgroundColor: '#f8fafc',
                cursor: 'pointer'
              }}
              title="Date de début"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="Au..."
              style={{
                padding: '10px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                backgroundColor: '#f8fafc',
                cursor: 'pointer'
              }}
              title="Date de fin"
            />
            <input
              type="text"
              placeholder="Rechercher un paiement..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setDisplayLimit(Math.max(15, displayLimit - 15))}
              disabled={displayLimit <= 15}
              style={{
                padding: '8px 16px',
                opacity: displayLimit <= 15 ? 0.5 : 1,
                cursor: displayLimit <= 15 ? 'not-allowed' : 'pointer'
              }}
            >
              Voir - 15
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setDisplayLimit(displayLimit + 15)}
              disabled={displayLimit >= filteredPayments.length}
              style={{
                padding: '8px 16px',
                opacity: displayLimit >= filteredPayments.length ? 0.5 : 1,
                cursor: displayLimit >= filteredPayments.length ? 'not-allowed' : 'pointer'
              }}
            >
              Voir + 15
            </button>
            {(dateFrom || dateTo || searchTerm || filterType !== 'all') && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setSearchTerm('');
                  setFilterType('all');
                  setDisplayLimit(15);
                }}
                style={{ padding: '8px 16px' }}
              >
                ✕ Réinitialiser
              </button>
            )}
          </div>
        </div>

        {displayedPayments.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Adhérent</th>
                  <th>Type</th>
                  <th>Montant</th>
                  <th>Méthode</th>
                  <th>Mois</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedPayments.map(payment => {
                  const member = members.find(m => m.id === payment.member_id);
                  return (
                    <tr key={payment.id}>
                      <td>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>
                          {new Date(payment.payment_date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td>
                        {member ? (
                          <div>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>
                              {member.first_name} {member.last_name}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Inconnu</span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-blue">
                          {getPaymentTypeLabel(payment.payment_type)}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: '#10b981', fontSize: '15px' }}>
                          {parseFloat(payment.amount || 0).toLocaleString()} FCFA
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{getPaymentMethodIcon(payment.payment_method)}</span>
                          <span>{getPaymentMethodLabel(payment.payment_method)}</span>
                        </div>
                      </td>
                      <td>
                        {payment.month_year ? (
                          <span className="badge badge-yellow">
                            {new Date(payment.month_year + '-01').toLocaleDateString('fr-FR', {
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleViewDetails(payment)}
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
                            title="Voir les détails"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handlePrintReceipt(payment)}
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
                              e.target.style.backgroundColor = '#eff6ff';
                              e.target.style.borderColor = '#3b82f6';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'white';
                              e.target.style.borderColor = '#e2e8f0';
                            }}
                            title="Imprimer la facture"
                          >
                            🖨️
                          </button>
                          <button
                            onClick={() => handleDelete(payment)}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">💳</div>
            <div className="empty-state-title">
              {searchTerm || filterType !== 'all' || dateFrom || dateTo ? 'Aucun résultat' : 'Aucun paiement'}
            </div>
            <div className="empty-state-description">
              {searchTerm || filterType !== 'all' || dateFrom || dateTo
                ? 'Aucun paiement ne correspond à vos critères'
                : 'Commencez par enregistrer votre premier paiement'}
            </div>
            {!searchTerm && filterType === 'all' && !dateFrom && !dateTo && (
              <button className="btn btn-success" onClick={() => setShowForm(true)}>
                <span>+</span>
                <span>Enregistrer un paiement</span>
              </button>
            )}
          </div>
        )}
      </div>

      {showDetailsModal && selectedPayment && (
        <div
          style={{
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
          }}
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              margin: 0
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header" style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                💳 Détails du paiement
              </h2>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Adhérent
                  </label>
                  <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                    {(() => {
                      const member = members.find(m => m.id === selectedPayment.member_id);
                      return member ? `${member.first_name} ${member.last_name}` : 'Inconnu';
                    })()}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Montant
                    </label>
                    <div style={{ marginTop: '8px', fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                      {parseFloat(selectedPayment.amount).toLocaleString()} FCFA
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Date
                    </label>
                    <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                      {new Date(selectedPayment.payment_date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Type
                    </label>
                    <div style={{ marginTop: '8px' }}>
                      <span className="badge badge-blue">
                        {getPaymentTypeLabel(selectedPayment.payment_type)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Méthode
                    </label>
                    <div style={{ marginTop: '8px', fontSize: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{getPaymentMethodIcon(selectedPayment.payment_method)}</span>
                      <span>{getPaymentMethodLabel(selectedPayment.payment_method)}</span>
                    </div>
                  </div>
                </div>

                {selectedPayment.notes && (
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Notes
                    </label>
                    <div style={{
                      marginTop: '8px',
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '15px',
                      color: '#475569',
                      lineHeight: '1.6'
                    }}>
                      {selectedPayment.notes}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '24px' }}>
                <button
                  onClick={() => handlePrintReceipt(selectedPayment)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    border: '2px solid #3b82f6',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#2563eb';
                    e.target.style.borderColor = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#3b82f6';
                    e.target.style.borderColor = '#3b82f6';
                  }}
                >
                  <span>🖨️</span>
                  <span>Imprimer la facture</span>
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#64748b',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.borderColor = '#cbd5e1'}
                  onMouseLeave={(e) => e.target.style.borderColor = '#e2e8f0'}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentsPage;
