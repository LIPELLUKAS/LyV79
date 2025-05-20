import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Obtener resumen del dashboard
        const summaryResponse = await dashboardService.getSummary();
        setSummaryData(summaryResponse.data || {});
        
        // Obtener actividades recientes
        const activitiesResponse = await dashboardService.getRecentActivity();
        setRecentActivities(activitiesResponse.data || []);
        
        // Obtener próximos eventos
        const eventsResponse = await dashboardService.getUpcomingEvents();
        setUpcomingEvents(eventsResponse.data || []);
        
        // Actualizar timestamp
        setLastUpdate(new Date());
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        showNotification('Error al cargar los datos del dashboard. Por favor, intente nuevamente más tarde.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Actualizar datos cada 5 minutos
    const intervalId = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [showNotification]);

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Convertir datos del resumen a formato de estadísticas
  const getStatsFromSummary = () => {
    if (!summaryData) return [];
    
    const stats = [];
    
    if (summaryData.active_members !== undefined) {
      stats.push({
        id: 'active_members',
        name: 'Miembros Activos',
        value: summaryData.active_members.toString()
      });
    }
    
    if (summaryData.pending_payments !== undefined) {
      stats.push({
        id: 'pending_payments',
        name: 'Cuotas Pendientes',
        value: summaryData.pending_payments.toString()
      });
    }
    
    if (summaryData.next_ritual_date) {
      stats.push({
        id: 'next_ritual',
        name: 'Próxima Tenida',
        value: formatDate(summaryData.next_ritual_date)
      });
    }
    
    if (summaryData.pending_tasks !== undefined) {
      stats.push({
        id: 'pending_tasks',
        name: 'Trabajos Pendientes',
        value: summaryData.pending_tasks.toString()
      });
    }
    
    return stats;
  };

  const stats = getStatsFromSummary();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {loading ? 'Actualizando...' : `Última actualización: ${formatDate(lastUpdate.toISOString())}`}
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          // Esqueletos de carga
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="dashboard-stat animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))
        ) : stats.length > 0 ? (
          stats.map((stat) => (
            <div key={stat.id} className="dashboard-stat">
              <dt className="dashboard-stat-label">{stat.name}</dt>
              <dd className="dashboard-stat-value">{stat.value}</dd>
            </div>
          ))
        ) : (
          <div className="col-span-4 text-center py-4 text-gray-500">
            No hay datos estadísticos disponibles en este momento.
          </div>
        )}
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Actividad Reciente</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            // Esqueletos de carga
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="px-4 py-4 sm:px-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                </div>
              </div>
            ))
          ) : recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div key={activity.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-masonic-blue truncate">{activity.description}</p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      activity.type === 'payment' 
                        ? 'bg-green-100 text-green-800' 
                        : activity.type === 'document'
                          ? 'bg-blue-100 text-blue-800'
                          : activity.type === 'event'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {activity.type === 'payment' ? 'Pago' : 
                       activity.type === 'document' ? 'Documento' : 
                       activity.type === 'event' ? 'Evento' : 
                       activity.type === 'member' ? 'Miembro' : 
                       activity.type}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {activity.user_name || activity.user}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>{formatDate(activity.date)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-5 text-center text-gray-500">
              No hay actividades recientes para mostrar.
            </div>
          )}
        </div>
      </div>

      {/* Próximos Eventos */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Próximos Eventos</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              // Esqueletos de carga
              Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="px-4 py-4 sm:px-6 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                  </div>
                </div>
              ))
            ) : (
              upcomingEvents.map((event) => (
                <div key={event.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-masonic-blue truncate">{event.title}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {event.type || 'Evento'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {event.location || 'Ubicación no especificada'}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>{formatDate(event.date)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Accesos Rápidos */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Accesos Rápidos</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Link to="/members" className="btn btn-primary w-full text-center">
              Gestionar Miembros
            </Link>
            <Link to="/treasury" className="btn btn-primary w-full text-center">
              Registrar Pago
            </Link>
            <Link to="/rituals" className="btn btn-primary w-full text-center">
              Programar Tenida
            </Link>
            <Link to="/communications" className="btn btn-primary w-full text-center">
              Enviar Comunicación
            </Link>
            <Link to="/library" className="btn btn-primary w-full text-center">
              Acceder a Biblioteca
            </Link>
            <Link to="/profile" className="btn btn-primary w-full text-center">
              Mi Perfil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
