import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Páginas de autenticación
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Verify2FA from '../pages/auth/Verify2FA';

// Páginas principales
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';

// Páginas de miembros (secretaría)
import MembersList from '../pages/members/MembersList';
import MemberDetail from '../pages/members/MemberDetail';
import MemberForm from '../pages/members/MemberForm';
import AttendanceRegister from '../pages/members/AttendanceRegister';

// Páginas de tesorería
import FinancialDashboard from '../pages/treasury/FinancialDashboard';
import PaymentsList from '../pages/treasury/PaymentsList';
import InvoicesList from '../pages/treasury/InvoicesList';
import InvoiceDetail from '../pages/treasury/InvoiceDetail';
import PaymentForm from '../pages/treasury/PaymentForm';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  
  return children;
};

// Componente para rutas de autenticación
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas de autenticación */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        } />
        <Route path="forgot-password" element={
          <AuthRoute>
            <ForgotPassword />
          </AuthRoute>
        } />
        <Route path="reset-password/:token" element={
          <AuthRoute>
            <ResetPassword />
          </AuthRoute>
        } />
        <Route path="verify-2fa" element={<Verify2FA />} />
      </Route>
      
      {/* Rutas protegidas */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        
        {/* Rutas de miembros (secretaría) */}
        <Route path="members">
          <Route index element={<MembersList />} />
          <Route path=":id" element={<MemberDetail />} />
          <Route path="new" element={<MemberForm />} />
          <Route path="edit/:id" element={<MemberForm />} />
          <Route path="attendance" element={<AttendanceRegister />} />
        </Route>
        
        {/* Rutas de tesorería */}
        <Route path="treasury">
          <Route index element={<FinancialDashboard />} />
          <Route path="payments" element={<PaymentsList />} />
          <Route path="payments/new" element={<PaymentForm />} />
          <Route path="payments/edit/:id" element={<PaymentForm />} />
          <Route path="invoices" element={<InvoicesList />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
        </Route>
      </Route>
      
      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
