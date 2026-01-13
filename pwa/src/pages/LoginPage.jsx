import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, getCurrentUser } from '../services/api';
import { useAuthStore } from '../utils/store';
import { startSync } from '../services/syncService';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/Toast';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      const user = await getCurrentUser();
      setUser(user);
      startSync();
      toast.success(`Bienvenue ${user.first_name} !`);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      const errorMessage = err.message || 'Erreur de connexion';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
        <div className="card">
          <h1 style={{ textAlign: 'center', marginBottom: '32px', color: '#1976d2' }}>NovaClub</h1>
        <h2 style={{ marginBottom: '24px' }}>Connexion</h2>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/register" style={{ color: '#1976d2' }}>Créer un compte</Link>
        </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
