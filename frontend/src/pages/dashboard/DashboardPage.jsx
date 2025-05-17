import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  // Datos simulados para el dashboard
  const stats = [
    { id: 1, name: 'Miembros Activos', value: '42' },
    { id: 2, name: 'Cuotas Pendientes', value: '8' },
    { id: 3, name: 'Próxima Tenida', value: '15/06/2025' },
    { id: 4, name: 'Trabajos Pendientes', value: '3' },
  ];

  const recentActivities = [
    { id: 1, type: 'Pago', user: 'Juan Pérez', description: 'Cuota mensual', date: '12/05/2025' },
    { id: 2, type: 'Documento', user: 'Carlos Rodríguez', description: 'Subió trabajo masónico', date: '10/05/2025' },
    { id: 3, type: 'Evento', user: 'Sistema', description: 'Tenida programada', date: '08/05/2025' },
    { id: 4, type: 'Miembro', user: 'Admin', description: 'Nuevo miembro registrado', date: '05/05/2025' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Última actualización: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.id} className="dashboard-stat">
            <dt className="dashboard-stat-label">{stat.name}</dt>
            <dd className="dashboard-stat-value">{stat.value}</dd>
          </div>
        ))}
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Actividad Reciente</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-masonic-blue truncate">{activity.description}</p>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
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
                  <p>{activity.date}</p>
                </div>
              </div>
            </div>
          ))}
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
