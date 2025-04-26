import React, { createContext, useContext, useState, useEffect } from 'react';
import { communicationsService } from '../services/api';
import { useAuth } from './AuthContext';

// Crear el contexto de notificaciones
const NotificationContext = createContext();

// Hook personalizado para usar el contexto de notificaciones
export const useNotifications = () => {
  return useContext(NotificationContext);
};

// Proveedor del contexto de notificaciones
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Cargar notificaciones cuando el usuario está autenticado
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const loadNotifications = async () => {
      try {
        setLoading(true);
        const response = await communicationsService.getAllNotifications({ read: false });
        setNotifications(response.data);
        setUnreadCount(response.data.length);
      } catch (e) {
        setError(e.message);
        console.error('Error al cargar notificaciones:', e);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // Configurar un intervalo para actualizar las notificaciones cada 5 minutos
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Función para marcar una notificación como leída
  const markAsRead = async (id) => {
    try {
      await communicationsService.markNotificationAsRead(id);
      
      // Actualizar el estado local
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      );
      setUnreadCount(prevCount => prevCount - 1);
      
      return { success: true };
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al marcar la notificación como leída');
      return { success: false, error: e.response?.data?.detail || 'Error al marcar la notificación como leída' };
    }
  };

  // Función para marcar todas las notificaciones como leídas
  const markAllAsRead = async () => {
    try {
      // Marcar cada notificación como leída
      const promises = notifications.map(notification => 
        communicationsService.markNotificationAsRead(notification.id)
      );
      
      await Promise.all(promises);
      
      // Actualizar el estado local
      setNotifications([]);
      setUnreadCount(0);
      
      return { success: true };
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al marcar todas las notificaciones como leídas');
      return { success: false, error: e.response?.data?.detail || 'Error al marcar todas las notificaciones como leídas' };
    }
  };

  // Valor del contexto
  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
