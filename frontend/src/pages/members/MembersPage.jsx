import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberService } from '../../services/api';

const MembersPage = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    grade: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Cargar datos de miembros desde el backend
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await memberService.getMembers({
          page: pagination.currentPage,
          search: filters.search || undefined,
          grade: filters.grade || undefined,
          status: filters.status || undefined
        });
        
        setMembers(response.data.results || []);
        setPagination({
          currentPage: response.data.current_page || 1,
          totalPages: response.data.total_pages || 1,
          totalItems: response.data.count || 0
        });
        setError(null);
      } catch (err) {
        console.error('Error al cargar miembros:', err);
        setError('Error al cargar la lista de miembros. Por favor, intente nuevamente.');
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [pagination.currentPage, filters]);

  // Función para manejar la navegación al formulario de nuevo miembro
  const handleAddMember = () => {
    navigate('/members/new');
  };

  // Funciones para manejar la visualización y edición de miembros
  const handleViewMember = (memberId) => {
    navigate(`/members/${memberId}`);
  };

  const handleEditMember = (memberId) => {
    navigate(`/members/edit/${memberId}`);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Miembros</h1>
        <button 
          className="btn btn-primary"
          onClick={handleAddMember}
        >
          Nuevo Miembro
        </button>
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
              placeholder="Nombre, grado, etc."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <label htmlFor="grade" className="label">Grado</label>
            <select 
              id="grade" 
              name="grade"
              className="input"
              value={filters.grade}
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="aprendiz">Aprendiz</option>
              <option value="companero">Compañero</option>
              <option value="maestro">Maestro Masón</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="label">Estado</label>
            <select 
              id="status" 
              name="status"
              className="input"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="suspendido">Suspendido</option>
            </select>
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
          {/* Lista de Miembros */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Logia
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Pago
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.length > 0 ? (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-masonic-blue flex items-center justify-center text-white">
                            {member.first_name ? member.first_name.charAt(0) : '?'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.first_name} {member.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.degree || 'No especificado'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.lodge || 'Luz y Verdad #79'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {member.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.last_payment_date || 'No registrado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-masonic-blue hover:text-blue-900 mr-3"
                          onClick={() => handleViewMember(member.id)}
                        >
                          Ver
                        </button>
                        <button 
                          className="text-masonic-blue hover:text-blue-900 mr-3"
                          onClick={() => handleEditMember(member.id)}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No se encontraron miembros con los criterios seleccionados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{members.length > 0 ? (pagination.currentPage - 1) * 10 + 1 : 0}</span> a <span className="font-medium">{Math.min(pagination.currentPage * 10, pagination.totalItems)}</span> de <span className="font-medium">{pagination.totalItems}</span> resultados
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

export default MembersPage;
