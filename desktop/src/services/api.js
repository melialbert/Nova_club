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
};
