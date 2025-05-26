import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

// Componente para control de acceso basado en roles
const RoleBasedAccess = ({ children, allowedRoles, allowedOffices, requireAdmin }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (!isAuthenticated) {
      showNotification('Debe iniciar sesión para acceder a esta página', 'error');
      navigate('/login', { state: { from: location } });
      return;
    }

    // Verificar si el usuario es administrador y se requiere ser administrador
    if (requireAdmin && !currentUser.is_admin) {
      showNotification('No tiene permisos para acceder a esta sección', 'error');
      navigate('/dashboard');
      return;
    }

    // Verificar si el usuario tiene un rol permitido
    if (allowedRoles && allowedRoles.length > 0) {
      const hasRole = allowedRoles.includes(currentUser.role);
      if (!hasRole) {
        showNotification('No tiene el rol necesario para acceder a esta sección', 'error');
        navigate('/dashboard');
        return;
      }
    }

    // Verificar si el usuario tiene un cargo permitido
    if (allowedOffices && allowedOffices.length > 0) {
      const hasOffice = allowedOffices.some(office => currentUser.offices && currentUser.offices.includes(office));
      if (!hasOffice && !currentUser.is_admin) { // Los administradores siempre tienen acceso
        showNotification('No tiene el cargo necesario para acceder a esta sección', 'error');
        navigate('/dashboard');
        return;
      }
    }

    // Si pasa todas las verificaciones, tiene acceso
    setHasAccess(true);
    setLoading(false);
  }, [currentUser, isAuthenticated, navigate, location, showNotification, allowedRoles, allowedOffices, requireAdmin]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return hasAccess ? children : null;
};

export default RoleBasedAccess;
