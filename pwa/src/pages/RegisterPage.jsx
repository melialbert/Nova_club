import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, getCurrentUser } from '../services/api';
import { useAuthStore } from '../utils/store';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/Toast';

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    club_name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      const user = await getCurrentUser();
      setUser(user);
      toast.success('Inscription réussie ! Bienvenue sur NovaClub.');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      <div className="container" style={{ maxWidth: '500px', marginTop: '50px' }}>
        <div className="card">
        <h1 style={{ textAlign: 'center', marginBottom: '32px', color: '#1976d2' }}>NovaClub</h1>
        <h2 style={{ marginBottom: '24px' }}>Créer un compte</h2>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom du club</label>
            <input
              type="text"
              name="club_name"
              value={formData.club_name}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#1976d2' }}>Déjà un compte ? Se connecter</Link>
        </div>
      </div>
      </div>
    </>
  );
}

export default RegisterPage;
