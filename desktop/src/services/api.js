const API_URL = 'http://localhost:3001/api';

let authToken = localStorage.getItem('token');

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return headers;
};

export const api = {
  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur de connexion');
    }

    const data = await response.json();
    setAuthToken(data.access_token);

    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  async getMembers() {
    const response = await fetch(`${API_URL}/members`, {
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération des membres');
    return response.json();
  },

  async createMember(memberData) {
    const response = await fetch(`${API_URL}/members`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(memberData),
    });

    if (!response.ok) throw new Error('Erreur lors de la création du membre');
    return response.json();
  },

  async updateMember(id, memberData) {
    const response = await fetch(`${API_URL}/members/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(memberData),
    });

    if (!response.ok) throw new Error('Erreur lors de la mise à jour du membre');
    return response.json();
  },

  async deleteMember(id) {
    const response = await fetch(`${API_URL}/members/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la suppression du membre');
  },

  async getAttendances() {
    const response = await fetch(`${API_URL}/attendances`, {
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération des présences');
    return response.json();
  },

  async createAttendance(attendanceData) {
    const response = await fetch(`${API_URL}/attendances`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(attendanceData),
    });

    if (!response.ok) throw new Error('Erreur lors de la création de la présence');
    return response.json();
  },

  async getPayments() {
    const response = await fetch(`${API_URL}/payments`, {
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération des paiements');
    return response.json();
  },

  async createPayment(paymentData) {
    const response = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) throw new Error('Erreur lors de la création du paiement');
    return response.json();
  },

  async getLicenses() {
    const response = await fetch(`${API_URL}/licenses`, {
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération des licences');
    return response.json();
  },

  async createLicense(licenseData) {
    const response = await fetch(`${API_URL}/licenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(licenseData),
    });

    if (!response.ok) throw new Error('Erreur lors de la création de la licence');
    return response.json();
  },

  async updateLicense(id, licenseData) {
    const response = await fetch(`${API_URL}/licenses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(licenseData),
    });

    if (!response.ok) throw new Error('Erreur lors de la mise à jour de la licence');
    return response.json();
  },

  async deleteLicense(id) {
    const response = await fetch(`${API_URL}/licenses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la suppression de la licence');
    return response.json();
  },

  async getEmployees() {
    const response = await fetch(`${API_URL}/employees`, {
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération des employés');
    return response.json();
  },

  async createEmployee(employeeData) {
    const response = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(employeeData),
    });

    if (!response.ok) throw new Error('Erreur lors de la création de l\'employé');
    return response.json();
  },

  async updateEmployee(id, employeeData) {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(employeeData),
    });

    if (!response.ok) throw new Error('Erreur lors de la mise à jour de l\'employé');
    return response.json();
  },

  async deleteEmployee(id) {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la suppression de l\'employé');
  },

  async getTransactions() {
    const response = await fetch(`${API_URL}/transactions`, {
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération des transactions');
    return response.json();
  },

  async createTransaction(transactionData) {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) throw new Error('Erreur lors de la création de la transaction');
    return response.json();
  },

  async getClub() {
    const response = await fetch(`${API_URL}/club`, {
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération du club');
    return response.json();
  },

  async updateClub(clubData) {
    const response = await fetch(`${API_URL}/club`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(clubData),
    });

    if (!response.ok) throw new Error('Erreur lors de la mise à jour du club');
    return response.json();
  },

  async getClubInfo() {
    return this.getClub();
  },

  async getCompetitions() {
    const response = await fetch(`${API_URL}/competitions`, {
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération des compétitions');
    return response.json();
  },

  async createCompetition(competitionData) {
    const response = await fetch(`${API_URL}/competitions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(competitionData),
    });

    if (!response.ok) throw new Error('Erreur lors de la création de la compétition');
    return response.json();
  },

  async updateCompetition(id, competitionData) {
    const response = await fetch(`${API_URL}/competitions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(competitionData),
    });

    if (!response.ok) throw new Error('Erreur lors de la mise à jour de la compétition');
    return response.json();
  },

  async deleteCompetition(id) {
    const response = await fetch(`${API_URL}/competitions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la suppression de la compétition');
    return response.json();
  },

  async getMemberCareer(memberId) {
    const response = await fetch(`${API_URL}/career/member/${memberId}`, {
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération de la carrière');
    return response.json();
  },

  async addCompetitionToMember(memberId, competitionData) {
    const response = await fetch(`${API_URL}/career/member/${memberId}/competition`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(competitionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de l\'ajout de la compétition');
    }
    return response.json();
  },

  async updateMemberCompetition(memberId, competitionId, resultData) {
    const response = await fetch(`${API_URL}/career/member/${memberId}/competition/${competitionId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(resultData),
    });

    if (!response.ok) throw new Error('Erreur lors de la mise à jour du résultat');
    return response.json();
  },

  async deleteMemberCompetition(memberId, competitionId) {
    const response = await fetch(`${API_URL}/career/member/${memberId}/competition/${competitionId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la suppression de la participation');
  },

  async addCareerEvent(memberId, eventData) {
    const response = await fetch(`${API_URL}/career/member/${memberId}/event`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(eventData),
    });

    if (!response.ok) throw new Error('Erreur lors de l\'ajout de l\'événement');
    return response.json();
  },

  async updateCareerEvent(memberId, eventId, eventData) {
    const response = await fetch(`${API_URL}/career/member/${memberId}/event/${eventId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(eventData),
    });

    if (!response.ok) throw new Error('Erreur lors de la mise à jour de l\'événement');
    return response.json();
  },

  async deleteCareerEvent(memberId, eventId) {
    const response = await fetch(`${API_URL}/career/member/${memberId}/event/${eventId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la suppression de l\'événement');
  },

  async getBeltPromotions() {
    const response = await fetch(`${API_URL}/belt-promotions`, {
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération des passages de grade');
    return response.json();
  },

  async createBeltPromotion(promotionData) {
    const response = await fetch(`${API_URL}/belt-promotions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(promotionData),
    });

    if (!response.ok) throw new Error('Erreur lors de la création du passage de grade');
    return response.json();
  },

  async createBulkBeltPromotions(promotionsData) {
    const response = await fetch(`${API_URL}/belt-promotions/bulk`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(promotionsData),
    });

    if (!response.ok) throw new Error('Erreur lors de la création des passages de grade');
    return response.json();
  },

  async updateBeltPromotionStatus(id, status) {
    const response = await fetch(`${API_URL}/belt-promotions/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) throw new Error('Erreur lors de la mise à jour du statut');
    return response.json();
  },

  async updateBeltPromotion(id, promotionData) {
    const response = await fetch(`${API_URL}/belt-promotions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(promotionData),
    });

    if (!response.ok) throw new Error('Erreur lors de la mise à jour du passage de grade');
    return response.json();
  },

  async deleteBeltPromotion(id) {
    const response = await fetch(`${API_URL}/belt-promotions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la suppression du passage de grade');
  },

  async getMemberMonthlyFees(memberId, year) {
    const response = await fetch(`${API_URL}/monthly-fees/member/${memberId}?year=${year}`, {
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération des cotisations');
    return response.json();
  },

  async markMonthlyFeePaid(memberId, year, month, amount, paymentMethod, notes) {
    const response = await fetch(`${API_URL}/monthly-fees/mark-paid`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        member_id: memberId,
        year,
        month,
        amount,
        payment_method: paymentMethod,
        notes
      }),
    });

    if (!response.ok) throw new Error('Erreur lors du marquage du paiement');
    return response.json();
  },

  async markMonthlyFeeUnpaid(memberId, year, month) {
    const response = await fetch(`${API_URL}/monthly-fees/mark-unpaid`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        member_id: memberId,
        year,
        month
      }),
    });

    if (!response.ok) throw new Error('Erreur lors du marquage comme non payé');
    return response.json();
  },

  async getMonthlyFeesStatistics(year) {
    const response = await fetch(`${API_URL}/monthly-fees/statistics/${year}`, {
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
    return response.json();
  },

  async resetDatabase() {
    const response = await fetch(`${API_URL}/club/reset-database`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors de la réinitialisation de la base de données');
    return response.json();
  },
};
