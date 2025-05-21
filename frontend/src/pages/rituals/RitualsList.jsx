import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ritualService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const RitualsList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [rituals, setRituals] = useState([]);
  const [filteredRituals, setFilteredRituals] = useState([]);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('');
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

  // Cargar rituales
  useEffect(() => {
    const fetchRituals = async () => {
      try {
        setLoading(true);
        
        // Cargar rituales con paginación
        const params = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage
        };
        
        const ritualsResponse = await ritualService.getRituals(params);
        setRituals(ritualsResponse.data.results || []);
        setFilteredRituals(ritualsResponse.data.results || []);
        
        // Actualizar información de paginación
        setPagination({
          ...pagination,
          totalPages: Math.ceil(ritualsResponse.data.count / pagination.itemsPerPage),
          totalItems: ritualsResponse.data.count
        });
      } catch (err) {
        console.error('Error al cargar rituales:', err);
        showNotification('Error al cargar los rituales', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRituals();
  }, [pagination.currentPage, pagination.itemsPerPage, showNotification]);

  // Filtrar rituales
  useEffect(() => {
    const applyFilters = async () => {
      try {
        setLoading(true);
        
        // Construir parámetros de filtro
        const params = {
          page: 1, // Resetear a primera página al filtrar
          limit: pagination.itemsPerPage,
          search: searchTerm || undefined,
          degree: selectedDegree || undefined,
          status: selectedStatus || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined
        };
        
        // Filtrar desde el servidor
        const response = await ritualService.getRituals(params);
        
        setFilteredRituals(response.data.results || []);
        
        // Actualizar información de paginación
        setPagination({
          ...pagination,
          currentPage: 1,
          totalPages: Math.ceil(response.data.count / pagination.itemsPerPage),
          totalItems: response.data.count
        });
      } catch (err) {
        console.error('Error al filtrar rituales:', err);
        showNotification('Error al filtrar rituales', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    // Solo aplicar filtros si hay algún filtro activo
    if (searchTerm || selectedDegree || selectedStatus || dateFrom || dateTo) {
      applyFilters();
    } else if (rituals.length > 0) {
      // Si no hay filtros, mostrar todos los rituales cargados
      setFilteredRituals(rituals);
    }
  }, [searchTerm, selectedDegree, selectedStatus, dateFrom, dateTo, pagination.itemsPerPage, showNotification]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDegreeFilter = (e) => {
    setSelectedDegree(e.target.value);
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
    setSelectedDegree('');
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

  const handleViewRitual = (ritualId) => {
    navigate(`/rituals/detail/${ritualId}`);
  };

  const handleEditRitual = (ritualId) => {
    navigate(`/rituals/edit/${ritualId}`);
  };

  const handleAddRitual = () => {
    navigate('/rituals/new');
  };

  const handleDeleteRitual = async (ritualId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este ritual? Esta acción no se puede deshacer.')) {
      try {
        await ritualService.deleteRitual(ritualId);
        
        // Actualizar lista de rituales
        setRituals(rituals.filter(ritual => ritual.id !== ritualId));
        setFilteredRituals(filteredRituals.filter(ritual => ritual.id !== ritualId));
        
        showNotification('Ritual eliminado correctamente', 'success');
      } catch (err) {
        console.error('Error al eliminar ritual:', err);
        showNotification('Error al eliminar el ritual', 'error');
      }
    }
  };

  // Función para obtener el nombre del grado
  const getDegreeName = (degree) => {
    switch (degree) {
      case 1:
        return 'Aprendiz';
      case 2:
        return 'Compañero';
      case 3:
        return 'Maestro';
      default:
        return 'Desconocido';
    }
  };

  // Función para obtener el nombre del estado
  const getStatusName = (status) => {
    switch (status) {
      case 'scheduled':
        return 'Programado';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      case 'postponed':
        return 'Pospuesto';
      default:
        return 'Desconocido';
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Función para formatear hora
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5); // Formato HH:MM
  };

  // Verificar si el usuario tiene permisos para editar/eliminar
  const canEditRitual = (ritual) => {
    return currentUser && (
      currentUser.is_admin || 
      currentUser.office === 'Venerable Maestro' || 
      currentUser.office === 'Secretario' ||
      (ritual.created_by === currentUser.id)
    );
  };

  if (loading && rituals.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Rituales</h1>
        <button
          onClick={handleAddRitual}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Ritual
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
              placeholder="Título, descripción, lugar..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">
              Grado
            </label>
            <select
              id="degree"
              value={selectedDegree}
              onChange={handleDegreeFilter}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Todos los grados</option>
              <option value="1">Aprendiz</option>
              <option value="2">Compañero</option>
              <option value="3">Maestro</option>
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
              <option value="scheduled">Programado</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
              <option value="postponed">Pospuesto</option>
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
          
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>
      
      {/* Lista de rituales */}
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
                  Título
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lugar
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
              {filteredRituals.length > 0 ? (
                filteredRituals.map(ritual => (
                  <tr key={ritual.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {ritual.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ritual.description && ritual.description.length > 50
                          ? `${ritual.description.substring(0, 50)}...`
                          : ritual.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(ritual.date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(ritual.time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getDegreeName(ritual.degree)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {ritual.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        ritual.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : ritual.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : ritual.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getStatusName(ritual.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewRitual(ritual.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Ver
                        </button>
                        {canEditRitual(ritual) && (
                          <>
                            <button
                              onClick={() => handleEditRitual(ritual.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Editar
                            </button>
                            {ritual.status !== 'completed' && (
                              <button
                                onClick={() => handleDeleteRitual(ritual.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Eliminar
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    {loading ? 'Cargando rituales...' : 'No se encontraron rituales con los filtros seleccionados'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {filteredRituals.length > 0 && (
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
        )}
      </div>
    </div>
  );
};

export default RitualsList;
