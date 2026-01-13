import { getDB, getAllFromStore } from '../db';

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

const saveAuthData = async (email, password, user) => {
  const db = await getDB();
  await db.put('auth_data', {
    key: 'credentials',
    email,
    password,
    user,
    updated_at: new Date().toISOString()
  });
};

const getAuthData = async () => {
  const db = await getDB();
  return await db.get('auth_data', 'credentials');
};

const clearAuthData = async () => {
  const db = await getDB();
  await db.delete('auth_data', 'credentials');
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

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      clearAuthToken();
      await clearAuthData();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
      const storeName = endpoint.split('/')[1];

      if (options.method === 'GET' || !options.method) {
        try {
          return await getAllFromStore(storeName);
        } catch {
          throw new Error('Mode hors ligne : Aucune donnée disponible');
        }
      }

      throw new Error('Mode hors ligne : Cette action nécessite une connexion internet');
    }
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setAuthToken(response.access_token);
    return response;
  } catch (error) {
    if (error.message.includes('Erreur réseau') || error.message.includes('Failed to fetch')) {
      const authData = await getAuthData();

      if (!authData || authData.email !== email || authData.password !== password) {
        throw new Error('Mode hors ligne : Identifiants incorrects ou première connexion impossible sans internet');
      }

      setAuthToken('offline_token');
      return { user: authData.user, access_token: 'offline_token' };
    }

    throw error;
  }
};

export const register = async (data) => {
  try {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    setAuthToken(response.access_token);
    return response;
  } catch (error) {
    if (error.message.includes('Mode hors ligne') || error.message.includes('Erreur réseau') || error.message.includes('Failed to fetch')) {
      throw new Error('Mode hors ligne : L\'inscription nécessite une connexion internet');
    }
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await apiCall('/auth/me');

    const authData = await getAuthData();
    if (authData) {
      await saveAuthData(authData.email, authData.password, user);
    }

    return user;
  } catch (error) {
    if (error.message.includes('Mode hors ligne') || error.message.includes('Erreur réseau') || error.message.includes('Failed to fetch')) {
      const authData = await getAuthData();
      if (!authData) {
        throw new Error('Mode hors ligne : Aucune donnée d\'authentification disponible');
      }
      return authData.user;
    }

    throw error;
  }
};

export const logout = async () => {
  clearAuthToken();
  await clearAuthData();
  window.location.href = '/login';
};

export { saveAuthData, getAuthData, clearAuthData };
