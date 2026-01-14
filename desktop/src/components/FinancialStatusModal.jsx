import { useState, useEffect } from 'react';
import { api } from '../services/api';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Espèces' },
  { value: 'card', label: 'Carte bancaire' },
  { value: 'check', label: 'Chèque' },
  { value: 'transfer', label: 'Virement' }
];

export default function FinancialStatusModal({ member, onClose }) {
  const [financialData, setFinancialData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  const years = Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i);

  useEffect(() => {
    loadFinancialData();
  }, [member.id, selectedYear]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const data = await api.getMemberMonthlyFees(member.id, selectedYear);
      setFinancialData(data);
    } catch (error) {
      console.error('Error loading financial data:', error);
      alert('Erreur lors du chargement des données financières');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePayment = async (month) => {
    const monthData = financialData.months[month - 1];

    try {
      if (monthData.status === 'paid') {
        await api.markMonthlyFeeUnpaid(member.id, selectedYear, month);
      } else {
        await api.markMonthlyFeePaid(member.id, selectedYear, month, monthData.amount, paymentMethod, notes);
      }

      await loadFinancialData();
      setNotes('');
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Erreur lors de la mise à jour du paiement');
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <p style={{ fontSize: '18px', color: '#64748b' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '2px solid #f1f5f9',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#0f172a',
              margin: 0,
              marginBottom: '8px'
            }}>
              💰 État Financier
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#475569',
              margin: 0,
              fontWeight: '600'
            }}>
              {financialData.member.name}
            </p>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: 0,
              marginTop: '4px'
            }}>
              Cotisation: <strong style={{ color: '#10b981' }}>{financialData.member.monthly_fee} FCFA</strong> / mois
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#fecaca';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#fee2e2';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '32px',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Filters */}
          <div style={{
            marginBottom: '32px',
            display: 'flex',
            gap: '20px',
            alignItems: 'flex-end'
          }}>
            <div style={{ flex: '0 0 150px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#475569',
                marginBottom: '8px'
              }}>
                Année
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                style={{
                  width: '100%',
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
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#475569',
                marginBottom: '8px'
              }}>
                Méthode de paiement
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{
                  width: '100%',
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
                {PAYMENT_METHODS.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              padding: '20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              textAlign: 'center',
              border: '2px solid #cbd5e1'
            }}>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, fontWeight: '600' }}>Total</p>
              <p style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '8px 0' }}>
                {financialData.stats.total}
              </p>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, fontWeight: '600' }}>
                {financialData.stats.totalAmount} FCFA
              </p>
            </div>

            <div style={{
              padding: '20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              textAlign: 'center',
              border: '2px solid #10b981'
            }}>
              <p style={{ fontSize: '13px', color: '#065f46', margin: 0, fontWeight: '600' }}>Payés</p>
              <p style={{ fontSize: '32px', fontWeight: '800', color: '#059669', margin: '8px 0' }}>
                {financialData.stats.paid}
              </p>
              <p style={{ fontSize: '14px', color: '#065f46', margin: 0, fontWeight: '600' }}>
                {financialData.stats.paidAmount} FCFA
              </p>
            </div>

            <div style={{
              padding: '20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              textAlign: 'center',
              border: '2px solid #ef4444'
            }}>
              <p style={{ fontSize: '13px', color: '#991b1b', margin: 0, fontWeight: '600' }}>Non payés</p>
              <p style={{ fontSize: '32px', fontWeight: '800', color: '#dc2626', margin: '8px 0' }}>
                {financialData.stats.unpaid}
              </p>
              <p style={{ fontSize: '14px', color: '#991b1b', margin: 0, fontWeight: '600' }}>
                {financialData.stats.unpaidAmount} FCFA
              </p>
            </div>

            <div style={{
              padding: '20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              textAlign: 'center',
              border: '2px solid #3b82f6'
            }}>
              <p style={{ fontSize: '13px', color: '#1e3a8a', margin: 0, fontWeight: '600' }}>Taux</p>
              <p style={{ fontSize: '32px', fontWeight: '800', color: '#2563eb', margin: '8px 0' }}>
                {Math.round((financialData.stats.paid / financialData.stats.total) * 100)}%
              </p>
              <p style={{ fontSize: '14px', color: '#1e3a8a', margin: 0, fontWeight: '600' }}>
                de paiement
              </p>
            </div>
          </div>

          {/* Months Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {financialData.months.map((monthData) => {
              const isPaid = monthData.status === 'paid';

              return (
                <div
                  key={monthData.month}
                  onClick={() => handleTogglePayment(monthData.month)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: isPaid ? '3px solid #10b981' : '3px solid #f87171',
                    backgroundColor: isPaid ? '#f0fdf4' : '#fef2f2',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#0f172a'
                    }}>
                      {MONTHS[monthData.month - 1]}
                    </span>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: isPaid ? '#10b981' : '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isPaid ? (
                        <svg style={{ width: '16px', height: '16px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg style={{ width: '16px', height: '16px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: '14px' }}>
                    <p style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: isPaid ? '#059669' : '#dc2626',
                      margin: 0,
                      marginBottom: '4px'
                    }}>
                      {monthData.amount} FCFA
                    </p>
                    {isPaid && monthData.paid_date && (
                      <p style={{
                        fontSize: '12px',
                        color: '#64748b',
                        margin: 0,
                        marginTop: '4px'
                      }}>
                        📅 {new Date(monthData.paid_date).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    {isPaid && monthData.payment_method && (
                      <p style={{
                        fontSize: '12px',
                        color: '#64748b',
                        margin: 0,
                        marginTop: '2px'
                      }}>
                        💳 {PAYMENT_METHODS.find(m => m.value === monthData.payment_method)?.label}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div style={{
            padding: '16px 20px',
            borderRadius: '12px',
            backgroundColor: '#dbeafe',
            border: '2px solid #3b82f6'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#1e40af',
              margin: 0,
              fontWeight: '600'
            }}>
              💡 Cliquez sur un mois pour basculer son statut de paiement
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 32px',
          borderTop: '2px solid #f1f5f9',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 32px',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              backgroundColor: 'white',
              color: '#475569',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f1f5f9';
              e.target.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#e2e8f0';
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
