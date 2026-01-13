import { useState, useEffect } from 'react';
import { api } from '../services/api';

function PaymentsPage() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await api.getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const total = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
          Paiements
        </h2>
        <div style={{
          display: 'inline-block',
          padding: '8px 16px',
          backgroundColor: '#10b981',
          color: 'white',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: '700'
        }}>
          Total: {total.toFixed(2)}€
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
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Adhérent</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Montant</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Date</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Méthode</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  {payment.first_name} {payment.last_name}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                  {parseFloat(payment.amount).toFixed(2)}€
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                  {new Date(payment.payment_date).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                  {payment.payment_method || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            Aucun paiement enregistré
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentsPage;
