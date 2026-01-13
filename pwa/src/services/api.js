const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE = `${API_URL}/api/v1`;

export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
};

export const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return await response.json();
};

export const login = async (email, password) => {
  const response = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  setAuthToken(response.access_token);
  return response;
};

export const register = async (data) => {
  const response = await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  setAuthToken(response.access_token);
  return response;
};

export const getCurrentUser = async () => {
  return await apiCall('/auth/me');
};

export const logout = () => {
  clearAuthToken();
  window.location.href = '/login';
};
