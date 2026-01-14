import { useState, useEffect } from 'react';
import { api } from '../services/api';

function AccountingPage() {
  const [transactions, setTransactions] = useState([]);

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

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const balance = income - expense;

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
            Revenus
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>
            {income.toFixed(2)} FCFA
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
            Dépenses
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>
            {expense.toFixed(2)} FCFA
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
            Solde
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: balance >= 0 ? '#10b981' : '#ef4444'
          }}>
            {balance.toFixed(2)} FCFA
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Type</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Catégorie</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Montant</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Date</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: transaction.type === 'income' ? '#d1fae5' : '#fee2e2',
                    color: transaction.type === 'income' ? '#059669' : '#dc2626'
                  }}>
                    {transaction.type === 'income' ? 'Revenu' : 'Dépense'}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                  {transaction.category || '-'}
                </td>
                <td style={{
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: transaction.type === 'income' ? '#10b981' : '#ef4444'
                }}>
                  {parseFloat(transaction.amount).toFixed(2)} FCFA
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                  {new Date(transaction.transaction_date).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                  {transaction.description || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            Aucune transaction enregistrée
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountingPage;
