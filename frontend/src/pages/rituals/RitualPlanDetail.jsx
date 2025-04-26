import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ritualsService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const RitualPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [ritualPlan, setRitualPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  
  // Verificar si el usuario tiene permisos para aprobar planes
  const canApprove = currentUser.office === 'Venerable Maestro';
  
  // Verificar si el usuario tiene permisos para editar planes
  const canEdit = 
    currentUser.office === 'Venerable Maestro' || 
    currentUser.office === 'Primer Vigilante' || 
    currentUser.office === 'Segundo Vigilante' ||
    (ritualPlan && ritualPlan.created_by === currentUser.id);
  
  // Cargar detalles del plan ritual
  useEffect(() => {
    const fetchRitualPlan = async () => {
      try {
        setLoading(true);
        const response = await ritualsService.getRitualPlanById(id);
        setRitualPlan(response.data);
      } catch (error) {
        console.error('Error al cargar el plan ritual:', error);
        showNotification('Error al cargar el plan ritual', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRitualPlan();
  }, [id, showNotification]);
  
  // Aprobar plan ritual
  const handleApprove = async () => {
    try {
      await ritualsService.approveRitualPlan(id);
      const response = await ritualsService.getRitualPlanById(id);
      setRitualPlan(response.data);
      showNotification('Plan ritual aprobado correctamente', 'success');
    } catch (error) {
      console.error('Error al aprobar el plan ritual:', error);
      showNotification('Error al aprobar el plan ritual', 'error');
    }
  };
  
  // Marcar como completado
  const handleComplete = async () => {
    try {
      await ritualsService.completeRitualPlan(id);
      const response = await ritualsService.getRitualPlanById(id);
      setRitualPlan(response.data);
      showNotification('Plan ritual marcado como completado', 'success');
    } catch (error) {
      console.error('Error al completar el plan ritual:', error);
      showNotification('Error al completar el plan ritual', 'error');
    }
  };
  
  // Cancelar plan ritual
  const handleCancel = async () => {
    try {
      await ritualsService.cancelRitualPlan(id);
      const response = await ritualsService.getRitualPlanById(id);
      setRitualPlan(response.data);
      showNotification('Plan ritual cancelado', 'success');
    } catch (error) {
      console.error('Error al cancelar el plan ritual:', error);
      showNotification('Error al cancelar el plan ritual', 'error');
    }
  };
  
  // Navegar a la página de edición
  const handleEdit = () => {
    navigate(`/rituals/plans/${id}/edit`);
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
      case 'special':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            Ceremonia Especial
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
  
  // Renderizar badge de grado
  const renderDegreeBadge = (degree) => {
    switch (degree) {
      case 1:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Aprendiz
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Compañero
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Maestro
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!ritualPlan) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Plan ritual no encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">
          El plan ritual que estás buscando no existe o no tienes permisos para verlo.
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/rituals/plans')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center">
            <button
              onClick={() => navigate('/rituals/plans')}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{ritualPlan.title}</h1>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {renderRitualTypeBadge(ritualPlan.ritual_type)}
            {renderStatusBadge(ritualPlan.status)}
            {renderDegreeBadge(ritualPlan.degree)}
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          {canEdit && ritualPlan.status === 'draft' && (
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Editar
            </button>
          )}
          
          {canApprove && ritualPlan.status === 'draft' && (
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Aprobar
            </button>
          )}
          
          {canEdit && ritualPlan.status === 'approved' && (
            <button
              onClick={handleComplete}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Marcar como completado
            </button>
          )}
          
          {canEdit && (ritualPlan.status === 'draft' || ritualPlan.status === 'approved') && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
      
      {/* Pestañas */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`${
              activeTab === 'details'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Detalles
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`${
              activeTab === 'roles'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Roles
          </button>
          <button
            onClick={() => setActiveTab('works')}
            className={`${
              activeTab === 'works'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Trabajos
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`${
              activeTab === 'attachments'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Adjuntos
          </button>
          <button
            onClick={() => setActiveTab('minutes')}
            className={`${
              activeTab === 'minutes'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Acta
          </button>
        </nav>
      </div>
      
      {/* Contenido de la pestaña activa */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {activeTab === 'details' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Información general</h2>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Fecha</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(ritualPlan.date).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Hora de inicio</dt>
                    <dd className="mt-1 text-sm text-gray-900">{ritualPlan.start_time}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Hora de finalización</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {ritualPlan.end_time || 'No especificada'}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Tipo de ritual</dt>
                    <dd className="mt-1 text-sm text-gray-900">{ritualPlan.ritual_type_display}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Grado</dt>
                    <dd className="mt-1 text-sm text-gray-900">{ritualPlan.degree}°</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Estado</dt>
                    <dd className="mt-1 text-sm text-gray-900">{ritualPlan.status_display}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Evento asociado</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {ritualPlan.event_title || 'No hay evento asociado'}
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Descripción</h2>
                <div className="prose prose-sm max-w-none text-gray-500">
                  {ritualPlan.description ? (
                    <p>{ritualPlan.description}</p>
                  ) : (
                    <p className="italic">No hay descripción disponible</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Notas adicionales</h2>
              <div className="prose prose-sm max-w-none text-gray-500">
                {ritualPlan.notes ? (
                  <p>{ritualPlan.notes}</p>
                ) : (
                  <p className="italic">No hay notas adicionales</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'roles' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Asignación de roles</h2>
              {canEdit && (ritualPlan.status === 'draft' || ritualPlan.status === 'approved') && (
                <button
                  onClick={() => navigate(`/rituals/plans/${id}/roles/edit`)}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Editar roles
                </button>
              )}
            </div>
            
            {ritualPlan.roles && ritualPlan.roles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Miembro
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ritualPlan.roles.map((role) => (
                      <tr key={role.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {role.role_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {role.member_name || 'No asignado'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {role.status === 'confirmed' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Confirmado
                            </span>
                          ) : role.status === 'pending' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pendiente
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              No asignado
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay roles asignados</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Aún no se han asignado roles para este plan ritual.
                </p>
                {canEdit && (ritualPlan.status === 'draft' || ritualPlan.status === 'approved') && (
                  <div className="mt-6">
                    <button
                      onClick={() => navigate(`/rituals/plans/${id}/roles/edit`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Asignar roles
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'works' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Trabajos planificados</h2>
              {canEdit && (ritualPlan.status === 'draft' || ritualPlan.status === 'approved') && (
                <button
                  onClick={() => navigate(`/rituals/plans/${id}/works/edit`)}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Editar trabajos
                </button>
              )}
            </div>
            
            {ritualPlan.works && ritualPlan.works.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Título
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Presentador
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duración
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ritualPlan.works.map((work) => (
                      <tr key={work.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {work.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {work.presenter_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {work.duration} minutos
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {work.status === 'confirmed' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Confirmado
                            </span>
                          ) : work.status === 'pending' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pendiente
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Borrador
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay trabajos planificados</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Aún no se han planificado trabajos para este ritual.
                </p>
                {canEdit && (ritualPlan.status === 'draft' || ritualPlan.status === 'approved') && (
                  <div className="mt-6">
                    <button
                      onClick={() => navigate(`/rituals/plans/${id}/works/edit`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Añadir trabajos
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'attachments' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Documentos adjuntos</h2>
              {canEdit && (ritualPlan.status === 'draft' || ritualPlan.status === 'approved') && (
                <button
                  onClick={() => navigate(`/rituals/plans/${id}/attachments/edit`)}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Gestionar adjuntos
                </button>
              )}
            </div>
            
            {ritualPlan.attachments && ritualPlan.attachments.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {ritualPlan.attachments.map((attachment) => (
                  <li key={attachment.id} className="py-4 flex">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                      <p className="text-sm text-gray-500">
                        {attachment.file_type} • {attachment.file_size}
                      </p>
                    </div>
                    <div className="ml-auto flex-shrink-0">
                      <a
                        href={attachment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Descargar
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos adjuntos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Aún no se han adjuntado documentos a este plan ritual.
                </p>
                {canEdit && (ritualPlan.status === 'draft' || ritualPlan.status === 'approved') && (
                  <div className="mt-6">
                    <button
                      onClick={() => navigate(`/rituals/plans/${id}/attachments/edit`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Añadir documentos
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'minutes' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Acta del ritual</h2>
              {canEdit && ritualPlan.status === 'completed' && (
                <button
                  onClick={() => navigate(`/rituals/plans/${id}/minutes/edit`)}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {ritualPlan.has_minutes ? 'Editar acta' : 'Crear acta'}
                </button>
              )}
            </div>
            
            {ritualPlan.has_minutes ? (
              <div className="prose prose-sm max-w-none text-gray-500">
                <div dangerouslySetInnerHTML={{ __html: ritualPlan.minutes_content }} />
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay acta disponible</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {ritualPlan.status === 'completed'
                    ? 'El ritual ha sido completado pero aún no se ha creado el acta.'
                    : 'El acta estará disponible una vez que el ritual haya sido completado.'}
                </p>
                {canEdit && ritualPlan.status === 'completed' && (
                  <div className="mt-6">
                    <button
                      onClick={() => navigate(`/rituals/plans/${id}/minutes/edit`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Crear acta
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RitualPlanDetail;
