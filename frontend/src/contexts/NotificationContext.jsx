import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Mostrar una notificación
  const showNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    
    // Añadir nueva notificación
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    
    // Eliminar automáticamente después de la duración especificada
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  };

  // Eliminar una notificación
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Eliminar todas las notificaciones
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Componente para renderizar las notificaciones
  const NotificationContainer = () => {
    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
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
              onClick={() => removeNotification(notification.id)}
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
    showNotification,
    removeNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
