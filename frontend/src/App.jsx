import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import MembersRoutes from './pages/members/MembersRoutes';
import TreasuryPage from './pages/treasury/TreasuryPage';
import CommunicationsPage from './pages/communications/CommunicationsPage';
import RitualsPage from './pages/rituals/RitualsPage';
import LibraryPage from './pages/library/LibraryPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import LoadingScreen from './components/ui/LoadingScreen';

import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulación de carga inicial
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="members/*" element={<MembersRoutes />} />
          <Route path="treasury/*" element={<TreasuryPage />} />
          <Route path="communications/*" element={<CommunicationsPage />} />
          <Route path="rituals/*" element={<RitualsPage />} />
          <Route path="library/*" element={<LibraryPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
