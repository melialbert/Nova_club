import { useEffect, useState } from 'react';
import { getAllFromStore, addToStore } from '../db';
import { queueChange } from '../services/syncService';
import { usePaymentStore, useMemberStore, useTransactionStore } from '../utils/store';
import Layout from '../components/Layout';

function PaymentsPage() {
  const { payments, setPayments, addPayment } = usePaymentStore();
  const { members, setMembers } = useMemberStore();
  const { addTransaction } = useTransactionStore();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
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
    </Layout>
  );
}

export default PaymentsPage;
