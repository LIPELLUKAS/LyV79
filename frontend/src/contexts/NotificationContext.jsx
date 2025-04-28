import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  console.log("Contexto de Notificação:", context);  // Adicionando o log para verificar o contexto
  
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }

  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Mostrar uma notificação
  const showNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    
    // Adicionar nova notificação
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    
    // Eliminar automaticamente após a duração especificada
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  };

  // Eliminar uma notificação
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Eliminar todas as notificações
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Componente para renderizar as notificações
  const NotificationContainer = () => {
    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-md flex items-start justify-between transition-all duration-300 transform translate-x-0 ${
              notification.read ? 'opacity-50' : '' // Adicionando opacidade para notificações lidas
            } ${notification.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' :
              notification.type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' :
              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500' :
              'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
            }`}
          >
            <div className="flex-1 mr-2">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => {
                removeNotification(notification.id);
                markAsRead(notification.id);  // Marcar como lida ao fechar
              }}
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

  // Marcar uma notificação como lida
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const value = {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
    markAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
