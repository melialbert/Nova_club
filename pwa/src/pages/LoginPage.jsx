import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getCurrentUser, saveAuthData } from '../services/api';
import { useAuthStore } from '../utils/store';
import { startSync } from '../services/syncService';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/Toast';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const toast = useToast();

  const getDetailedError = (err) => {
    const message = err.message || '';

    if (message.includes('Invalid credentials') || message.includes('Invalid login')) {
      return 'Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.';
    }
    if (message.includes('Network') || message.includes('fetch')) {
      return 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
    }
    if (message.includes('User not found')) {
      return 'Aucun compte trouvé avec cet email.';
    }
    if (message.includes('Too many requests')) {
      return 'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.';
    }

    return message || 'Erreur de connexion. Veuillez réessayer.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      const user = await getCurrentUser();

      if (navigator.onLine) {
        await saveAuthData(email, password, user);
      }

      setUser(user);

      if (navigator.onLine) {
        startSync();
      }

      toast.success(`Bienvenue ${user.first_name} !`);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      const errorMessage = getDetailedError(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }} />

        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '48px 40px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          zIndex: 1,
          animation: 'slideIn 0.5s ease-out'
        }}>
          <style>{`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-10px); }
              75% { transform: translateX(10px); }
            }
          `}</style>

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <img
              src="/logo-club.png"
              alt="NovaClub"
              style={{
                maxWidth: '120px',
                height: 'auto',
                marginBottom: '20px'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
              display: 'none'
            }}>
              NovaClub
            </h1>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '8px'
            }}>
              Connexion
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#64748b'
            }}>
              Connectez-vous pour accéder à votre espace
            </p>
          </div>

          {error && (
            <div style={{
              padding: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              animation: 'shake 0.5s ease-in-out'
            }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#dc2626',
                  marginBottom: '4px'
                }}>
                  Erreur de connexion
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#991b1b'
                }}>
                  {error}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '8px'
              }}>
                Adresse email
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px'
                }}>
                  📧
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@club.com"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    fontSize: '15px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#f8fafc'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.backgroundColor = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = '#f8fafc';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '8px'
              }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px'
                }}>
                  🔒
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 48px',
                    fontSize: '15px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#f8fafc'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.backgroundColor = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = '#f8fafc';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '4px'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(102, 126, 234, 0.4)',
                transform: loading ? 'scale(1)' : 'scale(1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 14px rgba(102, 126, 234, 0.4)';
                }
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  <style>{`
                    @keyframes spin {
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                  Connexion en cours...
                </>
              ) : (
                <>
                  🚀 Se connecter
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '32px',
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#64748b',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              Comptes de test disponibles
            </div>
            <div style={{
              fontSize: '12px',
              color: '#475569',
              lineHeight: '1.6'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Admin:</strong> admin@club.com / admin123
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Secrétaire:</strong> secretary@club.com / secretary123
              </div>
              <div>
                <strong>Coach:</strong> coach@club.com / coach123
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
