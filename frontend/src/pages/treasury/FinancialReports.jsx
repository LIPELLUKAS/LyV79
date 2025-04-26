import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { treasuryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const FinancialReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  
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

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Cargar resumen financiero del mes actual
        const response = await treasuryService.getFinancialReport({
          report_type: 'monthly',
          start_date: dateRange.start_date,
          end_date: dateRange.end_date
        });
        
        setReportData(response.data);
      } catch (e) {
        setError('Error al cargar los datos financieros');
        console.error('Error al cargar datos:', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Generar reporte
  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      setError(null);
      
      const response = await treasuryService.getFinancialReport({
        report_type: reportType,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date
      });
      
      setReportData(response.data);
      setDownloadUrl(null); // Resetear URL de descarga al generar nuevo reporte
    } catch (e) {
      setError('Error al generar el reporte financiero');
      console.error('Error al generar reporte:', e);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Exportar reporte
  const handleExportReport = async (format) => {
    try {
      setGeneratingReport(true);
      
      const response = await treasuryService.exportFinancialReport({
        report_type: reportType,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        format: format
      });
      
      // Crear URL para descargar el archivo
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      
      // Crear un enlace temporal y hacer clic en él para descargar
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `reporte_financiero_${dateRange.start_date}_${dateRange.end_date}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(`Error al exportar el reporte en formato ${format.toUpperCase()}`);
      console.error('Error al exportar reporte:', e);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'report_type') {
      setReportType(value);
      
      // Ajustar fechas según el tipo de reporte
      if (value === 'monthly') {
        setDateRange({
          start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        });
      } else if (value === 'quarterly') {
        const currentMonth = new Date().getMonth();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        setDateRange({
          start_date: new Date(new Date().getFullYear(), quarterStartMonth, 1).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        });
      } else if (value === 'annual') {
        setDateRange({
          start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        });
      } else if (value === 'custom') {
        // Mantener las fechas actuales para el rango personalizado
      }
    } else {
      setDateRange(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Informes Financieros</h1>
      </div>
      
      {/* Filtros y opciones de reporte */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="report_type" className="block text-sm font-medium text-gray-700 mb-1">Tipo de informe</label>
            <select
              id="report_type"
              name="report_type"
              value={reportType}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
              <option value="annual">Anual</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={dateRange.start_date}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={dateRange.end_date}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                generatingReport ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {generatingReport ? 'Generando...' : 'Generar Informe'}
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Contenido del reporte */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : reportData ? (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Informe Financiero: {
                reportType === 'monthly' ? 'Mensual' :
                reportType === 'quarterly' ? 'Trimestral' :
                reportType === 'annual' ? 'Anual' : 'Personalizado'
              }
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => handleExportReport('pdf')}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF
              </button>
              <button
                onClick={() => handleExportReport('xlsx')}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Resumen financiero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ingresos</h3>
                <p className="text-3xl font-bold text-green-600">${reportData.income.total.toLocaleString()}</p>
                <div className="mt-4 space-y-2">
                  {reportData.income.categories.map((category, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm text-gray-600">{category.name}</span>
                      <span className="text-sm font-medium text-gray-900">${category.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Gastos</h3>
                <p className="text-3xl font-bold text-red-600">${reportData.expenses.total.toLocaleString()}</p>
                <div className="mt-4 space-y-2">
                  {reportData.expenses.categories.map((category, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm text-gray-600">{category.name}</span>
                      <span className="text-sm font-medium text-gray-900">${category.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Balance</h3>
                <p className={`text-3xl font-bold ${reportData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${reportData.balance.toLocaleString()}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Saldo inicial</span>
                    <span className="text-sm font-medium text-gray-900">${reportData.initial_balance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Saldo final</span>
                    <span className="text-sm font-medium text-gray-900">${reportData.final_balance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Variación</span>
                    <span className={`text-sm font-medium ${reportData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {reportData.balance >= 0 ? '+' : ''}{reportData.balance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Gráfico de ingresos vs gastos */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ingresos vs Gastos</h3>
              <div className="h-64 bg-gray-50 rounded-lg p-4">
                {/* Aquí se implementaría un gráfico con una biblioteca como Chart.js o Recharts */}
                <div className="flex h-full items-end space-x-4">
                  {reportData.monthly_data.map((month, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex space-x-1">
                        <div 
                          className="bg-green-500 rounded-t-sm" 
                          style={{ 
                            height: `${(month.income / Math.max(...reportData.monthly_data.map(m => Math.max(m.income, m.expenses)))) * 180}px`,
                            width: '45%'
                          }}
                        ></div>
                        <div 
                          className="bg-red-500 rounded-t-sm" 
                          style={{ 
                            height: `${(month.expenses / Math.max(...reportData.monthly_data.map(m => Math.max(m.income, m.expenses)))) * 180}px`,
                            width: '45%'
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {month.label}
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
            </div>
            
            {/* Transacciones recientes */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Transacciones Recientes</h3>
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
                        Categoría
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                          <div className="text-sm text-gray-500">{transaction.reference || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.category}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No hay datos disponibles para el período seleccionado</p>
        </div>
      )}
    </div>
  );
};

export default FinancialReports;
