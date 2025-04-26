import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { communicationsService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
const EventDetail = () => {
  const { eventId } = useParams();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState('pending');
  const [showAttendees, setShowAttendees] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  // Cargar detalles del evento
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await communicationsService.getEventById(eventId);
        setEvent(response.data);
        
        // Cargar lista de asistentes
        const attendeesResponse = await communicationsService.getEventAttendees(eventId);
        setAttendees(attendeesResponse.data);
        
        // Obtener estado de asistencia del usuario actual
        const userAttendance = attendeesResponse.data.find(
          attendee => attendee.user_id === currentUser.id
        );
        
        if (userAttendance) {
          setAttendanceStatus(userAttendance.status);
        }
      } catch (error) {
        console.error('Error al cargar detalles del evento:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId, currentUser.id]);
  // Confirmar asistencia a un evento
  const handleConfirmAttendance = async (status) => {
    try {
      await communicationsService.updateEventAttendance(eventId, {
        status: status
      });
      
      setAttendanceStatus(status);
      
      // Actualizar la lista de asistentes
      const attendeesResponse = await communicationsService.getEventAttendees(eventId);
      setAttendees(attendeesResponse.data);
    } catch (error) {
      console.error('Error al actualizar asistencia:', error);
    }
  };
  
  // Verificar si un evento ya pasó
  const isPastEvent = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    return eventDate < now;
  };
  
  // Renderizar badge de estado de asistencia
  const renderAttendanceStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Confirmado
          </span>
        );
      case 'tentative':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Tentativo
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Declinado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Pendiente
          </span>
        );
    }
  };
  
  // Formatear fecha y hora
  const formatDateTime = (dateString, timeString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return `${date.toLocaleDateString('es-ES', options)} a las ${timeString}`;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Evento no encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">
          El evento que estás buscando no existe o no tienes permisos para verlo.
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/events')}
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
              onClick={() => navigate('/events')}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {formatDateTime(event.start_date, event.start_time)}
          </p>
        </div>
        
        {currentUser.is_staff && (
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/events/${eventId}/edit`)}
              className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Editar
            </button>
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas cancelar este evento?')) {
                  // Implementar lógica para cancelar evento
                }
              }}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancelar evento
            </button>
          </div>
        )}
      </div>
      
      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detalles del evento */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Detalles del evento</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Información completa</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Título</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{event.title}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {event.description || 'Sin descripción'}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Fecha de inicio</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDateTime(event.start_date, event.start_time)}
                  </dd>
                </div>
                {event.end_date && (
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Fecha de finalización</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDateTime(event.end_date, event.end_time || event.start_time)}
                    </dd>
                  </div>
                )}
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {event.location || 'Sin ubicación especificada'}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Organizador</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {event.organizer_name || 'Desconocido'}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Tipo de evento</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {event.event_type_display || 'Otro'}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Estado</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {event.status === 'scheduled' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Programado
                      </span>
                    )}
                    {event.status === 'cancelled' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Cancelado
                      </span>
                    )}
                    {event.status === 'completed' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Completado
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* Asistentes */}
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Asistentes</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {attendees.length} {attendees.length === 1 ? 'persona' : 'personas'} invitadas
                </p>
              </div>
              <button
                onClick={() => setShowAttendees(!showAttendees)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                {showAttendees ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            
            {showAttendees && (
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {attendees.map((attendee) => (
                    <li key={attendee.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 font-medium">
                                {attendee.user_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{attendee.user_name}</div>
                            <div className="text-sm text-gray-500">{attendee.user_email || 'Sin correo'}</div>
                          </div>
                        </div>
                        <div>
                          {renderAttendanceStatusBadge(attendee.status)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Tu asistencia</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Confirma tu participación en este evento
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500">Tu asistencia</h3>
                <div className="mt-1">
                  {renderAttendanceStatusBadge(attendanceStatus)}
                </div>
                
                {!isPastEvent(event.start_date) && (
                  <div className="mt-4 flex flex-col space-y-2">
                    <button
                      onClick={() => handleConfirmAttendance('confirmed')}
                      className={`w-full px-4 py-2 text-sm font-medium rounded-md ${
                        attendanceStatus === 'confirmed'
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Confirmar asistencia
                    </button>
                    <button
                      onClick={() => handleConfirmAttendance('tentative')}
                      className={`w-full px-4 py-2 text-sm font-medium rounded-md ${
                        attendanceStatus === 'tentative'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Tentativo
                    </button>
                    <button
                      onClick={() => handleConfirmAttendance('declined')}
                      className={`w-full px-4 py-2 text-sm font-medium rounded-md ${
                        attendanceStatus === 'declined'
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Declinar
                    </button>
                  </div>
                )}
              </div>
              
              {event.calendar_url && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500">Añadir a calendario</h3>
                  <div className="mt-2">
                    <a
                      href={event.calendar_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Añadir a calendario
                    </a>
                  </div>
                </div>
              )}
              
              {event.location && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500">Ubicación</h3>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-700">{event.location}</p>
                    {event.location_url && (
                      <a
                        href={event.location_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        <svg className="-ml-1 mr-1 h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Ver en mapa
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              {event.attachments && event.attachments.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500">Archivos adjuntos</h3>
                  <ul className="mt-2 divide-y divide-gray-200">
                    {event.attachments.map((attachment) => (
                      <li key={attachment.id} className="py-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span className="ml-2 flex-1 w-0 truncate text-sm text-gray-500">
                            {attachment.name}
                          </span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <a
                            href={attachment.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-indigo-600 hover:text-indigo-500 text-sm"
                          >
                            Descargar
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
