import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ritualsService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const RitualPlansList = () => {
  const [loading, setLoading] = useState(true);
  const [ritualPlans, setRitualPlans] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Cargar planes rituales
  useEffect(() => {
    const fetchRitualPlans = async () => {
      try {
        setLoading(true);
        const response = await ritualsService.getRitualPlans({
          page,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : null,
          type: typeFilter !== 'all' ? typeFilter : null,
          limit: 10
        });
        
        setRitualPlans(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10));
      } catch (error) {
        console.error('Error al cargar planes rituales:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRitualPlans();
  }, [page, searchTerm, statusFilter, typeFilter]);

  // Navegar a la página de detalle del plan ritual
  const handleViewRitualPlan = (planId) => {
    navigate(`/rituals/plans/${planId}`);
  };

  // Navegar a la página de creación de plan ritual
  const handleCreateRitualPlan = () => {
    navigate('/rituals/plans/new');
  };

  // Renderizar badge de tipo de ritual
  const renderRitualTypeBadge = (type) => {
    switch (type) {
      case 'regular':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Tenida Regular
          </span>
        );
      case 'initiation':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Iniciación
          </span>
        );
      case 'passing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Pase de Grado
          </span>
        );
      case 'raising':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Exaltación
          </span>
        );
      case 'installation':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Instalación
          </span>
        );
      case 'instruction':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            Instrucción
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Otro
          </span>
        );
    }
  };

  // Renderizar badge de estado del plan
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Borrador
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Aprobado
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Completado
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Desconocido
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Planes Rituales</h1>
        {(currentUser.office === 'Venerable Maestro' || 
          currentUser.office === 'Primer Vigilante' || 
          currentUser.office === 'Segundo Vigilante' || 
          currentUser.degree >= 3) && (
          <button
            onClick={handleCreateRitualPlan}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Crear nuevo plan ritual
          </button>
        )}
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Buscar por título o descripción..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="approved">Aprobado</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de ritual
            </label>
            <select
              id="type-filter"
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="regular">Tenida Regular</option>
              <option value="initiation">Iniciación</option>
              <option value="passing">Pase de Grado</option>
              <option value="raising">Exaltación</option>
              <option value="installation">Instalación</option>
              <option value="instruction">Instrucción</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Lista de planes rituales */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : ritualPlans.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron planes rituales</h3>
          <p className="mt-1 text-sm text-gray-500">
            No hay planes rituales que coincidan con los criterios de búsqueda.
          </p>
          {(currentUser.office === 'Venerable Maestro' || 
            currentUser.office === 'Primer Vigilante' || 
            currentUser.office === 'Segundo Vigilante' || 
            currentUser.degree >= 3) && (
            <div className="mt-6">
              <button
                onClick={handleCreateRitualPlan}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Crear nuevo plan ritual
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {ritualPlans.map((plan) => (
              <li 
                key={plan.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewRitualPlan(plan.id)}
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {plan.ritual_type === 'regular' && (
                          <svg className="h-10 w-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                        {plan.ritual_type === 'initiation' && (
                          <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                        )}
                        {plan.ritual_type === 'passing' && (
                          <svg className="h-10 w-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        )}
                        {plan.ritual_type === 'raising' && (
                          <svg className="h-10 w-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                          </svg>
                        )}
                        {plan.ritual_type === 'installation' && (
                          <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                        {plan.ritual_type === 'instruction' && (
                          <svg className="h-10 w-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h2 className="text-lg font-medium text-gray-900">{plan.title}</h2>
                          <div className="ml-2 flex space-x-1">
                            {renderRitualTypeBadge(plan.ritual_type)}
                            {renderStatusBadge(plan.status)}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>Fecha: {new Date(plan.scheduled_date).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>Grado: {plan.degree}°</span>
                          {plan.candidate_name && (
                            <>
                              <span className="mx-2">•</span>
                              <span>Candidato: {plan.candidate_name}</span>
                            </>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {plan.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              page === 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              page === totalPages
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default RitualPlansList;
