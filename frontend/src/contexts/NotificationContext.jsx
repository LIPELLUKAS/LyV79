import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { communicationService } from '../services/api';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Cargar notificaciones cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Configurar intervalo para actualizar el contador de no leídas
      const interval = setInterval(fetchUnreadCount, 60000); // Cada minuto
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Función para obtener notificaciones
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await communicationService.getNotifications();
      setNotifications(response.data);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      setError('No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener contador de no leídas
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await communicationService.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Error al cargar contador de no leídas:', err);
    }
  };

  // Función para marcar notificación como leída
  const markAsRead = async (notificationId) => {
    try {
      await communicationService.markNotificationAsRead(notificationId);
      
      // Actualizar estado local
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      
      // Actualizar contador
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      
      return { success: true };
    } catch (err) {
      console.error('Error al marcar notificación como leída:', err);
      return { error: 'No se pudo marcar la notificación como leída' };
    }
  };

  // Función para marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      await communicationService.markAllNotificationsAsRead();
      
      // Actualizar estado local
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, is_read: true }))
      );
      
      // Actualizar contador
      setUnreadCount(0);
      
      return { success: true };
    } catch (err) {
      console.error('Error al marcar todas las notificaciones como leídas:', err);
      return { error: 'No se pudieron marcar todas las notificaciones como leídas' };
    }
  };

  // Función para mostrar notificación toast
  const showNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const toast = { id, message, type, duration };
    
    setToasts(prevToasts => [...prevToasts, toast]);
    
    // Eliminar automáticamente después de la duración
    setTimeout(() => {
      removeToast(id);
    }, duration);
    
    return id;
  };

  // Función para eliminar toast
  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  // Función para añadir notificación (útil para WebSockets)
  const addNotification = (notification) => {
    setNotifications(prevNotifications => [notification, ...prevNotifications]);
    
    if (!notification.is_read) {
      setUnreadCount(prevCount => prevCount + 1);
    }
    
    // Mostrar toast para la nueva notificación
    showNotification(notification.message, 'info');
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    toasts,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    showNotification,
    removeToast,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Componente de Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg max-w-md transform transition-all duration-300 ease-in-out ${
              toast.type === 'success' ? 'bg-green-500 text-white' :
              toast.type === 'error' ? 'bg-red-500 text-white' :
              toast.type === 'warning' ? 'bg-yellow-500 text-white' :
              'bg-indigo-500 text-white'
            }`}
          >
            <div className="flex justify-between items-center">
              <p>{toast.message}</p>
              <button 
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-white hover:text-gray-200 focus:outline-none"
              >
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
