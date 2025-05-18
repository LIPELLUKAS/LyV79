import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const MembersList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [degrees, setDegrees] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Cargar miembros y grados
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar grados
        const degreesResponse = await memberService.getMemberDegrees();
        setDegrees(degreesResponse.data || []);
        
        // Cargar miembros con paginación
        const params = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage
        };
        
        const membersResponse = await memberService.getMembers(params);
        setMembers(membersResponse.data.results || []);
        
        // Actualizar información de paginación
        setPagination({
          ...pagination,
          totalPages: Math.ceil(membersResponse.data.count / pagination.itemsPerPage),
          totalItems: membersResponse.data.count
        });
        
        setFilteredMembers(membersResponse.data.results || []);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        showNotification('Error al cargar la lista de miembros', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [pagination.currentPage, pagination.itemsPerPage, showNotification]);

  // Filtrar miembros
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
          is_active: selectedStatus === 'active' ? true : 
                    selectedStatus === 'inactive' ? false : undefined
        };
        
        // Filtrar desde el servidor
        const response = await memberService.getMembers(params);
        
        setFilteredMembers(response.data.results || []);
        
        // Actualizar información de paginación
        setPagination({
          ...pagination,
          currentPage: 1,
          totalPages: Math.ceil(response.data.count / pagination.itemsPerPage),
          totalItems: response.data.count
        });
      } catch (err) {
        console.error('Error al filtrar miembros:', err);
        showNotification('Error al filtrar miembros', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    // Solo aplicar filtros si hay algún filtro activo
    if (searchTerm || selectedDegree || selectedStatus) {
      applyFilters();
    } else if (members.length > 0) {
      // Si no hay filtros, mostrar todos los miembros cargados
      setFilteredMembers(members);
    }
  }, [searchTerm, selectedDegree, selectedStatus, pagination.itemsPerPage, showNotification]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDegreeFilter = (e) => {
    setSelectedDegree(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDegree('');
    setSelectedStatus('');
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

  const handleViewMember = (memberId) => {
    navigate(`/members/detail/${memberId}`);
  };

  const handleEditMember = (memberId) => {
    navigate(`/members/edit/${memberId}`);
  };

  const handleAddMember = () => {
    navigate('/members/new');
  };

  // Función para obtener el nombre del grado
  const getDegreeName = (degreeId) => {
    const degree = degrees.find(d => d.id === degreeId);
    return degree ? degree.name : 'Desconocido';
  };

  if (loading && members.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Miembros</h1>
        <button
          onClick={handleAddMember}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Miembro
        </button>
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Nombre, email, cargo..."
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
              {degrees.map(degree => (
                <option key={degree.id} value={degree.id}>
                  {degree.name}
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
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
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
      
      {/* Tabla de miembros */}
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
                  Miembro
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
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
              {filteredMembers.length > 0 ? (
                filteredMembers.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {member.photo ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={member.photo} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-800 font-medium">
                                {member.first_name && member.last_name 
                                  ? `${member.first_name[0]}${member.last_name[0]}`
                                  : member.symbolic_name ? member.symbolic_name[0].toUpperCase() : '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.first_name && member.last_name 
                              ? `${member.first_name} ${member.last_name}`
                              : member.symbolic_name || 'Sin nombre'}
                          </div>
                          {member.symbolic_name && (
                            <div className="text-sm text-gray-500">
                              {member.symbolic_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.email}</div>
                      <div className="text-sm text-gray-500">{member.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.degree === 1 
                          ? 'bg-blue-100 text-blue-800' 
                          : member.degree === 2
                            ? 'bg-yellow-100 text-yellow-800'
                            : member.degree === 3
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getDegreeName(member.degree)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.office || 'Sin cargo'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewMember(member.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleEditMember(member.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    {loading ? 'Cargando miembros...' : 'No se encontraron miembros con los filtros seleccionados'}
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

export default MembersList;
