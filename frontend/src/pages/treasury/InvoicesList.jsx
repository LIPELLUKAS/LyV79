import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { treasuryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    date_range: 'all',
    sort: '-issue_date'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  
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

  // Cargar facturas al iniciar y cuando cambian los filtros
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        
        const params = {
          page: pagination.page,
          page_size: pagination.pageSize,
          ordering: filters.sort,
          status: filters.status !== 'all' ? filters.status : undefined,
          date_range: filters.date_range !== 'all' ? filters.date_range : undefined,
          search: filters.search || undefined
        };
        
        const response = await treasuryService.getAllInvoices(params);
        
        setInvoices(response.data.results || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.count || 0
        }));
      } catch (e) {
        setError('Error al cargar la lista de facturas');
        console.error('Error al cargar facturas:', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoices();
  }, [filters, pagination.page, pagination.pageSize]);

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    // Resetear a la primera página cuando cambian los filtros
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  // Manejar cambios de página
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Navegar al detalle de una factura
  const handleViewInvoice = (id) => {
    navigate(`/treasury/invoices/${id}`);
  };

  // Navegar a la página de creación de factura
  const handleCreateInvoice = () => {
    navigate('/treasury/invoices/new');
  };

  // Marcar factura como pagada
  const handleMarkAsPaid = async (id) => {
    try {
      await treasuryService.updateInvoiceStatus(id, { status: 'paid' });
      
      // Actualizar la lista de facturas
      setInvoices(prevInvoices => 
        prevInvoices.map(invoice => 
          invoice.id === id ? { ...invoice, status: 'paid' } : invoice
        )
      );
    } catch (e) {
      setError('Error al actualizar el estado de la factura');
      console.error('Error al actualizar factura:', e);
    }
  };

  // Calcular el rango de facturas mostradas
  const startItem = (pagination.page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
        <button
          onClick={handleCreateInvoice}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nueva Factura
        </button>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Número, destinatario, concepto..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">Todos</option>
              <option value="draft">Borrador</option>
              <option value="issued">Emitida</option>
              <option value="paid">Pagada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="date_range" className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              id="date_range"
              name="date_range"
              value={filters.date_range}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">Todos</option>
              <option value="current_month">Mes actual</option>
              <option value="last_month">Mes anterior</option>
              <option value="current_quarter">Trimestre actual</option>
              <option value="current_year">Año actual</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
            <select
              id="sort"
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="-issue_date">Fecha de emisión (reciente)</option>
              <option value="issue_date">Fecha de emisión (antigua)</option>
              <option value="-total_amount">Monto (mayor a menor)</option>
              <option value="total_amount">Monto (menor a mayor)</option>
              <option value="invoice_number">Número de factura</option>
            </select>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Lista de facturas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : invoices.length > 0 ? (
          <div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Factura
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destinatario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{invoice.invoice_number}</div>
                      <div className="text-sm text-gray-500">{invoice.reference || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {invoice.recipient_type === 'member' ? (
                          <>
                            <div className="flex-shrink-0 h-10 w-10">
                              {invoice.recipient.profile_image ? (
                                <img className="h-10 w-10 rounded-full" src={invoice.recipient.profile_image} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <span className="text-indigo-800 font-medium">
                                    {invoice.recipient.symbolic_name ? invoice.recipient.symbolic_name.charAt(0) : 
                                     invoice.recipient.first_name ? invoice.recipient.first_name.charAt(0) : 'M'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {invoice.recipient.symbolic_name || `${invoice.recipient.first_name} ${invoice.recipient.last_name}`}
                              </div>
                              <div className="text-sm text-gray-500">
                                {invoice.recipient.email}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{invoice.recipient_name}</div>
                            <div className="text-sm text-gray-500">{invoice.recipient_email || '-'}</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(invoice.issue_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.due_date ? `Vence: ${new Date(invoice.due_date).toLocaleDateString()}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${invoice.total_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'issued' ? 'bg-blue-100 text-blue-800' :
                        invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status === 'paid' ? 'Pagada' :
                         invoice.status === 'issued' ? 'Emitida' :
                         invoice.status === 'draft' ? 'Borrador' :
                         'Cancelada'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {invoice.status === 'issued' && (
                          <button
                            onClick={() => handleMarkAsPaid(invoice.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Marcar pagada
                          </button>
                        )}
                        <button
                          onClick={() => handleViewInvoice(invoice.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Paginación */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page * pagination.pageSize >= pagination.total}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.page * pagination.pageSize >= pagination.total ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{startItem}</span> a <span className="font-medium">{endItem}</span> de{' '}
                    <span className="font-medium">{pagination.total}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.page === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Anterior</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Números de página */}
                    {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }, (_, i) => i + 1)
                      .filter(page => {
                        // Mostrar solo algunas páginas para no sobrecargar la UI
                        const currentPage = pagination.page;
                        return page === 1 || 
                               page === Math.ceil(pagination.total / pagination.pageSize) || 
                               (page >= currentPage - 1 && page <= currentPage + 1);
                      })
                      .map((page, index, array) => {
                        // Agregar elipsis si hay saltos en la numeración
                        const showEllipsisBefore = index > 0 && page > array[index - 1] + 1;
                        const showEllipsisAfter = index < array.length - 1 && page < array[index + 1] - 1;
                        
                        return (
                          <React.Fragment key={page}>
                            {showEllipsisBefore && (
                              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                              </span>
                            )}
                            
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border ${
                                page === pagination.page
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              } text-sm font-medium`}
                            >
                              {page}
                            </button>
                            
                            {showEllipsisAfter && (
                              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                              </span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page * pagination.pageSize >= pagination.total}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.page * pagination.pageSize >= pagination.total ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
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
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron facturas</h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta ajustar los filtros de búsqueda o crea una nueva factura.
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreateInvoice}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Nueva Factura
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesList;
