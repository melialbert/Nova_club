import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../utils/store';
import { logout } from '../services/api';
import { useToast } from '../utils/useToast';
import { ToastContainer } from './Toast';

function Layout({ children }) {
  const { user } = useAuthStore();
  const location = useLocation();
  const toast = useToast();

  const isActive = (path) => location.pathname === path;

  const allMenuItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: '📊', roles: ['ADMIN', 'SECRETARY'] },
    { path: '/members', label: 'Adhérents', icon: '👥', roles: ['ADMIN', 'SECRETARY'] },
    { path: '/licenses', label: 'Licences', icon: '🎫', roles: ['ADMIN', 'SECRETARY'] },
    { path: '/attendances', label: 'Présences', icon: '📋', roles: ['ADMIN', 'SECRETARY'] },
    { path: '/payments', label: 'Paiements', icon: '💳', roles: ['ADMIN', 'SECRETARY'] },
    { path: '/accounting', label: 'Comptabilité', icon: '💰', roles: ['ADMIN', 'SECRETARY'] },
    { path: '/employees', label: 'Employés', icon: '👔', roles: ['ADMIN'] },
    { path: '/settings', label: 'Paramètres', icon: '⚙️', roles: ['ADMIN'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role?.toUpperCase()));

  return (
    <>
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <aside className="no-print" style={{
        width: '280px',
        backgroundColor: '#1e293b',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 12px rgba(0,0,0,0.1)',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          padding: '32px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          <img
            src="/logo-club.png"
            alt="NovaClub"
            style={{
              maxWidth: '120px',
              height: 'auto',
              marginBottom: '12px'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              const textLogo = e.target.nextElementSibling;
              if (textLogo) textLogo.style.display = 'block';
            }}
          />
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.5px',
            display: 'none'
          }}>
            NovaClub
          </div>
          <div style={{
            fontSize: '13px',
            color: '#94a3b8',
            marginTop: '4px'
          }}>
            Gestion de club
          </div>
        </div>

        <nav style={{
          flex: 1,
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: isActive(item.path) ? 'white' : '#cbd5e1',
                backgroundColor: isActive(item.path) ? '#3b82f6' : 'transparent',
                fontWeight: isActive(item.path) ? '600' : '500',
                fontSize: '15px',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                  e.target.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#cbd5e1';
                }
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span>{item.label}</span>
              {isActive(item.path) && (
                <div style={{
                  position: 'absolute',
                  right: '8px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: '#60a5fa'
                }} />
              )}
            </Link>
          ))}
        </nav>

        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0
        }}>
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '10px',
            marginBottom: '12px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '2px'
            }}>
              {user?.first_name} {user?.last_name}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#94a3b8',
              marginBottom: '4px'
            }}>
              {user?.email}
            </div>
            <div style={{
              fontSize: '10px',
              color: '#3b82f6',
              fontWeight: '600'
            }}>
              {user?.role === 'ADMIN' ? 'Administrateur' : 'Secrétaire'}
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#ef4444',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#dc2626';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ef4444';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
            }}
          >
            <span>🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <div style={{
        flex: 1,
        marginLeft: '280px',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <header className="no-print" style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          padding: '20px 32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#0f172a',
                margin: 0
              }}>
                {menuItems.find(item => item.path === location.pathname)?.label || 'NovaClub'}
              </h1>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  display: 'inline-block'
                }}></span>
                En ligne
              </div>
            </div>
          </div>
        </header>

        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '32px'
        }}>
          {children}
        </main>
      </div>
    </div>
    </>
  );
}

export default Layout;
