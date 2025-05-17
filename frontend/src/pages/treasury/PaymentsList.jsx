import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { treasuryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const PaymentsList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedFeeType, setSelectedFeeType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
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
        
        // Cargar tipos de cuotas
        const feeTypesResponse = await treasuryService.getFeeTypes();
        setFeeTypes(feeTypesResponse.data || []);
        
        // Cargar pagos con paginación
        const params = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage
        };
        
        const paymentsResponse = await treasuryService.getPayments(params);
        setPayments(paymentsResponse.data.results || []);
        setFilteredPayments(paymentsResponse.data.results || []);
        
        // Actualizar información de paginación
        setPagination({
          ...pagination,
          totalPages: Math.ceil(paymentsResponse.data.count / pagination.itemsPerPage),
          totalItems: paymentsResponse.data.count
        });
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
        showNotification('Error al cargar los datos necesarios', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [pagination.currentPage, pagination.itemsPerPage, showNotification]);

  // Filtrar pagos
  useEffect(() => {
    const applyFilters = async () => {
      try {
        setLoading(true);
        
        // Construir parámetros de filtro
        const params = {
          page: 1, // Resetear a primera página al filtrar
          limit: pagination.itemsPerPage,
          search: searchTerm || undefined,
          member_id: selectedMember || undefined,
          fee_type_id: selectedFeeType || undefined,
          status: selectedStatus || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined
        };
        
        // Filtrar desde el servidor
        const response = await treasuryService.getPayments(params);
        
        setFilteredPayments(response.data.results || []);
        
        // Actualizar información de paginación
        setPagination({
          ...pagination,
          currentPage: 1,
          totalPages: Math.ceil(response.data.count / pagination.itemsPerPage),
          totalItems: response.data.count
        });
      } catch (err) {
        console.error('Error al filtrar pagos:', err);
        showNotification('Error al filtrar pagos', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    // Solo aplicar filtros si hay algún filtro activo
    if (searchTerm || selectedMember || selectedFeeType || selectedStatus || dateFrom || dateTo) {
      applyFilters();
    } else if (payments.length > 0) {
      // Si no hay filtros, mostrar todos los pagos cargados
      setFilteredPayments(payments);
    }
  }, [searchTerm, selectedMember, selectedFeeType, selectedStatus, dateFrom, dateTo, pagination.itemsPerPage, showNotification]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMemberFilter = (e) => {
    setSelectedMember(e.target.value);
  };

  const handleFeeTypeFilter = (e) => {
    setSelectedFeeType(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleDateFromChange = (e) => {
    setDateFrom(e.target.value);
  };

  const handleDateToChange = (e) => {
    setDateTo(e.target.value);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedMember('');
    setSelectedFeeType('');
    setSelectedStatus('');
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

  const handleViewPayment = (paymentId) => {
    navigate(`/treasury/payments/detail/${paymentId}`);
  };

  const handleEditPayment = (paymentId) => {
    navigate(`/treasury/payments/edit/${paymentId}`);
  };

  const handleAddPayment = () => {
    navigate('/treasury/payments/new');
  };

  const handleSendReminder = async (paymentId) => {
    try {
      await treasuryService.sendPaymentReminder(paymentId);
      showNotification('Recordatorio enviado correctamente', 'success');
    } catch (err) {
      console.error('Error al enviar recordatorio:', err);
      showNotification('Error al enviar recordatorio', 'error');
    }
  };

  // Función para obtener el nombre del miembro
  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId);
    return member ? `${member.first_name} ${member.last_name}` : 'Desconocido';
  };

  // Función para obtener el nombre del tipo de cuota
  const getFeeTypeName = (feeTypeId) => {
    const feeType = feeTypes.find(ft => ft.id === feeTypeId);
    return feeType ? feeType.name : 'Desconocido';
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

  if (loading && payments.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Pagos</h1>
        <button
          onClick={handleAddPayment}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Pago
        </button>
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
              placeholder="Referencia, descripción..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
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
            <label htmlFor="feeType" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Cuota
            </label>
            <select
              id="feeType"
              value={selectedFeeType}
              onChange={handleFeeTypeFilter}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Todos los tipos</option>
              {feeTypes.map(feeType => (
                <option key={feeType.id} value={feeType.id}>
                  {feeType.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="status"
              value={selectedStatus}
              onChange={handleStatusFilter}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
              <option value="overdue">Vencido</option>
              <option value="cancelled">Cancelado</option>
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
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
      
      {/* Tabla de pagos */}
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
                  Referencia
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miembro
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length > 0 ? (
                filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.reference_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getMemberName(payment.member_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getFeeTypeName(payment.fee_type_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatAmount(payment.amount, payment.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(payment.due_date)}
                      </div>
                      {payment.payment_date && (
                        <div className="text-sm text-gray-500">
                          Pagado: {formatDate(payment.payment_date)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : payment.status === 'overdue'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}>
                        {payment.status === 'paid' 
                          ? 'Pagado' 
                          : payment.status === 'pending'
                            ? 'Pendiente'
                            : payment.status === 'overdue'
                              ? 'Vencido'
                              : 'Cancelado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewPayment(payment.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Ver
                        </button>
                        {(payment.status === 'pending' || payment.status === 'overdue') && (
                          <>
                            <button
                              onClick={() => handleEditPayment(payment.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleSendReminder(payment.id)}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              Recordar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    {loading ? 'Cargando pagos...' : 'No se encontraron pagos con los filtros seleccionados'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">
                Mostrar
              </span>
              <select
                value={pagination.itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="mr-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-gray-700">
                de {pagination.totalItems} resultados
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  pagination.currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                &laquo;
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  pagination.currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                &lsaquo;
              </button>
              
              <span className="text-sm text-gray-700">
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-3 py-1 rounded-md ${
                  pagination.currentPage === pagination.totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                &rsaquo;
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-3 py-1 rounded-md ${
                  pagination.currentPage === pagination.totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                &raquo;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsList;
