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

  const handlePrint = async () => {
    try {
      const clubResponse = await api.getClub();
      const clubInfo = clubResponse;

      const printContent = document.createElement('div');
      printContent.innerHTML = `
        <html>
          <head>
            <title>Fiche Comptabilité</title>
            <style>
              @page {
                margin: 1.5cm;
              }
              body {
                font-family: Arial, sans-serif;
                color: #000;
                max-width: 100%;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 3px solid #0f172a;
              }
              .header-left h1 {
                margin: 0 0 5px 0;
                font-size: 24px;
                color: #0f172a;
                font-weight: 800;
              }
              .header-left .club-name {
                font-size: 14px;
                color: #64748b;
                font-weight: 600;
              }
              .header-right {
                text-align: right;
              }
              .header-right .date {
                font-size: 12px;
                color: #64748b;
                margin-bottom: 3px;
              }
              .header-right .period {
                font-size: 18px;
                font-weight: 800;
                color: #0f172a;
              }
              .stats-section {
                display: flex;
                gap: 20px;
                margin-bottom: 25px;
              }
              .stat-card {
                flex: 1;
                padding: 20px;
                text-align: center;
                border-radius: 8px;
                background: #ffffff;
              }
              .stat-card.income {
                border: 3px solid #10b981;
                background: #f0fdf4;
              }
              .stat-card.expense {
                border: 3px solid #ef4444;
                background: #fef2f2;
              }
              .stat-card.balance {
                border: 3px solid ${balance >= 0 ? '#10b981' : '#ef4444'};
                background: ${balance >= 0 ? '#f0fdf4' : '#fef2f2'};
              }
              .stat-card .label {
                font-size: 12px;
                color: #64748b;
                font-weight: 700;
                text-transform: uppercase;
                margin-bottom: 8px;
                letter-spacing: 0.5px;
              }
              .stat-card .value {
                font-size: 36px;
                font-weight: 900;
                margin: 5px 0;
                line-height: 1;
              }
              .stat-card.income .value {
                color: #059669;
              }
              .stat-card.expense .value {
                color: #dc2626;
              }
              .stat-card.balance .value {
                color: ${balance >= 0 ? '#059669' : '#dc2626'};
              }
              .stat-card .unit {
                font-size: 14px;
                color: #64748b;
                font-weight: 600;
              }
              .transactions-section {
                margin-bottom: 20px;
              }
              .transactions-section h2 {
                font-size: 16px;
                font-weight: 800;
                color: #0f172a;
                margin: 0 0 15px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .transactions-table {
                width: 100%;
                border-collapse: collapse;
                background: #ffffff;
              }
              .transactions-table thead {
                background: #f8fafc;
                border-bottom: 2px solid #e2e8f0;
              }
              .transactions-table th {
                padding: 12px 10px;
                text-align: left;
                font-size: 11px;
                font-weight: 700;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .transactions-table tbody tr {
                border-bottom: 1px solid #e2e8f0;
              }
              .transactions-table tbody tr:hover {
                background: #f8fafc;
              }
              .transactions-table td {
                padding: 10px;
                font-size: 12px;
                color: #475569;
              }
              .type-badge {
                display: inline-block;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.3px;
              }
              .type-badge.income {
                background: #d1fae5;
                color: #059669;
              }
              .type-badge.expense {
                background: #fee2e2;
                color: #dc2626;
              }
              .amount-cell {
                font-weight: 800;
                font-size: 13px;
              }
              .amount-cell.income {
                color: #10b981;
              }
              .amount-cell.expense {
                color: #ef4444;
              }
              .summary-section {
                margin-top: 25px;
                padding: 15px;
                background: #f8fafc;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
              }
              .summary-section h3 {
                margin: 0 0 12px 0;
                font-size: 14px;
                font-weight: 800;
                color: #0f172a;
                text-transform: uppercase;
              }
              .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e2e8f0;
                font-size: 13px;
              }
              .summary-row:last-child {
                border-bottom: none;
                padding-top: 12px;
                margin-top: 8px;
                border-top: 2px solid #0f172a;
                font-weight: 800;
                font-size: 15px;
              }
              .summary-row .label {
                color: #64748b;
                font-weight: 600;
              }
              .summary-row .value {
                font-weight: 700;
              }
              .summary-row.income .value {
                color: #10b981;
              }
              .summary-row.expense .value {
                color: #ef4444;
              }
              .summary-row.balance .value {
                color: ${balance >= 0 ? '#10b981' : '#ef4444'};
              }
              .footer {
                margin-top: 30px;
                padding-top: 15px;
                border-top: 2px solid #e2e8f0;
                text-align: center;
                font-size: 11px;
                color: #64748b;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="header-left">
                <h1>FICHE COMPTABILITÉ</h1>
                ${clubInfo ? `<div class="club-name">${clubInfo.name || clubInfo.club_name} - ${clubInfo.city}</div>` : ''}
              </div>
              <div class="header-right">
                <div class="date">Imprimé le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                <div class="period">Période complète</div>
              </div>
            </div>

            <div class="stats-section">
              <div class="stat-card income">
                <div class="label">Revenus Totaux</div>
                <div class="value">${Math.round(income).toLocaleString()}</div>
                <div class="unit">FCFA</div>
              </div>
              <div class="stat-card expense">
                <div class="label">Dépenses Totales</div>
                <div class="value">${Math.round(expense).toLocaleString()}</div>
                <div class="unit">FCFA</div>
              </div>
              <div class="stat-card balance">
                <div class="label">Solde Net</div>
                <div class="value">${Math.round(balance).toLocaleString()}</div>
                <div class="unit">FCFA</div>
              </div>
            </div>

            <div class="transactions-section">
              <h2>Historique des Transactions</h2>
              <table class="transactions-table">
                <thead>
                  <tr>
                    <th style="width: 10%">Type</th>
                    <th style="width: 18%">Catégorie</th>
                    <th style="width: 15%">Montant</th>
                    <th style="width: 17%">Date</th>
                    <th style="width: 40%">Description</th>
                  </tr>
                </thead>
                <tbody>
                  ${transactions.length > 0 ? transactions.map(transaction => `
                    <tr>
                      <td>
                        <span class="type-badge ${transaction.type}">
                          ${transaction.type === 'income' ? 'Revenu' : 'Dépense'}
                        </span>
                      </td>
                      <td style="font-weight: 600;">${transaction.category || '-'}</td>
                      <td class="amount-cell ${transaction.type}">
                        ${Math.round(parseFloat(transaction.amount)).toLocaleString()} F
                      </td>
                      <td>
                        ${new Date(transaction.transaction_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>${transaction.description || '-'}</td>
                    </tr>
                  `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">Aucune transaction enregistrée</td></tr>'}
                </tbody>
              </table>
            </div>

            <div class="summary-section">
              <h3>Résumé Financier</h3>
              <div class="summary-row income">
                <span class="label">Total des revenus :</span>
                <span class="value">+ ${Math.round(income).toLocaleString()} FCFA</span>
              </div>
              <div class="summary-row expense">
                <span class="label">Total des dépenses :</span>
                <span class="value">- ${Math.round(expense).toLocaleString()} FCFA</span>
              </div>
              <div class="summary-row balance">
                <span class="label">Solde net :</span>
                <span class="value">${Math.round(balance).toLocaleString()} FCFA</span>
              </div>
            </div>

            <div class="footer">
              ${clubInfo ? `${clubInfo.name || clubInfo.club_name} - ${clubInfo.city}` : ''} | Document généré le ${new Date().toLocaleDateString('fr-FR')} | ${transactions.length} transaction(s)
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
      }, 500);
    } catch (error) {
      console.error('Error printing accounting report:', error);
      alert('Erreur lors de la génération du document d\'impression');
    }
  };

  return (
    <div>

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
