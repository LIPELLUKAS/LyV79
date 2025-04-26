import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Contextos
import { AuthProvider } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Páginas de autenticación
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Páginas principales
import Dashboard from './pages/Dashboard';

// Páginas de miembros
import MemberList from './pages/members/MemberList';
import MemberDetail from './pages/members/MemberDetail';
import MemberForm from './pages/members/MemberForm';

// Rutas protegidas
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ConfigProvider>
          <NotificationProvider>
            <Routes>
              {/* Rutas de autenticación */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password/:token" element={<ResetPassword />} />
              </Route>
              
              {/* Rutas protegidas */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                
                {/* Rutas de miembros */}
                <Route path="members">
                  <Route index element={<MemberList />} />
                  <Route path=":id" element={<MemberDetail />} />
                  <Route path="new" element={<MemberForm />} />
                  <Route path="edit/:id" element={<MemberForm />} />
                </Route>
                
                {/* Rutas de tesorería */}
                <Route path="treasury">
                  {/* Aquí se añadirán las rutas de tesorería */}
                </Route>
                
                {/* Rutas de comunicaciones */}
                <Route path="communications">
                  {/* Aquí se añadirán las rutas de comunicaciones */}
                </Route>
                
                {/* Rutas de rituales */}
                <Route path="rituals">
                  {/* Aquí se añadirán las rutas de rituales */}
                </Route>
                
                {/* Rutas de biblioteca */}
                <Route path="library">
                  {/* Aquí se añadirán las rutas de biblioteca */}
                </Route>
                
                {/* Rutas de administración */}
                <Route path="admin">
                  {/* Aquí se añadirán las rutas de administración */}
                </Route>
              </Route>
              
              {/* Ruta por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </ConfigProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
