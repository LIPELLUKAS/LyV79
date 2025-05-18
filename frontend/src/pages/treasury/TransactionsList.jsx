import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { treasuryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const TransactionsList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Verificar permisos - Solo tesorero, VM y secretario pueden acceder
  useEffect(() => {
    if (currentUser && 
        !(currentUser.office === 'Tesorero' || 
          currentUser.office === 'Venerable Maestro' || 
          currentUser.office === 'Secretario' ||
          currentUser.is_admin)) {
      showNotification('No tienes permisos para acceder a esta sección', 'error');
      navigate('/dashboard');
    }
  }, [currentUser, navigate, showNotification]);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Cargar lista de miembros
        const membersResponse = await treasuryService.getMembersList();
        setMembers(membersResponse.data || []);
        
        // Cargar categorías
        const categoriesResponse = await treasuryService.getAllTransactionCategories();
        setCategories(categoriesResponse.data || []);
        
        // Cargar transacciones con paginación
        const params = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage
        };
        
        const transactionsResponse = await treasuryService.getTransactions(params);
        setTransactions(transactionsResponse.data.results || []);
        setFilteredTransactions(transactionsResponse.data.results || []);
        
        // Actualizar información de paginación
        setPagination({
          ...pagination,
          totalPages: Math.ceil(transactionsResponse.data.count / pagination.itemsPerPage),
          totalItems: transactionsResponse.data.count
        });
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
        showNotification('Error al cargar los datos necesarios', 'error');
        
        // Datos de respaldo en caso de error
        setTransactions([
          { id: 1, type: 'income', description: 'Cuota mensual', member_name: 'Juan Pérez', category_name: 'Cuotas', amount: 50.00, date: '2025-05-05', status: 'completed' },
          { id: 2, type: 'income', description: 'Cuota mensual', member_name: 'Carlos Rodríguez', category_name: 'Cuotas', amount: 50.00, date: '2025-05-03', status: 'completed' },
          { id: 3, type: 'expense', description: 'Material de oficina', member_name: 'Tesorero', category_name: 'Administración', amount: 75.50, date: '2025-05-01', status: 'completed' },
          { id: 4, type: 'income', description: 'Donación', member_name: 'Fernando López', category_name: 'Donaciones', amount: 100.00, date: '2025-04-28', status: 'completed' },
          { id: 5, type: 'expense', description: 'Mantenimiento', member_name: 'Tesorero', category_name: 'Mantenimiento', amount: 120.00, date: '2025-04-25', status: 'completed' },
        ]);
        setFilteredTransactions([
          { id: 1, type: 'income', description: 'Cuota mensual', member_name: 'Juan Pérez', category_name: 'Cuotas', amount: 50.00, date: '2025-05-05', status: 'completed' },
          { id: 2, type: 'income', description: 'Cuota mensual', member_name: 'Carlos Rodríguez', category_name: 'Cuotas', amount: 50.00, date: '2025-05-03', status: 'completed' },
          { id: 3, type: 'expense', description: 'Material de oficina', member_name: 'Tesorero', category_name: 'Administración', amount: 75.50, date: '2025-05-01', status: 'completed' },
          { id: 4, type: 'income', description: 'Donación', member_name: 'Fernando López', category_name: 'Donaciones', amount: 100.00, date: '2025-04-28', status: 'completed' },
          { id: 5, type: 'expense', description: 'Mantenimiento', member_name: 'Tesorero', category_name: 'Mantenimiento', amount: 120.00, date: '2025-04-25', status: 'completed' },
        ]);
        
        // Categorías de respaldo
        setCategories([
          { id: 1, name: 'Cuotas', type: 'income' },
          { id: 2, name: 'Donaciones', type: 'income' },
          { id: 3, name: 'Eventos', type: 'income' },
          { id: 4, name: 'Administración', type: 'expense' },
          { id: 5, name: 'Mantenimiento', type: 'expense' },
          { id: 6, name: 'Rituales', type: 'expense' },
        ]);
        
        // Miembros de respaldo
        setMembers([
          { id: 1, first_name: 'Juan', last_name: 'Pérez' },
          { id: 2, first_name: 'Carlos', last_name: 'Rodríguez' },
          { id: 3, first_name: 'Fernando', last_name: 'López' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [pagination.currentPage, pagination.itemsPerPage, showNotification]);

  // Filtrar transacciones
  useEffect(() => {
    const applyFilters = async () => {
      try {
        setLoading(true);
        
        // Construir parámetros de filtro
        const params = {
          page: 1, // Resetear a primera página al filtrar
          limit: pagination.itemsPerPage,
          search: searchTerm || undefined,
          type: selectedType || undefined,
          category_id: selectedCategory || undefined,
          member_id: selectedMember || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined
        };
        
        // Filtrar desde el servidor
        const response = await treasuryService.getTransactions(params);
        
        setFilteredTransactions(response.data.results || []);
        
        // Actualizar información de paginación
        setPagination({
          ...pagination,
          currentPage: 1,
          totalPages: Math.ceil(response.data.count / pagination.itemsPerPage),
          totalItems: response.data.count
        });
      } catch (err) {
        console.error('Error al filtrar transacciones:', err);
        showNotification('Error al filtrar transacciones', 'error');
        
        // Filtrar localmente como respaldo
        const filtered = transactions.filter(transaction => {
          // Filtro por término de búsqueda
          if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
          }
          
          // Filtro por tipo
          if (selectedType && transaction.type !== selectedType) {
            return false;
          }
          
          // Filtro por categoría
          if (selectedCategory && transaction.category_id !== parseInt(selectedCategory)) {
            return false;
          }
          
          // Filtro por miembro
          if (selectedMember && transaction.member_id !== parseInt(selectedMember)) {
            return false;
          }
          
          // Filtro por fecha desde
          if (dateFrom && new Date(transaction.date) < new Date(dateFrom)) {
            return false;
          }
          
          // Filtro por fecha hasta
          if (dateTo && new Date(transaction.date) > new Date(dateTo)) {
            return false;
          }
          
          return true;
        });
        
        setFilteredTransactions(filtered);
      } finally {
        setLoading(false);
      }
    };
    
    // Solo aplicar filtros si hay algún filtro activo
    if (searchTerm || selectedType || selectedCategory || selectedMember || dateFrom || dateTo) {
      applyFilters();
    } else if (transactions.length > 0) {
      // Si no hay filtros, mostrar todas las transacciones cargadas
      setFilteredTransactions(transactions);
    }
  }, [searchTerm, selectedType, selectedCategory, selectedMember, dateFrom, dateTo, pagination.itemsPerPage, showNotification, transactions]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeFilter = (e) => {
    setSelectedType(e.target.value);
    // Resetear categoría si cambia el tipo
    setSelectedCategory('');
  };

  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleMemberFilter = (e) => {
    setSelectedMember(e.target.value);
  };

  const handleDateFromChange = (e) => {
    setDateFrom(e.target.value);
  };

  const handleDateToChange = (e) => {
    setDateTo(e.target.value);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedCategory('');
    setSelectedMember('');
    setDateFrom('');
    setDateTo('');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({
        ...pagination,
        currentPage: newPage
      });
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setPagination({
      ...pagination,
      itemsPerPage: newItemsPerPage,
      currentPage: 1 // Resetear a primera página
    });
  };

  const handleViewTransaction = (transactionId) => {
    navigate(`/treasury/transactions/${transactionId}`);
  };

  const handleEditTransaction = (transactionId, type) => {
    navigate(`/treasury/transactions/edit/${transactionId}?type=${type}`);
  };

  const handleAddIncome = () => {
    navigate('/treasury/income/new');
  };

  const handleAddExpense = () => {
    navigate('/treasury/expense/new');
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Función para formatear monto
  const formatAmount = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Función para obtener color según tipo
  const getTypeColor = (type) => {
    return type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Función para obtener texto de tipo
  const getTypeText = (type) => {
    return type === 'income' ? 'Ingreso' : 'Gasto';
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Transacciones</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleAddIncome}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Ingreso
          </button>
          <button
            onClick={handleAddExpense}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Gasto
          </button>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Descripción, referencia..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              id="type"
              value={selectedType}
              onChange={handleTypeFilter}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Todos los tipos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={handleCategoryFilter}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Todas las categorías</option>
              {categories
                .filter(cat => !selectedType || cat.type === selectedType)
                .map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              }
            </select>
          </div>
          
          <div>
            <label htmlFor="member" className="block text-sm font-medium text-gray-700 mb-1">
              Miembro
            </label>
            <select
              id="member"
              value={selectedMember}
              onChange={handleMemberFilter}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Todos los miembros</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.first_name} {member.last_name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              id="dateFrom"
              value={dateFrom}
              onChange={handleDateFromChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              id="dateTo"
              value={dateTo}
              onChange={handleDateToChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
      
      {/* Tabla de transacciones */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        
        <div className="overflow-x-auto">
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
                  Descripción
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
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
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                        {getTypeText(transaction.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                      <div className="text-sm text-gray-500">{transaction.reference_number || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.category_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.member_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'} {formatAmount(transaction.amount, transaction.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewTransaction(transaction.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleEditTransaction(transaction.id, transaction.type)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron transacciones que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {filteredTransactions.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                  pagination.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                  pagination.currentPage === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> a <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                  </span> de <span className="font-medium">{pagination.totalItems}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                      pagination.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Números de página */}
                  {[...Array(pagination.totalPages).keys()].map(page => {
                    const pageNumber = page + 1;
                    // Mostrar solo algunas páginas para no sobrecargar la UI
                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.totalPages ||
                      (pageNumber >= pagination.currentPage - 1 && pageNumber <= pagination.currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNumber === pagination.currentPage
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      (pageNumber === 2 && pagination.currentPage > 3) ||
                      (pageNumber === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2)
                    ) {
                      return (
                        <span
                          key={pageNumber}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                      pagination.currentPage === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
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
      </div>
    </div>
  );
};

export default TransactionsList;
