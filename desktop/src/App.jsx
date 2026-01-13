import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import AttendancesPage from './pages/AttendancesPage';
import PaymentsPage from './pages/PaymentsPage';
import LicensesPage from './pages/LicensesPage';
import EmployeesPage from './pages/EmployeesPage';
import AccountingPage from './pages/AccountingPage';
import SettingsPage from './pages/SettingsPage';
import BeltPromotionsPage from './pages/BeltPromotionsPage';
import Layout from './components/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/attendances" element={<AttendancesPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/licenses" element={<LicensesPage />} />
          <Route path="/belt-promotions" element={<BeltPromotionsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/accounting" element={<AccountingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
