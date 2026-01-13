import { useEffect, useState } from 'react';
import { getAllFromStore, addToStore } from '../db';
import { queueChange } from '../services/syncService';
import { useToast } from '../utils/useToast';
import Layout from '../components/Layout';

function AccountingPage() {
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [formData, setFormData] = useState({
    type: 'income',
    category: 'subscription',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const { success, error } = useToast();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const data = await getAllFromStore('transactions');
    setTransactions(data.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newTransaction = {
      id: crypto.randomUUID(),
      ...formData,
      amount: parseFloat(formData.amount),
      club_id: 'current_club_id',
      created_at: new Date().toISOString()
    };

    await addToStore('transactions', newTransaction);
    await queueChange('transactions', newTransaction.id, newTransaction);

    setTransactions([newTransaction, ...transactions]);
    success('Transaction ajoutée avec succès');

    setFormData({
      type: 'income',
      category: 'subscription',
      amount: '',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0]
    });
    setShowModal(false);
  };

  const getFilteredTransactions = () => {
    let filtered = transactions;

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (filterPeriod !== 'all') {
      const now = new Date();
      const transactionDate = (dateStr) => new Date(dateStr);

      filtered = filtered.filter(t => {
        const tDate = transactionDate(t.transaction_date);
        switch (filterPeriod) {
          case 'today':
            return tDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return tDate >= weekAgo;
          case 'month':
            return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
          case 'year':
            return tDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const calculateSummary = () => {
    const filtered = getFilteredTransactions();
    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const expenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      income,
      expenses,
      balance: income - expenses
    };
  };

  const getCategoryLabel = (category) => {
    const labels = {
      subscription: 'Cotisation',
      equipment_sale: 'Vente équipement',
      subsidy: 'Subvention',
      rent: 'Loyer',
      utilities: 'Charges',
      equipment_purchase: 'Achat équipement',
      other: 'Autre'
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      subscription: '��',
      equipment_sale: '👔',
      subsidy: '🏦',
      rent: '🏢',
      utilities: '💡',
      equipment_purchase: '🛒',
      other: '📝'
    };
    return icons[category] || '📝';
  };

  const summary = calculateSummary();
  const filteredTransactions = getFilteredTransactions();

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
              Gestion comptable du club
            </p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-success">
            <span>➕</span>
            <span>Nouvelle transaction</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Revenus</div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>
                  {summary.income.toLocaleString()} FCFA
                </div>
              </div>
              <div style={{ fontSize: '32px', opacity: 0.8 }}>📈</div>
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Dépenses</div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>
                  {summary.expenses.toLocaleString()} FCFA
                </div>
              </div>
              <div style={{ fontSize: '32px', opacity: 0.8 }}>📉</div>
            </div>
          </div>

          <div className="card" style={{
            background: summary.balance >= 0
              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            border: 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Solde</div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>
                  {summary.balance.toLocaleString()} FCFA
                </div>
              </div>
              <div style={{ fontSize: '32px', opacity: 0.8 }}>💼</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Transactions
            </h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">Tous types</option>
                <option value="income">Revenus</option>
                <option value="expense">Dépenses</option>
              </select>

              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">Toutes périodes</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
            </div>
          </div>

          {filteredTransactions.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Date</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Type</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Catégorie</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Description</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                        {new Date(transaction.transaction_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          backgroundColor: transaction.type === 'income' ? '#dcfce7' : '#fee2e2',
                          color: transaction.type === 'income' ? '#166534' : '#991b1b'
                        }}>
                          {transaction.type === 'income' ? 'Revenu' : 'Dépense'}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{getCategoryIcon(transaction.category)}</span>
                          <span style={{ color: '#475569', fontSize: '14px' }}>
                            {getCategoryLabel(transaction.category)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                        {transaction.description || '-'}
                      </td>
                      <td style={{
                        padding: '16px',
                        textAlign: 'right',
                        fontWeight: '700',
                        fontSize: '15px',
                        color: transaction.type === 'income' ? '#10b981' : '#ef4444'
                      }}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {parseFloat(transaction.amount).toLocaleString()} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
                Aucune transaction
              </div>
              <div style={{ color: '#64748b', marginBottom: '24px' }}>
                Commencez par ajouter votre première transaction
              </div>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <span>➕</span>
                <span>Ajouter une transaction</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
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
        }} onClick={() => setShowModal(false)}>
          <div className="card" style={{
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            margin: 0
          }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Nouvelle transaction
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="income">Revenu</option>
                    <option value="expense">Dépense</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Catégorie *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {formData.type === 'income' ? (
                      <>
                        <option value="subscription">Cotisation</option>
                        <option value="equipment_sale">Vente équipement</option>
                        <option value="subsidy">Subvention</option>
                        <option value="other">Autre</option>
                      </>
                    ) : (
                      <>
                        <option value="rent">Loyer</option>
                        <option value="utilities">Charges (eau, électricité)</option>
                        <option value="equipment_purchase">Achat équipement</option>
                        <option value="other">Autre</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Montant (FCFA) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="1"
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="transaction_date"
                    value={formData.transaction_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Description de la transaction..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#64748b',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-success">
                  <span>💾</span>
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default AccountingPage;
