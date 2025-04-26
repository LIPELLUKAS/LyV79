import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { treasuryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const TreasuryDashboard = () => {
  const [stats, setStats] = useState({
    totalBalance: 0,
    pendingPayments: 0,
    recentTransactions: [],
    monthlyIncome: 0,
    monthlyExpenses: 0,
    annualSummary: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Verificar permisos - Solo tesorero y VM pueden acceder
  useEffect(() => {
    if (currentUser && 
        !(currentUser.office === 'Tesorero' || 
          currentUser.office === 'Venerable Maestro' || 
          currentUser.degree >= 3)) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Cargar datos de tesorería
  useEffect(() => {
    const fetchTreasuryData = async () => {
      try {
        setLoading(true);
        
        // Obtener balance total
        const balanceResponse = await treasuryService.getFinancialSummary();
        
        // Obtener pagos pendientes
        const pendingResponse = await treasuryService.getAllPayments({ status: 'pending' });
        
        // Obtener transacciones recientes
        const transactionsResponse = await treasuryService.getAllTransactions({ 
          limit: 5,
          ordering: '-date'
        });
        
        // Obtener resumen mensual
        const monthlyResponse = await treasuryService.getMonthlyReport();
        
        // Obtener resumen anual
        const annualResponse = await treasuryService.getAnnualSummary();
        
        setStats({
          totalBalance: balanceResponse.data.total_balance || 0,
          pendingPayments: pendingResponse.data.count || 0,
          recentTransactions: transactionsResponse.data.results || [],
          monthlyIncome: monthlyResponse.data.income || 0,
          monthlyExpenses: monthlyResponse.data.expenses || 0,
          annualSummary: annualResponse.data.months || []
        });
      } catch (e) {
        setError('Error al cargar los datos de tesorería');
        console.error('Error al cargar datos de tesorería:', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTreasuryData();
  }, []);

  // Navegar a la página de pagos
  const handleViewPayments = () => {
    navigate('/treasury/payments');
  };

  // Navegar a la página de facturas
  const handleViewInvoices = () => {
    navigate('/treasury/invoices');
  };

  // Navegar a la página de gastos
  const handleViewExpenses = () => {
    navigate('/treasury/expenses');
  };

  // Navegar a la página de informes
  const handleViewReports = () => {
    navigate('/treasury/reports');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tesorería</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleViewReports}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Generar Informe
          </button>
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
          {/* Resumen financiero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Balance Total</h2>
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">${stats.totalBalance.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Balance actual</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleViewReports}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  Ver detalles →
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Resumen Mensual</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ingresos</p>
                  <p className={`text-xl font-bold ${stats.monthlyIncome > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    ${stats.monthlyIncome.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gastos</p>
                  <p className={`text-xl font-bold ${stats.monthlyExpenses > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    ${stats.monthlyExpenses.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Balance mensual</p>
                <p className={`text-xl font-bold ${stats.monthlyIncome - stats.monthlyExpenses > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(stats.monthlyIncome - stats.monthlyExpenses).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Pagos Pendientes</h2>
              <div className="flex items-center">
                <div className="bg-amber-100 rounded-full p-3 mr-4">
                  <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingPayments}</p>
                  <p className="text-sm text-gray-500">Pagos pendientes</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleViewPayments}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  Ver pagos pendientes →
                </button>
              </div>
            </div>
          </div>
          
          {/* Accesos rápidos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={handleViewPayments}
              className="bg-white rounded-lg shadow p-6 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center">
                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-medium text-gray-900">Gestión de Pagos</h3>
                  <p className="text-sm text-gray-500">Registrar y dar seguimiento a pagos</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={handleViewInvoices}
              className="bg-white rounded-lg shadow p-6 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center">
                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-medium text-gray-900">Facturas</h3>
                  <p className="text-sm text-gray-500">Crear y gestionar facturas</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={handleViewExpenses}
              className="bg-white rounded-lg shadow p-6 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center">
                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-medium text-gray-900">Gastos</h3>
                  <p className="text-sm text-gray-500">Registrar y aprobar gastos</p>
                </div>
              </div>
            </button>
          </div>
          
          {/* Transacciones recientes */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700">Transacciones Recientes</h2>
            </div>
            <div className="p-6">
              {stats.recentTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descripción
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                            <div className="text-sm text-gray-500">{transaction.reference || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.status === 'completed' ? 'Completado' :
                               transaction.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No hay transacciones recientes</p>
              )}
              <div className="mt-4 text-right">
                <button
                  onClick={() => navigate('/treasury/transactions')}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  Ver todas las transacciones →
                </button>
              </div>
            </div>
          </div>
          
          {/* Gráfico de resumen anual */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700">Resumen Anual</h2>
            </div>
            <div className="p-6">
              {stats.annualSummary.length > 0 ? (
                <div className="h-64">
                  {/* Aquí se implementaría un gráfico con una biblioteca como Chart.js o Recharts */}
                  <div className="flex h-full items-end space-x-2">
                    {stats.annualSummary.map((month, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex space-x-1">
                          <div 
                            className="bg-green-500 rounded-t-sm" 
                            style={{ 
                              height: `${(month.income / Math.max(...stats.annualSummary.map(m => Math.max(m.income, m.expenses)))) * 180}px`,
                              width: '45%'
                            }}
                          ></div>
                          <div 
                            className="bg-red-500 rounded-t-sm" 
                            style={{ 
                              height: `${(month.expenses / Math.max(...stats.annualSummary.map(m => Math.max(m.income, m.expenses)))) * 180}px`,
                              width: '45%'
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(2023, index).toLocaleDateString('es-ES', { month: 'short' })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
                      <span className="text-xs text-gray-500">Ingresos</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
                      <span className="text-xs text-gray-500">Gastos</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No hay datos disponibles para el resumen anual</p>
              )}
              <div className="mt-4 text-right">
                <button
                  onClick={handleViewReports}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  Ver informes detallados →
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TreasuryDashboard;
