import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { communicationsService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const NotificationCenter = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Cargar notificaciones
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await communicationsService.getNotifications({
          page,
          filter,
          limit: 10
        });
        
        setNotifications(response.data.results);
        setUnreadCount(response.data.unread_count);
        setTotalPages(Math.ceil(response.data.count / 10));
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Configurar intervalo para actualizar notificaciones
    const interval = setInterval(fetchNotifications, 60000); // Actualizar cada minuto
    
    return () => clearInterval(interval);
  }, [page, filter]);

  // Marcar notificación como leída
  const handleMarkAsRead = async (notificationId) => {
    try {
      await communicationsService.markNotificationAsRead(notificationId);
      
      // Actualizar estado local
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Actualizar contador de no leídas
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await communicationsService.markAllNotificationsAsRead();
      
      // Actualizar estado local
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      // Actualizar contador de no leídas
      setUnreadCount(0);
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
    }
  };

  // Eliminar notificación
  const handleDeleteNotification = async (notificationId) => {
    try {
      await communicationsService.deleteNotification(notificationId);
      
      // Actualizar estado local
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
      
      // Actualizar contador de no leídas si era una notificación no leída
      const wasUnread = notifications.find(n => n.id === notificationId && !n.read);
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };

  // Navegar a la página relacionada con la notificación
  const handleNavigateToRelated = (notification) => {
    // Marcar como leída primero
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navegar según el tipo de notificación
    switch (notification.type) {
      case 'event':
        navigate(`/communications/events/${notification.related_id}`);
        break;
      case 'payment':
        navigate(`/treasury/payments/${notification.related_id}`);
        break;
      case 'ritual':
        navigate(`/rituals/plans/${notification.related_id}`);
        break;
      case 'message':
        navigate(`/communications/messages/${notification.related_id}`);
        break;
      case 'document':
        navigate(`/library/documents/${notification.related_id}`);
        break;
      default:
        // Si no hay una página específica, solo marcar como leída
        break;
    }
  };

  // Renderizar icono según tipo de notificación
  const renderNotificationIcon = (type) => {
    switch (type) {
      case 'event':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'payment':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'ritual':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        );
      case 'message':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'document':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Centro de Notificaciones</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {unreadCount} no leídas
          </span>
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              unreadCount === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            Marcar todas como leídas
          </button>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          onClick={() => { setFilter('all'); setPage(1); }}
          className={`px-4 py-2 text-sm font-medium ${
            filter === 'all'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => { setFilter('unread'); setPage(1); }}
          className={`px-4 py-2 text-sm font-medium ${
            filter === 'unread'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          No leídas
        </button>
        <button
          onClick={() => { setFilter('event'); setPage(1); }}
          className={`px-4 py-2 text-sm font-medium ${
            filter === 'event'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Eventos
        </button>
        <button
          onClick={() => { setFilter('payment'); setPage(1); }}
          className={`px-4 py-2 text-sm font-medium ${
            filter === 'payment'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pagos
        </button>
        <button
          onClick={() => { setFilter('ritual'); setPage(1); }}
          className={`px-4 py-2 text-sm font-medium ${
            filter === 'ritual'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Rituales
        </button>
        <button
          onClick={() => { setFilter('message'); setPage(1); }}
          className={`px-4 py-2 text-sm font-medium ${
            filter === 'message'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Mensajes
        </button>
      </div>
      
      {/* Lista de notificaciones */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay notificaciones</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? 'No tienes notificaciones en este momento.' 
              : `No tienes notificaciones con el filtro "${filter}" aplicado.`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-indigo-50' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  {renderNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleNavigateToRelated(notification)}
                    >
                      <p className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              page === 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              page === totalPages
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
