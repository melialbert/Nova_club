import { useState, useEffect } from 'react';
import { api } from '../services/api';

function AccountingPage() {
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await api.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createTransaction({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      await loadTransactions();
      setShowModal(false);
      setFormData({
        type: 'expense',
        category: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        description: ''
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la création de la transaction');
    }
  };

  const filteredTransactions = transactions.filter(t =>
    filterType === 'all' || t.type === filterType
  );

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const balance = income - expense;

  const categories = {
    income: ['Cotisations', 'Licences', 'Stages', 'Compétitions', 'Dons', 'Subventions', 'Autres'],
    expense: ['Loyer', 'Salaires', 'Équipements', 'Assurances', 'Entretien', 'Marketing', 'Déplacements', 'Autres']
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <style>{`
        @media print {
          * {
            overflow: visible !important;
          }

          body, html {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          /* Cache tous les éléments de navigation et interface */
          .no-print,
          nav,
          aside,
          .sidebar {
            display: none !important;
          }

          /* Affiche l'en-tête d'impression */
          .print-header {
            display: block !important;
            margin-bottom: 32px !important;
            padding-bottom: 16px !important;
            border-bottom: 2px solid #e2e8f0 !important;
          }

          /* Conteneur principal optimisé pour l'impression */
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20mm !important;
            overflow: visible !important;
          }

          /* Optimisation des cards de statistiques */
          .stats-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 16px !important;
            margin-bottom: 24px !important;
            page-break-inside: avoid !important;
          }

          /* Table optimisée pour l'impression */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
            overflow: visible !important;
          }

          thead {
            display: table-header-group !important;
          }

          tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }

          th, td {
            padding: 12px !important;
            font-size: 12px !important;
          }

          /* Cache les ombres et effets */
          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }

          /* Optimisation des couleurs pour l'impression */
          .print-optimize {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        @media screen {
          .print-header {
            display: none;
          }
        }
      `}</style>

      <div className="print-header" style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
          Fiche Comptabilité
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Imprimé le {new Date().toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </p>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }} className="no-print">
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
          Comptabilité
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handlePrint}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '18px' }}>🖨️</span>
            Imprimer
          </button>
          <button
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span>
            Nouvelle Transaction
          </button>
        </div>
      </div>

      <div className="stats-grid print-optimize" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '2px solid #d1fae5'
        }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
            Revenus
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
            {Math.round(income).toLocaleString()} FCFA
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '2px solid #fee2e2'
        }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
            Dépenses
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444' }}>
            {Math.round(expense).toLocaleString()} FCFA
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: `2px solid ${balance >= 0 ? '#d1fae5' : '#fee2e2'}`
        }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
            Solde
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: balance >= 0 ? '#10b981' : '#ef4444'
          }}>
            {Math.round(balance).toLocaleString()} FCFA
          </div>
        </div>
      </div>

      <div className="print-optimize" style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
            Historique des transactions
          </h2>
          <div style={{ display: 'flex', gap: '8px' }} className="no-print">
            <button
              onClick={() => setFilterType('all')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: filterType === 'all' ? '#3b82f6' : 'white',
                color: filterType === 'all' ? 'white' : '#64748b',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilterType('income')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: filterType === 'income' ? '#10b981' : 'white',
                color: filterType === 'income' ? 'white' : '#64748b',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Revenus
            </button>
            <button
              onClick={() => setFilterType('expense')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: filterType === 'expense' ? '#ef4444' : 'white',
                color: filterType === 'expense' ? 'white' : '#64748b',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Dépenses
            </button>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catégorie</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Montant</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '20px 24px', fontSize: '14px' }}>
                  <span style={{
                    padding: '6px 14px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    backgroundColor: transaction.type === 'income' ? '#d1fae5' : '#fee2e2',
                    color: transaction.type === 'income' ? '#059669' : '#dc2626'
                  }}>
                    {transaction.type === 'income' ? 'Revenu' : 'Dépense'}
                  </span>
                </td>
                <td style={{ padding: '20px 24px', fontSize: '14px', color: '#475569', fontWeight: '500' }}>
                  {transaction.category || '-'}
                </td>
                <td style={{
                  padding: '20px 24px',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: transaction.type === 'income' ? '#10b981' : '#ef4444'
                }}>
                  {Math.round(parseFloat(transaction.amount)).toLocaleString()} FCFA
                </td>
                <td style={{ padding: '20px 24px', fontSize: '14px', color: '#64748b' }}>
                  {new Date(transaction.transaction_date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </td>
                <td style={{ padding: '20px 24px', fontSize: '14px', color: '#64748b' }}>
                  {transaction.description || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && (
          <div style={{ padding: '64px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
            <div style={{ fontSize: '16px', fontWeight: '500' }}>
              {filterType === 'all' ? 'Aucune transaction enregistrée' :
               filterType === 'income' ? 'Aucun revenu enregistré' : 'Aucune dépense enregistrée'}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                Nouvelle Transaction
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
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
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>
                  Type de transaction *
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                    style={{
                      flex: 1,
                      padding: '16px',
                      borderRadius: '8px',
                      border: `2px solid ${formData.type === 'income' ? '#10b981' : '#e2e8f0'}`,
                      backgroundColor: formData.type === 'income' ? '#d1fae5' : 'white',
                      color: formData.type === 'income' ? '#059669' : '#64748b',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>💰</span>
                    Revenu
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                    style={{
                      flex: 1,
                      padding: '16px',
                      borderRadius: '8px',
                      border: `2px solid ${formData.type === 'expense' ? '#ef4444' : '#e2e8f0'}`,
                      backgroundColor: formData.type === 'expense' ? '#fee2e2' : 'white',
                      color: formData.type === 'expense' ? '#dc2626' : '#64748b',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>💸</span>
                    Dépense
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>
                  Catégorie *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories[formData.type].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>
                  Montant (FCFA) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Ex: 15000"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Notes ou détails supplémentaires..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: 'white',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600'
                  }}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountingPage;
