import { useEffect, useState } from 'react';
import { api } from '../services/api';

function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
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

    try {
      await api.createPayment(formData);
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
      loadData();
    } catch (error) {
      console.error('Error creating payment:', error);
      alert("Erreur lors de l\'enregistrement du paiement");
    }
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

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
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
