import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { communicationsService } from '../../services/api';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificationCenter = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  // Estados para notificaciones
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros y paginación
  const [filters, setFilters] = useState({
    read: '',  // '', 'read', 'unread'
    type: '',  // '', 'system', 'event', 'message', etc.
    search: ''
  });
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Cargar notificaciones al iniciar
  useEffect(() => {
    fetchNotifications();
  }, [pagination.currentPage, filters]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Construir parámetros de consulta
      const queryParams = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters
      };
      
      // Eliminar parámetros vacíos
      Object.keys(queryParams).forEach(key => 
        !queryParams[key] && delete queryParams[key]
      );
      
      const response = await communicationsService.getNotifications(queryParams);
      
      setNotifications(response.data.results || []);
      setPagination({
        ...pagination,
        totalPages: response.data.total_pages || 1,
        totalItems: response.data.total_items || 0
      });
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      setError('No se pudieron cargar las notificaciones. Por favor, intente nuevamente.');
      showNotification('Error al cargar notificaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setPagination({
      ...pagination,
      currentPage: 1 // Resetear a la primera página al cambiar filtros
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotifications();
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination({
        ...pagination,
        currentPage: newPage
      });
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await communicationsService.markNotificationAsRead(notificationId);
      
      // Actualizar estado local
      setNotifications(prevNotifications => 
        prevNotifications.map(notification =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
      
      showNotification('Notificación marcada como leída', 'success');
    } catch (err) {
      console.error('Error al marcar notificación como leída:', err);
      showNotification('Error al marcar notificación como leída', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await communicationsService.markAllNotificationsAsRead();
      
      // Actualizar estado local
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      showNotification('Todas las notificaciones marcadas como leídas', 'success');
    } catch (err) {
      console.error('Error al marcar todas las notificaciones como leídas:', err);
      showNotification('Error al marcar todas las notificaciones como leídas', 'error');
    }
  };

  const handleNotificationClick = (notification) => {
    // Si no está leída, marcarla como leída
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navegar según el tipo de notificación
    switch (notification.type) {
      case 'event':
        navigate(`/communications/events/${notification.reference_id}`);
        break;
      case 'message':
        navigate(`/communications/messages?conversation=${notification.reference_id}`);
        break;
      case 'ritual':
        navigate(`/rituals/detail/${notification.reference_id}`);
        break;
      case 'payment':
        navigate(`/treasury/payments/${notification.reference_id}`);
        break;
      case 'document':
        navigate(`/library/documents/${notification.reference_id}`);
        break;
      default:
        // Para notificaciones del sistema o sin referencia específica
        // No hacer nada más que marcarla como leída
        break;
    }
  };

  // Renderizar icono según tipo de notificación
  const renderNotificationIcon = (type) => {
    switch (type) {
      case 'event':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'message':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        );
      case 'ritual':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        );
      case 'payment':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'document':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  // Generar array de páginas para paginación
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  // Formatear fecha relativa
  const formatRelativeTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: es });
    } catch (error) {
      return 'Fecha desconocida';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Centro de Notificaciones</h1>
        <button
          onClick={handleMarkAllAsRead}
          disabled={loading || notifications.every(n => n.read)}
          className={`mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
            loading || notifications.every(n => n.read)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Marcar todas como leídas
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <form onSubmit={handleSearchSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="read" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="read"
                name="read"
                value={filters.read}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Todas</option>
                <option value="unread">No leídas</option>
                <option value="read">Leídas</option>
              </select>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Todos</option>
                <option value="system">Sistema</option>
                <option value="event">Eventos</option>
                <option value="message">Mensajes</option>
                <option value="ritual">Rituales</option>
                <option value="payment">Pagos</option>
                <option value="document">Documentos</option>
              </select>
            </div>
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Buscar en notificaciones..."
                  className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-md hover:bg-gray-100"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Lista de notificaciones */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
          <button 
            onClick={fetchNotifications}
            className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Intentar nuevamente
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay notificaciones</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron notificaciones con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <li 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-indigo-50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start">
                    {renderNotificationIcon(notification.type)}
                    
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-indigo-900' : 'text-gray-900'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                      <p className={`text-sm ${!notification.read ? 'text-indigo-700' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                    </div>
                    
                    {!notification.read && (
                      <div className="ml-2 flex-shrink-0">
                        <span className="inline-flex h-2 w-2 rounded-full bg-indigo-600"></span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.currentPage === pagination.totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{notifications.length}</span> de{' '}
                    <span className="font-medium">{pagination.totalItems}</span> notificaciones
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Anterior</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {getPageNumbers().map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.currentPage === pageNumber
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.currentPage === pagination.totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Siguiente</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
