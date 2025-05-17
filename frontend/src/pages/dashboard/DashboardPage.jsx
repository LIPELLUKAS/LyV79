import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Obtener estadísticas
        const statsResponse = await dashboardService.getStats();
        setStats(statsResponse.data || []);
        
        // Obtener actividades recientes
        const activitiesResponse = await dashboardService.getRecentActivities();
        setRecentActivities(activitiesResponse.data || []);
        
        // Actualizar timestamp
        setLastUpdate(new Date());
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        showNotification('Error al cargar los datos del dashboard', 'error');
        
        // Cargar datos de respaldo en caso de error
        setStats([
          { id: 1, name: 'Miembros Activos', value: '42' },
          { id: 2, name: 'Cuotas Pendientes', value: '8' },
          { id: 3, name: 'Próxima Tenida', value: '15/06/2025' },
          { id: 4, name: 'Trabajos Pendientes', value: '3' },
        ]);
        
        setRecentActivities([
          { id: 1, type: 'Pago', user: 'Juan Pérez', description: 'Cuota mensual', date: '12/05/2025' },
          { id: 2, type: 'Documento', user: 'Carlos Rodríguez', description: 'Subió trabajo masónico', date: '10/05/2025' },
          { id: 3, type: 'Evento', user: 'Sistema', description: 'Tenida programada', date: '08/05/2025' },
          { id: 4, type: 'Miembro', user: 'Admin', description: 'Nuevo miembro registrado', date: '05/05/2025' },
        ]);
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
  const formatDate = (date) => {
    if (typeof date === 'string') {
      return date;
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {loading ? 'Actualizando...' : `Última actualización: ${formatDate(lastUpdate)}`}
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading && stats.length === 0 ? (
          // Esqueletos de carga
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="dashboard-stat animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))
        ) : (
          stats.map((stat) => (
            <div key={stat.id} className="dashboard-stat">
              <dt className="dashboard-stat-label">{stat.name}</dt>
              <dd className="dashboard-stat-value">{stat.value}</dd>
            </div>
          ))
        )}
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Actividad Reciente</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {loading && recentActivities.length === 0 ? (
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
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-masonic-blue truncate">{activity.description}</p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      activity.type === 'Pago' 
                        ? 'bg-green-100 text-green-800' 
                        : activity.type === 'Documento'
                          ? 'bg-blue-100 text-blue-800'
                          : activity.type === 'Evento'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {activity.type}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {activity.user}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>{formatDate(activity.date)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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
