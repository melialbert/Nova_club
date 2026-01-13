import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../utils/store';
import { logout } from '../services/api';

function Layout({ children }) {
  const { user } = useAuthStore();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const allMenuItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: '📊', roles: ['ADMIN', 'SECRETARY', 'COACH'] },
    { path: '/members', label: 'Adhérents', icon: '👥', roles: ['ADMIN', 'SECRETARY', 'COACH'] },
    { path: '/licenses', label: 'Licences', icon: '🎫', roles: ['ADMIN', 'SECRETARY'] },
    { path: '/attendances', label: 'Présences', icon: '📋', roles: ['ADMIN', 'SECRETARY', 'COACH'] },
    { path: '/payments', label: 'Paiements', icon: '💳', roles: ['ADMIN', 'SECRETARY'] },
    { path: '/accounting', label: 'Comptabilité', icon: '💰', roles: ['ADMIN', 'SECRETARY'] },
    { path: '/employees', label: 'Employés', icon: '👔', roles: ['ADMIN'] },
    { path: '/settings', label: 'Paramètres', icon: '⚙️', roles: ['ADMIN'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{
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
          gap: '8px'
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
                overflow: 'hidden'
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
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '12px',
            marginBottom: '16px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '4px'
            }}>
              {user?.first_name} {user?.last_name}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#94a3b8'
            }}>
              {user?.email}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#3b82f6',
              marginTop: '8px',
              fontWeight: '600'
            }}>
              {user?.role === 'ADMIN' ? 'Administrateur' : user?.role === 'SECRETARY' ? 'Secrétaire' : 'Coach'}
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              borderRadius: '10px',
              color: '#f87171',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(248, 113, 113, 0.1)';
              e.target.style.borderColor = '#f87171';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = 'rgba(248, 113, 113, 0.3)';
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
        <header style={{
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
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: '4px 0 0 0'
              }}>
                {user?.club_id && `Club ID: ${user.club_id}`}
              </p>
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
  );
}

export default Layout;
