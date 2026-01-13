import { useEffect, useState } from 'react';
import { getAllFromStore, addToStore, deleteFromStore } from '../db';
import { queueChange } from '../services/syncService';
import { usePaymentStore, useMemberStore, useTransactionStore } from '../utils/store';
import { useToast } from '../utils/useToast';
import { apiCall } from '../services/api';
import Layout from '../components/Layout';

function PaymentsPage() {
  const { payments, setPayments, addPayment, removePayment } = usePaymentStore();
  const { members, setMembers } = useMemberStore();
  const { addTransaction } = useTransactionStore();
  const { success, error } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [clubSettings, setClubSettings] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
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
  }, []);

  const loadData = async () => {
    const paymentsData = await getAllFromStore('payments');
    const membersData = await getAllFromStore('members');
    setPayments(paymentsData);
    setMembers(membersData);

    try {
      const clubData = await apiCall('/clubs/my-club');
      setClubSettings({
        club_name: clubData.club_name,
        city: clubData.city,
        slogan: clubData.slogan,
        logo: clubData.logo
      });
    } catch (err) {
      console.error('Erreur lors du chargement des paramètres du club:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPayment = {
      id: crypto.randomUUID(),
      ...formData,
      club_id: 'current_club_id',
      status: 'paid',
      created_at: new Date().toISOString()
    };

    await addToStore('payments', newPayment);
    await queueChange('payments', newPayment.id, newPayment);
    addPayment(newPayment);

    const member = members.find(m => m.id === formData.member_id);
    const transaction = {
      id: crypto.randomUUID(),
      type: 'income',
      category: 'subscription',
      amount: parseFloat(formData.amount),
      description: `${getPaymentTypeLabel(formData.payment_type)} - ${member ? `${member.first_name} ${member.last_name}` : 'Adhérent'}`,
      transaction_date: formData.payment_date,
      club_id: 'current_club_id',
      created_at: new Date().toISOString()
    };

    await addToStore('transactions', transaction);
    await queueChange('transactions', transaction.id, transaction);
    addTransaction(transaction);

    setFormData({
      member_id: '',
      amount: '',
      payment_type: 'monthly_fee',
      payment_method: 'cash',
      payment_date: new Date().toISOString().split('T')[0],
      month_year: new Date().toISOString().slice(0, 7),
      notes: ''
    });
    setShowForm(false);
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
    return matchesSearch && matchesFilter;
  });

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

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleDelete = async (payment) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ce paiement de ${parseFloat(payment.amount).toLocaleString()} FCFA ?`)) {
      return;
    }

    try {
      await deleteFromStore('payments', payment.id);
      await queueChange('payments', payment.id, null);
      removePayment(payment.id);
      success('Paiement supprimé avec succès');
    } catch (err) {
      error('Erreur lors de la suppression du paiement');
    }
  };

  const printInvoice = (payment) => {
    const member = members.find(m => m.id === payment.member_id);
    if (!member) {
      error('Adhérent introuvable');
      return;
    }

    const paymentMethodLabel = getPaymentMethodLabel(payment.payment_method);
    const paymentTypeLabel = getPaymentTypeLabel(payment.payment_type);

    const clubInfo = clubSettings || {
      club_name: 'Mon Club',
      city: '',
      slogan: '',
      logo: ''
    };

    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) {
      error('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez que les popups ne sont pas bloquées.');
      return;
    }

    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Facture - ${member.first_name} ${member.last_name}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            background: white;
            color: #1f2937;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 40px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 3px solid #3b82f6;
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
          .info-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
          }
          .info-block h3 {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
            font-weight: 600;
          }
          .info-block p {
            font-size: 15px;
            color: #1f2937;
            line-height: 1.6;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
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
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 13px;
          }
          .notes {
            margin-top: 30px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          .notes h4 {
            font-size: 13px;
            color: #374151;
            margin-bottom: 8px;
            font-weight: 600;
          }
          .notes p {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.5;
          }
          @media print {
            body {
              padding: 0;
            }
            .invoice-container {
              border: none;
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="logo-section">
              ${clubInfo.logo ? `<img src="${clubInfo.logo}" alt="Logo" class="logo" />` : ''}
              <div>
                <div class="club-name">${clubInfo.club_name}</div>
                <div class="club-info">
                  ${clubInfo.city}
                  ${clubInfo.slogan ? `<br>${clubInfo.slogan}` : ''}
                </div>
              </div>
            </div>
            <div class="invoice-title">
              <h1>FACTURE</h1>
              <div class="invoice-number">N° ${payment.id.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>

          <div class="info-section">
            <div class="info-block">
              <h3>Facturé à</h3>
              <p>
                <strong>${member.first_name} ${member.last_name}</strong><br>
                ${member.email || ''}<br>
                ${member.phone || ''}
              </p>
            </div>
            <div class="info-block">
              <h3>Informations de paiement</h3>
              <p>
                <strong>Date:</strong> ${new Date(payment.payment_date).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}<br>
                <strong>Méthode:</strong> ${paymentMethodLabel}<br>
                <strong>Statut:</strong> <span style="color: #10b981; font-weight: 600;">Payé</span>
              </p>
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
                  <strong>${paymentTypeLabel}</strong>
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
            <div class="notes">
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
          </div>
        </div>
      </body>
      </html>
    `;

    invoiceWindow.document.write(invoiceContent);
    invoiceWindow.document.close();

    invoiceWindow.onload = () => {
      setTimeout(() => {
        invoiceWindow.print();
      }, 250);
    };

    success('Facture générée avec succès');
  };

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
                <div className="form-group">
                  <label>Mois concerné</label>
                  <input type="month" name="month_year" value={formData.month_year} onChange={handleChange} />
                </div>
              </div>
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
          <div className="card-header">
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              💳 Historique des paiements
            </h2>
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
                type="text"
                placeholder="Rechercher un paiement..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: '300px' }}
              />
            </div>
          </div>

          {filteredPayments.length > 0 ? (
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
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map(payment => {
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '12px'
                              }}>
                                {member.first_name[0]}{member.last_name[0]}
                              </div>
                              <div>
                                <div style={{ fontWeight: '600', color: '#0f172a' }}>
                                  {member.first_name} {member.last_name}
                                </div>
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
                          <span className={`status-badge status-${payment.status}`}>
                            {payment.status === 'paid' ? 'Payé' : payment.status === 'pending' ? 'En attente' : 'Annulé'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => printInvoice(payment)}
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
                                e.target.style.backgroundColor = '#f0fdf4';
                                e.target.style.borderColor = '#10b981';
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
                {searchTerm || filterType !== 'all' ? 'Aucun résultat' : 'Aucun paiement'}
              </div>
              <div className="empty-state-description">
                {searchTerm || filterType !== 'all'
                  ? 'Aucun paiement ne correspond à vos critères'
                  : 'Commencez par enregistrer votre premier paiement'}
              </div>
              {!searchTerm && filterType === 'all' && (
                <button className="btn btn-success" onClick={() => setShowForm(true)}>
                  <span>+</span>
                  <span>Enregistrer un paiement</span>
                </button>
              )}
            </div>
          )}
        </div>
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

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Mois concerné
                  </label>
                  <div style={{ marginTop: '8px', fontSize: '16px', color: '#0f172a' }}>
                    {selectedPayment.month_year ? (
                      <span className="badge badge-yellow">
                        {new Date(selectedPayment.month_year + '-01').toLocaleDateString('fr-FR', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Non spécifié</span>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Statut
                  </label>
                  <div style={{ marginTop: '8px' }}>
                    <span className={`status-badge status-${selectedPayment.status}`}>
                      {selectedPayment.status === 'paid' ? 'Payé' : selectedPayment.status === 'pending' ? 'En attente' : 'Annulé'}
                    </span>
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

                <div style={{
                  paddingTop: '16px',
                  borderTop: '1px solid #e2e8f0',
                  fontSize: '13px',
                  color: '#94a3b8'
                }}>
                  Enregistré le {new Date(selectedPayment.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  onClick={() => {
                    printInvoice(selectedPayment);
                    setShowDetailsModal(false);
                  }}
                  className="btn btn-success"
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
    </Layout>
  );
}

export default PaymentsPage;
