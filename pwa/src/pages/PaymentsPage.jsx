import { useEffect, useState } from 'react';
import { getAllFromStore, addToStore } from '../db';
import { queueChange } from '../services/syncService';
import { usePaymentStore, useMemberStore } from '../utils/store';
import Layout from '../components/Layout';

function PaymentsPage() {
  const { payments, setPayments, addPayment } = usePaymentStore();
  const { members, setMembers } = useMemberStore();
  const [showForm, setShowForm] = useState(false);
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

  return (
    <Layout>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1>Paiements</h1>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : 'Nouveau paiement'}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2 style={{ marginBottom: '20px' }}>Enregistrer un paiement</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Adhérent</label>
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
                  <label>Montant (FCFA)</label>
                  <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select name="payment_type" value={formData.payment_type} onChange={handleChange}>
                    <option value="monthly_fee">Cotisation mensuelle</option>
                    <option value="registration">Inscription</option>
                    <option value="equipment">Équipement</option>
                    <option value="license">Licence</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Méthode</label>
                  <select name="payment_method" value={formData.payment_method} onChange={handleChange}>
                    <option value="cash">Espèces</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Virement</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="payment_date" value={formData.payment_date} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Mois concerné</label>
                  <input type="month" name="month_year" value={formData.month_year} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Enregistrer</button>
            </form>
          </div>
        )}

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Adhérent</th>
                <th>Type</th>
                <th>Montant</th>
                <th>Méthode</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => {
                const member = members.find(m => m.id === payment.member_id);
                return (
                  <tr key={payment.id}>
                    <td>{payment.payment_date}</td>
                    <td>{member ? `${member.first_name} ${member.last_name}` : 'Inconnu'}</td>
                    <td>{payment.payment_type}</td>
                    <td>{payment.amount} FCFA</td>
                    <td>{payment.payment_method}</td>
                    <td>
                      <span className={`status-badge status-${payment.status}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {payments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              Aucun paiement enregistré
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default PaymentsPage;
