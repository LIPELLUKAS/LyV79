import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    memberStats: {
      total: 0,
      active: 0,
      inactive: 0,
      suspended: 0,
      byDegree: {
        apprentice: 0,
        fellow: 0,
        master: 0
      }
    },
    financialStats: {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      duesStatus: {
        upToDate: 0,
        pending: 0,
        overdue: 0
      }
    },
    upcomingEvents: [],
    recentMessages: [],
    recentDocuments: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // En un entorno real, esto sería una llamada a la API
        // const response = await api.get('/dashboard/summary/');
        // setDashboardData(response.data);
        
        // Simulamos datos para desarrollo
        setTimeout(() => {
          setDashboardData({
            memberStats: {
              total: 45,
              active: 38,
              inactive: 5,
              suspended: 2,
              byDegree: {
                apprentice: 12,
                fellow: 15,
                master: 18
              }
            },
            financialStats: {
              totalIncome: 12500,
              totalExpenses: 8750,
              balance: 3750,
              duesStatus: {
                upToDate: 32,
                pending: 8,
                overdue: 5
              }
            },
            upcomingEvents: [
              { id: 1, title: 'Tenida Regular', date: '2025-05-25', type: 'ritual', degree: 1 },
              { id: 2, title: 'Ceremonia de Iniciación', date: '2025-06-05', type: 'ritual', degree: 1 },
              { id: 3, title: 'Reunión de Comité', date: '2025-05-22', type: 'meeting', degree: 3 }
            ],
            recentMessages: [
              { id: 1, sender: 'Juan Pérez', subject: 'Recordatorio de pago de cuotas', date: '2025-05-18', read: false },
              { id: 2, sender: 'Carlos Rodríguez', subject: 'Planificación de evento benéfico', date: '2025-05-17', read: true },
              { id: 3, sender: 'Miguel González', subject: 'Documentos para próxima tenida', date: '2025-05-15', read: true }
            ],
            recentDocuments: [
              { id: 1, name: 'Acta de Tenida - Mayo 2025', uploadedBy: 'Secretario', date: '2025-05-16', type: 'pdf' },
              { id: 2, name: 'Presupuesto Trimestral', uploadedBy: 'Tesorero', date: '2025-05-14', type: 'xlsx' },
              { id: 3, name: 'Plancha de Trabajo - Simbolismo', uploadedBy: 'Orador', date: '2025-05-12', type: 'pdf' }
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('No se pudieron cargar los datos del dashboard. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const navigateTo = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-30 border-l-4 border-red-500 dark:border-red-700 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Estadísticas de Miembros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Miembros</h2>
            <button 
              onClick={() => navigateTo('/members')}
              className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Ver todos
            </button>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardData.memberStats.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{dashboardData.memberStats.active}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Activos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-500 dark:text-gray-400">{dashboardData.memberStats.inactive}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Inactivos</p>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Por Grado</h3>
            <div className="flex justify-between">
              <div className="text-center">
                <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{dashboardData.memberStats.byDegree.apprentice}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Aprendices</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{dashboardData.memberStats.byDegree.fellow}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Compañeros</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{dashboardData.memberStats.byDegree.master}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Maestros</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas Financieras */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Finanzas</h2>
            <button 
              onClick={() => navigateTo('/treasury')}
              className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Ver detalles
            </button>
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Ingresos</p>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">${dashboardData.financialStats.totalIncome}</p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Gastos</p>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">${dashboardData.financialStats.totalExpenses}</p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Balance</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">${dashboardData.financialStats.balance}</p>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado de Cuotas</h3>
            <div className="flex justify-between">
              <div className="text-center">
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">{dashboardData.financialStats.duesStatus.upToDate}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Al día</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">{dashboardData.financialStats.duesStatus.pending}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pendientes</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">{dashboardData.financialStats.duesStatus.overdue}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Atrasados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Próximos Eventos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Próximos Eventos</h2>
            <button 
              onClick={() => navigateTo('/rituals')}
              className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Ver calendario
            </button>
          </div>
          {dashboardData.upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.upcomingEvents.map(event => (
                <div key={event.id} className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 rounded-md p-2 mr-3">
                    <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(event.date).toLocaleDateString()} • 
                      {event.type === 'ritual' ? ' Ritual' : ' Reunión'} • 
                      {event.degree === 1 ? ' Aprendiz' : event.degree === 2 ? ' Compañero' : ' Maestro'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No hay eventos próximos programados.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mensajes Recientes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Mensajes Recientes</h2>
            <button 
              onClick={() => navigateTo('/communications/messages')}
              className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Ver todos
            </button>
          </div>
          {dashboardData.recentMessages.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {dashboardData.recentMessages.map(message => (
                <div key={message.id} className="py-3 flex items-center">
                  <div className={`flex-shrink-0 h-2 w-2 rounded-full ${message.read ? 'bg-gray-300 dark:bg-gray-600' : 'bg-indigo-600 dark:bg-indigo-400'} mr-3`}></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{message.subject}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      De: {message.sender} • {new Date(message.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <button 
                      onClick={() => navigateTo(`/communications/messages/${message.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No hay mensajes recientes.</p>
          )}
        </div>

        {/* Documentos Recientes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Documentos Recientes</h2>
            <button 
              onClick={() => navigateTo('/library')}
              className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Ver biblioteca
            </button>
          </div>
          {dashboardData.recentDocuments.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {dashboardData.recentDocuments.map(doc => (
                <div key={doc.id} className="py-3 flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    <svg className={`h-6 w-6 ${
                      doc.type === 'pdf' ? 'text-red-500' : 
                      doc.type === 'xlsx' ? 'text-green-500' : 
                      'text-blue-500'
                    }`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Por: {doc.uploadedBy} • {new Date(doc.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <button 
                      onClick={() => navigateTo(`/library/document/${doc.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No hay documentos recientes.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
