import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { treasuryService } from '../../services/api';

const TreasuryPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    pendingFees: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    date: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Cargar datos de transacciones y estadísticas desde el backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar transacciones
        const transactionsResponse = await treasuryService.getTransactions({
          page: pagination.currentPage,
          search: filters.search || undefined,
          type: filters.type || undefined,
          date: filters.date || undefined
        });
        
        setTransactions(transactionsResponse.data.results || []);
        setPagination({
          currentPage: transactionsResponse.data.current_page || 1,
          totalPages: transactionsResponse.data.total_pages || 1,
          totalItems: transactionsResponse.data.count || 0
        });
        
        // Cargar estadísticas financieras
        const summaryResponse = await treasuryService.getFinancialSummary();
        setStats({
          balance: summaryResponse.data.balance || 0,
          monthlyIncome: summaryResponse.data.monthly_income || 0,
          monthlyExpenses: summaryResponse.data.monthly_expenses || 0,
          pendingFees: summaryResponse.data.pending_fees || 0
        });
        
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos de tesorería:', err);
        setError('Error al cargar los datos de tesorería. Por favor, intente nuevamente.');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pagination.currentPage, filters]);

  // Funciones para manejar la navegación
  const handleRegisterIncome = () => {
    navigate('/treasury/transactions/new?type=income');
  };

  const handleRegisterExpense = () => {
    navigate('/treasury/transactions/new?type=expense');
  };

  const handleViewTransaction = (transactionId) => {
    navigate(`/treasury/transactions/${transactionId}`);
  };

  const handleEditTransaction = (transactionId) => {
    navigate(`/treasury/transactions/edit/${transactionId}`);
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Aplicar filtros
  const handleApplyFilters = () => {
    setPagination(prev => ({
      ...prev,
      currentPage: 1 // Resetear a la primera página al filtrar
    }));
  };

  // Manejar paginación
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }));
    }
  };

  // Formatear valores monetarios
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Tesorería</h1>
        <div className="flex space-x-2">
          <button 
            className="btn btn-primary"
            onClick={handleRegisterIncome}
          >
            Registrar Ingreso
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleRegisterExpense}
          >
            Registrar Gasto
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="dashboard-stat">
          <dt className="dashboard-stat-label">Balance Actual</dt>
          <dd className="dashboard-stat-value">{formatCurrency(stats.balance)}</dd>
        </div>
        <div className="dashboard-stat">
          <dt className="dashboard-stat-label">Ingresos del Mes</dt>
          <dd className="dashboard-stat-value">{formatCurrency(stats.monthlyIncome)}</dd>
        </div>
        <div className="dashboard-stat">
          <dt className="dashboard-stat-label">Gastos del Mes</dt>
          <dd className="dashboard-stat-value">{formatCurrency(stats.monthlyExpenses)}</dd>
        </div>
        <div className="dashboard-stat">
          <dt className="dashboard-stat-label">Cuotas Pendientes</dt>
          <dd className="dashboard-stat-value">{formatCurrency(stats.pendingFees)}</dd>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="search" className="label">Buscar</label>
            <input
              type="text"
              id="search"
              name="search"
              className="input"
              placeholder="Concepto, miembro, etc."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <label htmlFor="type" className="label">Tipo</label>
            <select 
              id="type" 
              name="type"
              className="input"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="income">Ingreso</option>
              <option value="expense">Gasto</option>
            </select>
          </div>
          <div>
            <label htmlFor="date" className="label">Fecha</label>
            <input
              type="date"
              id="date"
              name="date"
              className="input"
              value={filters.date}
              onChange={handleFilterChange}
            />
          </div>
          <div className="flex items-end">
            <button 
              className="btn btn-secondary w-full"
              onClick={handleApplyFilters}
            >
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      )}

      {/* Estado de carga */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Lista de Transacciones */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Concepto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miembro
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.description || transaction.concept || 'No especificado'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.member_name || 'No especificado'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`text-sm font-medium ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(Math.abs(transaction.amount))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-masonic-blue hover:text-blue-900 mr-3"
                          onClick={() => handleViewTransaction(transaction.id)}
                        >
                          Ver
                        </button>
                        <button 
                          className="text-masonic-blue hover:text-blue-900"
                          onClick={() => handleEditTransaction(transaction.id)}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No se encontraron transacciones con los criterios seleccionados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{transactions.length > 0 ? (pagination.currentPage - 1) * 10 + 1 : 0}</span> a <span className="font-medium">{Math.min(pagination.currentPage * 10, pagination.totalItems)}</span> de <span className="font-medium">{pagination.totalItems}</span> resultados
            </div>
            <div className="flex space-x-2">
              <button 
                className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Anterior
              </button>
              <button 
                className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TreasuryPage;
