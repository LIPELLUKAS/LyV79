import React, { createContext, useContext, useState, useEffect } from 'react';
import { communicationsService } from '../services/api';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }

  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uiNotifications, setUiNotifications] = useState([]);

  // Cargar notificaciones al iniciar
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Obtener notificaciones del servidor
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await communicationsService.getAllNotifications({ 
        read: false,
        limit: 10
      });
      setNotifications(response.data.results || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      setError('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  // Marcar notificación como leída
  const markAsRead = async (id) => {
    try {
      await communicationsService.markNotificationAsRead(id);
      
      // Actualizar estado local
      setNotifications(prev => 
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error al marcar notificación como leída:', err);
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Error al marcar notificación' 
      };
    }
  };

  // Mostrar una notificación UI
  const showNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    
    // Adicionar nueva notificación UI
    setUiNotifications(prev => [...prev, { id, message, type, duration }]);
    
    // Eliminar automáticamente después de la duración especificada
    if (duration > 0) {
      setTimeout(() => {
        removeUiNotification(id);
      }, duration);
    }
    
    return id;
  };

  // Eliminar una notificación UI
  const removeUiNotification = (id) => {
    setUiNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Eliminar todas las notificaciones UI
  const clearAllUiNotifications = () => {
    setUiNotifications([]);
  };

  // Componente para renderizar las notificaciones UI
  const NotificationContainer = () => {
    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {uiNotifications.map(notification => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-md flex items-start justify-between transition-all duration-300 transform translate-x-0 ${
              notification.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' :
              notification.type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' :
              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500' :
              'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
            }`}
          >
            <div className="flex-1 mr-2">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => removeUiNotification(notification.id)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    );
  };

  const value = {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    showNotification,
    removeUiNotification,
    clearAllUiNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
