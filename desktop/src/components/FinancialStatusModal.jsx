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
  const [clubInfo, setClubInfo] = useState(null);

  const years = Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i);

  useEffect(() => {
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

  const handlePrint = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <html>
        <head>
          <title>État Financier - ${financialData.member.name}</title>
          <style>
            @page {
              margin: 2cm;
            }
            body {
              font-family: Arial, sans-serif;
              color: #000;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #0f172a;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              color: #0f172a;
            }
            .header .club-name {
              font-size: 18px;
              color: #64748b;
              margin-top: 5px;
            }
            .member-info {
              margin: 20px 0;
              padding: 15px;
              background: #f8fafc;
              border-left: 4px solid #3b82f6;
            }
            .member-info h2 {
              margin: 0 0 10px 0;
              font-size: 20px;
              color: #0f172a;
            }
            .member-info p {
              margin: 5px 0;
              font-size: 14px;
              color: #475569;
            }
            .stats {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin: 25px 0;
            }
            .stat-card {
              padding: 15px;
              text-align: center;
              border: 2px solid #e2e8f0;
              border-radius: 8px;
            }
            .stat-card .label {
              font-size: 12px;
              color: #64748b;
              font-weight: 600;
              margin-bottom: 5px;
            }
            .stat-card .value {
              font-size: 24px;
              font-weight: 800;
              color: #0f172a;
              margin: 5px 0;
            }
            .stat-card .amount {
              font-size: 12px;
              color: #64748b;
              font-weight: 600;
            }
            .months-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .months-table th,
            .months-table td {
              padding: 10px;
              text-align: left;
              border: 1px solid #e2e8f0;
            }
            .months-table th {
              background: #f8fafc;
              font-weight: 700;
              color: #0f172a;
            }
            .status-paid {
              color: #059669;
              font-weight: 600;
            }
            .status-unpaid {
              color: #dc2626;
              font-weight: 600;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              font-size: 12px;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ÉTAT FINANCIER</h1>
            ${clubInfo ? `<div class="club-name">${clubInfo.name || clubInfo.club_name} - ${clubInfo.city}</div>` : ''}
          </div>

          <div class="member-info">
            <h2>${financialData.member.name}</h2>
            <p><strong>Année:</strong> ${selectedYear}</p>
            <p><strong>Cotisation mensuelle:</strong> ${financialData.member.monthly_fee} FCFA</p>
            <p><strong>Date d'impression:</strong> ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="label">Total</div>
              <div class="value">${financialData.stats.total}</div>
              <div class="amount">${financialData.stats.totalAmount} FCFA</div>
            </div>
            <div class="stat-card">
              <div class="label">Payés</div>
              <div class="value">${financialData.stats.paid}</div>
              <div class="amount">${financialData.stats.paidAmount} FCFA</div>
            </div>
            <div class="stat-card">
              <div class="label">Non payés</div>
              <div class="value">${financialData.stats.unpaid}</div>
              <div class="amount">${financialData.stats.unpaidAmount} FCFA</div>
            </div>
            <div class="stat-card">
              <div class="label">Taux de paiement</div>
              <div class="value">${Math.round((financialData.stats.paid / financialData.stats.total) * 100)}%</div>
              <div class="amount">complété</div>
            </div>
          </div>

          <table class="months-table">
            <thead>
              <tr>
                <th>Mois</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date de paiement</th>
                <th>Méthode</th>
              </tr>
            </thead>
            <tbody>
              ${financialData.months.map(monthData => `
                <tr>
                  <td>${MONTHS[monthData.month - 1]}</td>
                  <td>${monthData.amount} FCFA</td>
                  <td class="${monthData.status === 'paid' ? 'status-paid' : 'status-unpaid'}">
                    ${monthData.status === 'paid' ? 'Payé' : 'Non payé'}
                  </td>
                  <td>${monthData.paid_date ? new Date(monthData.paid_date).toLocaleDateString('fr-FR') : '-'}</td>
                  <td>${monthData.payment_method ? PAYMENT_METHODS.find(m => m.value === monthData.payment_method)?.label : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            ${clubInfo ? `${clubInfo.name || clubInfo.club_name} - ${clubInfo.city}` : ''} | Document généré le ${new Date().toLocaleDateString('fr-FR')}
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px',
            marginBottom: '24px'
          }}>
            {financialData.months.map((monthData) => {
              const isPaid = monthData.status === 'paid';

              return (
                <div
                  key={monthData.month}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: isPaid ? '2px solid #10b981' : '2px solid #f87171',
                    backgroundColor: isPaid ? '#f0fdf4' : '#fef2f2',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#0f172a'
                    }}>
                      {MONTHS[monthData.month - 1]}
                    </span>
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: isPaid ? '#10b981' : '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isPaid ? (
                        <svg style={{ width: '13px', height: '13px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg style={{ width: '13px', height: '13px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: '14px' }}>
                    <p style={{
                      fontSize: '15px',
                      fontWeight: '700',
                      color: isPaid ? '#059669' : '#dc2626',
                      margin: 0,
                      marginBottom: '4px'
                    }}>
                      {monthData.amount} FCFA
                    </p>
                    {isPaid && monthData.paid_date && (
                      <p style={{
                        fontSize: '10px',
                        color: '#64748b',
                        margin: 0,
                        marginTop: '3px'
                      }}>
                        📅 {new Date(monthData.paid_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                      </p>
                    )}
                    {isPaid && monthData.payment_method && (
                      <p style={{
                        fontSize: '10px',
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
              💡 Pour enregistrer un paiement, utilisez la page "Paiements"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 32px',
          borderTop: '2px solid #f1f5f9',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <button
            onClick={handlePrint}
            style={{
              padding: '12px 32px',
              borderRadius: '8px',
              border: '2px solid #3b82f6',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '15px',
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
            <span>Imprimer</span>
          </button>
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
