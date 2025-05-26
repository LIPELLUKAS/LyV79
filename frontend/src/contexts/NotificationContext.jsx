import React, { createContext, useState, useContext, useEffect } from 'react';

// Criando o contexto de notificações
const NotificationContext = createContext();

// Hook personalizado para usar o contexto
export const useNotification = () => useContext(NotificationContext);

// Tipos de notificações
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Provider do contexto
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Função para adicionar uma nova notificação
  const showNotification = (message, type = NOTIFICATION_TYPES.INFO, duration = 5000) => {
    const id = Date.now();
    
    // Adicionar nova notificação
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    
    // Remover notificação após a duração especificada
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  };

  // Função para remover uma notificação específica
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Funções de conveniência para diferentes tipos de notificações
  const showSuccess = (message, duration) => 
    showNotification(message, NOTIFICATION_TYPES.SUCCESS, duration);
  
  const showError = (message, duration) => 
    showNotification(message, NOTIFICATION_TYPES.ERROR, duration);
  
  const showWarning = (message, duration) => 
    showNotification(message, NOTIFICATION_TYPES.WARNING, duration);
  
  const showInfo = (message, duration) => 
    showNotification(message, NOTIFICATION_TYPES.INFO, duration);

  // Componente para renderizar as notificações
  const NotificationContainer = () => {
    if (notifications.length === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {notifications.map(notification => (
          <div 
            key={notification.id}
            className={`rounded-md p-4 shadow-lg animate-fade-in flex items-start justify-between ${getNotificationStyles(notification.type)}`}
          >
            <div className="flex-1 mr-2">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button 
              onClick={() => removeNotification(notification.id)}
              className="text-sm font-medium focus:outline-none"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Função auxiliar para obter estilos com base no tipo de notificação
  const getNotificationStyles = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'bg-green-50 text-green-800 border-l-4 border-green-500';
      case NOTIFICATION_TYPES.ERROR:
        return 'bg-red-50 text-red-800 border-l-4 border-red-500';
      case NOTIFICATION_TYPES.WARNING:
        return 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500';
      case NOTIFICATION_TYPES.INFO:
      default:
        return 'bg-blue-50 text-blue-800 border-l-4 border-blue-500';
    }
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        showNotification, 
        removeNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
