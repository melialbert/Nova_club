import { Link } from 'react-router-dom';
import { useAuthStore } from '../utils/store';
import { logout } from '../services/api';

function Layout({ children }) {
  const { user } = useAuthStore();

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <div className="logo">NovaClub</div>
          <nav className="nav">
            <Link to="/dashboard">Tableau de bord</Link>
            <Link to="/members">Adhérents</Link>
            <Link to="/payments">Paiements</Link>
            <button onClick={logout} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
              Déconnexion
            </button>
          </nav>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}

export default Layout;
