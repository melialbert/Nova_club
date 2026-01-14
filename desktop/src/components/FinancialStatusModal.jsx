import { useState, useEffect } from 'react';
import api from '../services/api';

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">État Financier</h2>
            <p className="text-gray-600 mt-1">{financialData.member.name}</p>
            <p className="text-sm text-gray-500">Cotisation mensuelle: {financialData.member.monthly_fee}€</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="mb-6 flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Année
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border rounded px-3 py-2"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Méthode de paiement (pour nouveaux paiements)
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="grid grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-800">{financialData.stats.total}</p>
                <p className="text-xs text-gray-500">{financialData.stats.totalAmount}€</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Payés</p>
                <p className="text-2xl font-bold text-green-600">{financialData.stats.paid}</p>
                <p className="text-xs text-gray-500">{financialData.stats.paidAmount}€</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Non payés</p>
                <p className="text-2xl font-bold text-red-600">{financialData.stats.unpaid}</p>
                <p className="text-xs text-gray-500">{financialData.stats.unpaidAmount}€</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Taux</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round((financialData.stats.paid / financialData.stats.total) * 100)}%
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {financialData.months.map((monthData) => {
              const isPaid = monthData.status === 'paid';

              return (
                <div
                  key={monthData.month}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    isPaid
                      ? 'border-green-500 bg-green-50 hover:bg-green-100'
                      : 'border-red-300 bg-red-50 hover:bg-red-100'
                  }`}
                  onClick={() => handleTogglePayment(monthData.month)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700">
                      {MONTHS[monthData.month - 1]}
                    </span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isPaid ? 'bg-green-500' : 'bg-red-400'
                    }`}>
                      {isPaid ? (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="text-gray-600">{monthData.amount}€</p>
                    {isPaid && monthData.paid_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(monthData.paid_date).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    {isPaid && monthData.payment_method && (
                      <p className="text-xs text-gray-500">
                        {PAYMENT_METHODS.find(m => m.value === monthData.payment_method)?.label}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Cliquez sur un mois pour basculer son statut de paiement
            </p>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
