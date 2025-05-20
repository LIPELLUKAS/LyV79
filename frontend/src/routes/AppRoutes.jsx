import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import RoleBasedAccess from '../components/security/RoleBasedAccess';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Páginas de autenticación
import LoginPage from '../pages/auth/Login';
import ForgotPasswordPage from '../pages/auth/ForgotPassword';
import ResetPasswordPage from '../pages/auth/ResetPassword';
import TwoFactorAuthPage from '../pages/auth/TwoFactorAuthPage';

// Páginas principales
import DashboardPage from '../pages/dashboard/DashboardPage';
import ProfilePage from '../pages/profile/ProfilePage';

// Páginas de miembros
import MemberListPage from '../pages/members/MemberList';
import MemberDetailPage from '../pages/members/MemberDetail';
import MemberFormPage from '../pages/members/MemberForm';

// Páginas de tesorería
import PaymentsListPage from '../pages/treasury/PaymentsList';
import PaymentDetailPage from '../pages/treasury/PaymentDetail';
import PaymentFormPage from '../pages/treasury/PaymentForm';

// Páginas de comunicaciones
import MessagingCenterPage from '../pages/communications/MessagingCenter';
import NewMessagePage from '../pages/communications/NewMessage';
import MessageDetailPage from '../pages/communications/MessageDetail';

// Páginas de rituales
import RitualsListPage from '../pages/rituals/RitualsList';
import RitualDetailPage from '../pages/rituals/RitualDetail';
import RitualFormPage from '../pages/rituals/RitualForm';

// Páginas de biblioteca
import LibraryPage from '../pages/library/LibraryPage';
import DocumentDetailPage from '../pages/library/DocumentDetail';
import UploadDocumentPage from '../pages/library/UploadDocumentPage';

// Páginas de administración
import AdminDashboardPage from '../pages/admin/AdminDashboard';
import SystemSettingsPage from '../pages/admin/SystemSettings';
import UserManagementPage from '../pages/admin/UserManagement';

// Página de error 404
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  // Redirigir a login si no está autenticado, o a dashboard si ya está autenticado
  const AuthRoute = ({ children }) => {
    return !isAuthenticated ? children : <Navigate to="/dashboard" />;
  };

  // Redirigir a dashboard si está autenticado, o a login si no está autenticado
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Routes>
      {/* Rutas de autenticación */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Navigate to="/login" />} />
        <Route path="login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="forgot-password" element={<AuthRoute><ForgotPasswordPage /></AuthRoute>} />
        <Route path="reset-password/:uid/:token" element={<AuthRoute><ResetPasswordPage /></AuthRoute>} />
        <Route path="verify-2fa" element={<AuthRoute><TwoFactorAuthPage /></AuthRoute>} />
      </Route>

      {/* Rutas protegidas */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Rutas de miembros */}
        <Route path="members">
          <Route index element={
            <RoleBasedAccess allowedOffices={['Venerable Maestro', 'Secretario']} requireAdmin={false}>
              <MemberListPage />
            </RoleBasedAccess>
          } />
          <Route path=":id" element={<MemberDetailPage />} />
          <Route path="new" element={
            <RoleBasedAccess allowedOffices={['Venerable Maestro', 'Secretario']} requireAdmin={false}>
              <MemberFormPage />
            </RoleBasedAccess>
          } />
          <Route path="edit/:id" element={
            <RoleBasedAccess allowedOffices={['Venerable Maestro', 'Secretario']} requireAdmin={false}>
              <MemberFormPage />
            </RoleBasedAccess>
          } />
        </Route>

        {/* Rutas de tesorería */}
        <Route path="treasury">
          <Route index element={
            <RoleBasedAccess allowedOffices={['Venerable Maestro', 'Tesorero', 'Secretario']} requireAdmin={false}>
              <PaymentsListPage />
            </RoleBasedAccess>
          } />
          <Route path="payments/detail/:id" element={
            <RoleBasedAccess allowedOffices={['Venerable Maestro', 'Tesorero', 'Secretario']} requireAdmin={false}>
              <PaymentDetailPage />
            </RoleBasedAccess>
          } />
          <Route path="payments/new" element={
            <RoleBasedAccess allowedOffices={['Venerable Maestro', 'Tesorero']} requireAdmin={false}>
              <PaymentFormPage />
            </RoleBasedAccess>
          } />
          <Route path="payments/edit/:id" element={
            <RoleBasedAccess allowedOffices={['Venerable Maestro', 'Tesorero']} requireAdmin={false}>
              <PaymentFormPage />
            </RoleBasedAccess>
          } />
        </Route>

        {/* Rutas de comunicaciones */}
        <Route path="communications">
          <Route index element={<Navigate to="/communications/messages" />} />
          <Route path="messages" element={<MessagingCenterPage />} />
          <Route path="messages/new" element={<NewMessagePage />} />
          <Route path="messages/:id" element={<MessageDetailPage />} />
        </Route>

        {/* Rutas de rituales */}
        <Route path="rituals">
          <Route index element={<RitualsListPage />} />
          <Route path="detail/:id" element={<RitualDetailPage />} />
          <Route path="new" element={
            <RoleBasedAccess allowedOffices={['Venerable Maestro', 'Segundo Vigilante']} requireAdmin={false}>
              <RitualFormPage />
            </RoleBasedAccess>
          } />
          <Route path="edit/:id" element={
            <RoleBasedAccess allowedOffices={['Venerable Maestro', 'Segundo Vigilante']} requireAdmin={false}>
              <RitualFormPage />
            </RoleBasedAccess>
          } />
        </Route>

        {/* Rutas de biblioteca */}
        <Route path="library">
          <Route index element={<LibraryPage />} />
          <Route path="document/:id" element={<DocumentDetailPage />} />
          <Route path="upload" element={
            <RoleBasedAccess allowedOffices={['Venerable Maestro', 'Secretario', 'Orador']} requireAdmin={false}>
              <UploadDocumentPage />
            </RoleBasedAccess>
          } />
        </Route>

        {/* Rutas de administración */}
        <Route path="admin">
          <Route index element={
            <RoleBasedAccess requireAdmin={true}>
              <AdminDashboardPage />
            </RoleBasedAccess>
          } />
          <Route path="settings" element={
            <RoleBasedAccess requireAdmin={true}>
              <SystemSettingsPage />
            </RoleBasedAccess>
          } />
          <Route path="users" element={
            <RoleBasedAccess requireAdmin={true}>
              <UserManagementPage />
            </RoleBasedAccess>
          } />
        </Route>
      </Route>

      {/* Ruta 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
