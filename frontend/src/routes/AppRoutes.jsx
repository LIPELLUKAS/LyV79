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

// Members
import MemberList from '../pages/members/MemberList';
import MemberDetail from '../pages/members/MemberDetail';
import MemberForm from '../pages/members/MemberForm';

// Treasury
import TreasuryDashboard from '../pages/treasury/TreasuryDashboard';
import PaymentsList from '../pages/treasury/PaymentsList';
import PaymentForm from '../pages/treasury/PaymentForm';
import InvoicesList from '../pages/treasury/InvoicesList';
import InvoiceDetail from '../pages/treasury/InvoiceDetail';
import FinancialReports from '../pages/treasury/FinancialReports';

// Communications
import NotificationCenter from '../pages/communications/NotificationCenter';
import EventsList from '../pages/communications/EventsList';
import EventDetail from '../pages/communications/EventDetail';
import EventForm from '../pages/communications/EventForm';
import MessagingCenter from '../pages/communications/MessagingCenter';
import MessageDetail from '../pages/communications/MessageDetail';
import MessageForm from '../pages/communications/MessageForm';

// Rituals
import RitualPlansList from '../pages/rituals/RitualPlansList';
import RitualPlanDetail from '../pages/rituals/RitualPlanDetail';
import RitualPlanForm from '../pages/rituals/RitualPlanForm';
import RitualRoles from '../pages/rituals/RitualRoles';
import RitualWorks from '../pages/rituals/RitualWorks';
import RitualMinutes from '../pages/rituals/RitualMinutes';

// Library
import LibraryDashboard from '../pages/library/LibraryDashboard';
import CategoryList from '../pages/library/CategoryList';
import CategoryDetail from '../pages/library/CategoryDetail';
import CategoryForm from '../pages/library/CategoryForm';
import DocumentList from '../pages/library/DocumentList';
import DocumentDetail from '../pages/library/DocumentDetail';
import DocumentForm from '../pages/library/DocumentForm';

// Admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import SystemLogs from '../pages/admin/SystemLogs';
import LodgeConfiguration from '../pages/admin/LodgeConfiguration';
import BackupConfiguration from '../pages/admin/BackupConfiguration';
import Backups from '../pages/admin/Backups';
import SystemHealth from '../pages/admin/SystemHealth';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, isAuthenticated, userRole } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Navigate to="/login" />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
      </Route>
      
      {/* Main App Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Members Routes */}
        <Route path="members">
          <Route index element={<MemberList />} />
          <Route path=":id" element={<MemberDetail />} />
          <Route path="new" element={<MemberForm />} />
          <Route path="edit/:id" element={<MemberForm />} />
        </Route>
        
        {/* Treasury Routes */}
        <Route path="treasury">
          <Route index element={<TreasuryDashboard />} />
          <Route path="payments">
            <Route index element={<PaymentsList />} />
            <Route path="new" element={<PaymentForm />} />
            <Route path="edit/:id" element={<PaymentForm />} />
          </Route>
          <Route path="invoices">
            <Route index element={<InvoicesList />} />
            <Route path=":id" element={<InvoiceDetail />} />
          </Route>
          <Route path="reports" element={<FinancialReports />} />
        </Route>
        
        {/* Communications Routes */}
        <Route path="communications">
          <Route path="notifications" element={<NotificationCenter />} />
          <Route path="events">
            <Route index element={<EventsList />} />
            <Route path=":id" element={<EventDetail />} />
            <Route path="new" element={<EventForm />} />
            <Route path="edit/:id" element={<EventForm />} />
          </Route>
          <Route path="messages">
            <Route index element={<MessagingCenter />} />
            <Route path=":id" element={<MessageDetail />} />
            <Route path="new" element={<MessageForm />} />
            <Route path="reply/:id" element={<MessageForm />} />
          </Route>
        </Route>
        
        {/* Rituals Routes */}
        <Route path="rituals">
          <Route index element={<RitualPlansList />} />
          <Route path=":id" element={<RitualPlanDetail />} />
          <Route path="new" element={<RitualPlanForm />} />
          <Route path="edit/:id" element={<RitualPlanForm />} />
          <Route path=":planId/roles" element={<RitualRoles />} />
          <Route path=":planId/works" element={<RitualWorks />} />
          <Route path=":planId/minutes" element={<RitualMinutes />} />
        </Route>
        
        {/* Library Routes */}
        <Route path="library">
          <Route index element={<LibraryDashboard />} />
          <Route path="categories">
            <Route index element={<CategoryList />} />
            <Route path=":id" element={<CategoryDetail />} />
            <Route path="new" element={<CategoryForm />} />
            <Route path="edit/:id" element={<CategoryForm />} />
          </Route>
          <Route path="documents">
            <Route index element={<DocumentList />} />
            <Route path=":id" element={<DocumentDetail />} />
            <Route path="new" element={<DocumentForm />} />
            <Route path="edit/:id" element={<DocumentForm />} />
          </Route>
        </Route>
        
        {/* Admin Routes */}
        <Route path="admin">
          <Route index element={
            <ProtectedRoute requiredRole="worshipful_master">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="system-logs" element={
            <ProtectedRoute requiredRole="worshipful_master">
              <SystemLogs />
            </ProtectedRoute>
          } />
          <Route path="lodge-configuration" element={
            <ProtectedRoute requiredRole="worshipful_master">
              <LodgeConfiguration />
            </ProtectedRoute>
          } />
          <Route path="backup-configuration" element={
            <ProtectedRoute requiredRole="worshipful_master">
              <BackupConfiguration />
            </ProtectedRoute>
          } />
          <Route path="backups" element={
            <ProtectedRoute requiredRole="worshipful_master">
              <Backups />
            </ProtectedRoute>
          } />
          <Route path="system-health" element={
            <ProtectedRoute requiredRole="worshipful_master">
              <SystemHealth />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Catch-all redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
