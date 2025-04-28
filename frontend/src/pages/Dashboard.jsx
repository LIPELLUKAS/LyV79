import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { useNotification } from '../contexts/NotificationContext';
import { adminService, memberService, treasuryService, communicationsService } from '../services/api';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { lodgeConfig } = useConfig();
  const { notifications, markAsRead } = useNotification();
  
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingPayments: 0,
    upcomingEvents: [],
    recentDocuments: [],
    treasuryBalance: 0,
    systemHealth: {}
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Obtener estadísticas de miembros
        const membersResponse = await memberService.getAllMembers({ limit: 1 });
        const totalMembers = membersResponse.data.count || 0;
        const activeMembers = membersResponse.data.active_count || 0;
        
        // Obtener pagos pendientes
        const paymentsResponse = await treasuryService.getAllPayments({ status: 'pending' });
        const pendingPayments = paymentsResponse.data.count || 0;
        
        // Obtener próximos eventos
        const eventsResponse = await communicationsService.getAllEvents({ 
          upcoming: true,
          limit: 5
        });
        const upcomingEvents = eventsResponse.data.results || [];
        
        // Obtener balance de tesorería
        const treasuryResponse = await treasuryService.getFinancialReports({ latest: true });
        const treasuryBalance = treasuryResponse.data.balance || 0;
        
        // Obtener estado del sistema (solo para usuarios con permisos)
        let systemHealth = {};
        if (currentUser.degree >= 3) { // Solo para Maestros Masones
          try {
            const healthResponse = await adminService.getSystemHealthSummary();
            systemHealth = healthResponse.data;
          } catch (e) {
            console.error('Error al obtener estado del sistema:', e);
          }
        }
        
        setStats({
          totalMembers,
          activeMembers,
          pendingPayments,
          upcomingEvents,
          treasuryBalance,
          systemHealth
        });
      } catch (e) {
        setError('Error al cargar los datos del dashboard');
        console.error('Error al cargar dashboard:', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser]);

  const handleNotificationClick = async (id) => {
    await markAsRead(id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {currentUser?.symbolic_name || currentUser?.username}
        </h1>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-sm font-medium text-indigo-600">
            {currentUser?.office ? `${currentUser.office}` : ''}
            {currentUser?.office && currentUser?.degree ? ' · ' : ''}
            {currentUser?.degree === 1 ? 'Aprendiz' : 
             currentUser?.degree === 2 ? 'Compañero' : 
             currentUser?.degree === 3 ? 'Maestro Masón' : ''}
          </p>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Miembros</h2>
              <div className="flex items-center">
                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalMembers}</p>
                  <p className="text-sm text-gray-500">Total de miembros</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-green-600">{stats.activeMembers}</span> miembros activos
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Tesorería</h2>
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">${stats.treasuryBalance.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Balance actual</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-amber-600">{stats.pendingPayments}</span> pagos pendientes
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Estado del Sistema</h2>
              {currentUser?.degree >= 3 ? (
                <div className="flex items-center">
                  <div className={`bg-${stats.systemHealth.status === 'healthy' ? 'green' : stats.systemHealth.status === 'warning' ? 'amber' : 'red'}-100 rounded-full p-3 mr-4`}>
                    <svg className={`h-6 w-6 text-${stats.systemHealth.status === 'healthy' ? 'green' : stats.systemHealth.status === 'warning' ? 'amber' : 'red'}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {stats.systemHealth.status === 'healthy' ? 'Saludable' : 
                       stats.systemHealth.status === 'warning' ? 'Advertencia' : 'Crítico'}
                    </p>
                    <p className="text-sm text-gray-500">
                      CPU: {stats.systemHealth.cpu_usage}% · RAM: {stats.systemHealth.memory_usage}%
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">Información disponible para Maestros Masones</p>
              )}
            </div>
          </div>
          
          {/* Próximos eventos y notificaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-700">Próximos Eventos</h2>
              </div>
              <div className="p-6">
                {stats.upcomingEvents.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {stats.upcomingEvents.map(event => (
                      <li key={event.id} className="py-4">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full px-3 py-1 mr-3">
                            {new Date(event.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(event.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              {event.location ? ` · ${event.location}` : ''}
                            </p>
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              event.event_type === 'ritual' ? 'bg-purple-100 text-purple-800' :
                              event.event_type === 'instruction' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {event.event_type === 'ritual' ? 'Ritual' :
                               event.event_type === 'instruction' ? 'Instrucción' :
                               event.event_type === 'social' ? 'Social' : 'Evento'}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No hay eventos próximos programados</p>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-700">Notificaciones</h2>
              </div>
              <div className="p-6">
                {notifications.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {notifications.slice(0, 5).map(notification => (
                      <li key={notification.id} className="py-4">
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 rounded-full p-2 ${
                            notification.notification_type === 'important' ? 'bg-red-100' :
                            notification.notification_type === 'event' ? 'bg-blue-100' :
                            notification.notification_type === 'payment' ? 'bg-green-100' :
                            notification.notification_type === 'ritual' ? 'bg-purple-100' :
                            'bg-gray-100'
                          }`}>
                            <svg className={`h-4 w-4 ${
                              notification.notification_type === 'important' ? 'text-red-600' :
                              notification.notification_type === 'event' ? 'text-blue-600' :
                              notification.notification_type === 'payment' ? 'text-green-600' :
                              notification.notification_type === 'ritual' ? 'text-purple-600' :
                              'text-gray-600'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {notification.notification_type === 'important' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              ) : notification.notification_type === 'event' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              ) : notification.notification_type === 'payment' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              ) : notification.notification_type === 'ritual' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              )}
                            </svg>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-500">{notification.content}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <p className="text-xs text-gray-400">
                                {new Date(notification.created_at).toLocaleString('es-ES', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              <button
                                onClick={() => handleNotificationClick(notification.id)}
                                className="text-xs text-indigo-600 hover:text-indigo-900"
                              >
                                Marcar como leída
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No tienes notificaciones sin leer</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
