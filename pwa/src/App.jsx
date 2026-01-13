import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore, useAppStore } from './utils/store';
import { startSync, stopSync } from './services/syncService';
import { getAuthToken, getCurrentUser } from './services/api';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import LicensesPage from './pages/LicensesPage';
import AttendancesPage from './pages/AttendancesPage';
import PaymentsPage from './pages/PaymentsPage';
import SettingsPage from './pages/SettingsPage';
import EmployeesPage from './pages/EmployeesPage';

function App() {
  const { isAuthenticated, setUser } = useAuthStore();
  const { setOnline } = useAppStore();

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      getCurrentUser()
        .then(user => {
          setUser(user);
          startSync();
        })
        .catch(() => {
          setUser(null);
        });
    }

    return () => {
      stopSync();
    };
  }, [setUser]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/members" element={isAuthenticated ? <MembersPage /> : <Navigate to="/login" />} />
        <Route path="/licenses" element={isAuthenticated ? <LicensesPage /> : <Navigate to="/login" />} />
        <Route path="/attendances" element={isAuthenticated ? <AttendancesPage /> : <Navigate to="/login" />} />
        <Route path="/payments" element={isAuthenticated ? <PaymentsPage /> : <Navigate to="/login" />} />
        <Route path="/employees" element={isAuthenticated ? <EmployeesPage /> : <Navigate to="/login" />} />
        <Route path="/settings" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
