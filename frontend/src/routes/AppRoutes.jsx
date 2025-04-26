import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Dashboard
import Dashboard from '../pages/Dashboard';

// Treasury Pages
import TreasuryDashboard from '../pages/treasury/TreasuryDashboard';
import PaymentsList from '../pages/treasury/PaymentsList';
import PaymentForm from '../pages/treasury/PaymentForm';
import InvoicesList from '../pages/treasury/InvoicesList';
import InvoiceDetail from '../pages/treasury/InvoiceDetail';
import FinancialReports from '../pages/treasury/FinancialReports';

// Members Pages
import MemberList from '../pages/members/MemberList';
import MemberDetail from '../pages/members/MemberDetail';
import MemberForm from '../pages/members/MemberForm';

// Ruta protegida que verifica autenticación
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Ruta que redirige a usuarios ya autenticados
const RedirectIfAuthenticated = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas con layout de autenticación */}
      <Route path="/login" element={
        <RedirectIfAuthenticated>
          <AuthLayout>
            <Login />
          </AuthLayout>
        </RedirectIfAuthenticated>
      } />
      <Route path="/forgot-password" element={
        <RedirectIfAuthenticated>
          <AuthLayout>
            <ForgotPassword />
          </AuthLayout>
        </RedirectIfAuthenticated>
      } />
      <Route path="/reset-password/:token" element={
        <RedirectIfAuthenticated>
          <AuthLayout>
            <ResetPassword />
          </AuthLayout>
        </RedirectIfAuthenticated>
      } />
      
      {/* Rutas protegidas con layout principal */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Rutas de Tesorería */}
      <Route path="/treasury" element={
        <ProtectedRoute>
          <MainLayout>
            <TreasuryDashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/treasury/payments" element={
        <ProtectedRoute>
          <MainLayout>
            <PaymentsList />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/treasury/payments/new" element={
        <ProtectedRoute>
          <MainLayout>
            <PaymentForm />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/treasury/payments/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <PaymentForm />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/treasury/invoices" element={
        <ProtectedRoute>
          <MainLayout>
            <InvoicesList />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/treasury/invoices/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <InvoiceDetail />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/treasury/invoices/new" element={
        <ProtectedRoute>
          <MainLayout>
            <InvoiceDetail />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/treasury/invoices/edit/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <InvoiceDetail />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/treasury/reports" element={
        <ProtectedRoute>
          <MainLayout>
            <FinancialReports />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Rutas de Miembros */}
      <Route path="/members" element={
        <ProtectedRoute>
          <MainLayout>
            <MemberList />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/members/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <MemberDetail />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/members/new" element={
        <ProtectedRoute>
          <MainLayout>
            <MemberForm />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/members/edit/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <MemberForm />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Ruta para cualquier otra dirección no definida */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
