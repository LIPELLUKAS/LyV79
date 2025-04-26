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
      await communicationsService.updateAttendance(eventId, { status });
      setAttendanceStatus(status);
      
      // Actualizar la lista de asistentes
      const attendeesResponse = await communicationsService.getEventAttendees(eventId);
      setAttendees(attendeesResponse.data);
    } catch (error) {
      console.error('Error al confirmar asistencia:', error);
    }
  };

  // Editar evento
  const handleEditEvent = () => {
    navigate(`/communications/events/edit/${eventId}`);
  };

  // Eliminar evento
  const handleDeleteEvent = async () => {
    if (window.confirm('¿Está seguro de que desea eliminar este evento? Esta acción no se puede deshacer.')) {
      try {
        await communicationsService.deleteEvent(eventId);
        navigate('/communications/events');
      } catch (error) {
        console.error('Error al eliminar evento:', error);
      }
    }
  };

  // Verificar si un evento ya pasó
  const isPastEvent = (date) => {
    return new Date(date) < new Date();
  };

  // Renderizar badge de tipo de evento
  const renderEventTypeBadge = (type) => {
    switch (type) {
      case 'regular':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Tenida Regular
          </span>
        );
      case 'instruction':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Instrucción
          </span>
        );
      case 'ceremony':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Ceremonia
          </span>
        );
      case 'social':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Evento Social
          </span>
        );
      case 'committee':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Comité
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

  // Renderizar badge de estado de asistencia
  const renderAttendanceStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Confirmado
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            No Asistirá
          </span>
        );
      case 'tentative':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Tentativo
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Evento no encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            El evento que está buscando no existe o ha sido eliminado.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/communications/events')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Volver al calendario
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/communications/events')}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900"
        >
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al calendario
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Encabezado del evento */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                {renderEventTypeBadge(event.event_type)}
                {event.required_degree > 1 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Grado {event.required_degree}+
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Organizado por: {event.organizer_name}
              </p>
            </div>
            
            {(currentUser.office === 'Venerable Maestro' || 
              currentUser.office === 'Secretario' || 
              currentUser.id === event.organizer_id) && (
              <div className="mt-4 md:mt-0 flex space-x-2">
                <button
                  onClick={handleEditEvent}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Detalles del evento */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Detalles</h2>
                <div className="prose max-w-none text-gray-500">
                  {event.description ? (
                    <p>{event.description}</p>
                  ) : (
                    <p className="text-gray-400 italic">No hay descripción disponible.</p>
                  )}
                </div>
              </div>
              
              {event.agenda && (
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Agenda</h2>
                  <div className="prose max-w-none text-gray-500">
                    <p>{event.agenda}</p>
                  </div>
                </div>
              )}
              
              {event.notes && (
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Notas adicionales</h2>
                  <div className="prose max-w-none text-gray-500">
                    <p>{event.notes}</p>
                  </div>
                </div>
              )}
              
              {/* Lista de asistentes */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-medium text-gray-900">Asistentes</h2>
                  <button
                    onClick={() => setShowAttendees(!showAttendees)}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    {showAttendees ? 'Ocultar' : 'Mostrar'} ({attendees.length})
                  </button>
                </div>
                
                {showAttendees && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {attendees.map((attendee) => (
                        <div key={attendee.id} className="flex items-center space-x-2">
                          <div className="flex-shrink-0">
                            {attendee.profile_image ? (
                              <img
                                className="h-8 w-8 rounded-full"
                                src={attendee.profile_image}
                                alt={attendee.name}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-gray-600 font-medium text-sm">
                                  {attendee.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {attendee.name}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {renderAttendanceStatusBadge(attendee.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Información del evento</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Fecha y hora</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(event.start_date).toLocaleDateString()} {new Date(event.start_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      {event.end_date && (
                        <>
                          <br />
                          hasta {new Date(event.end_date).toLocaleDateString()} {new Date(event.end_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </>
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Ubicación</h3>
                    <p className="mt-1 text-sm text-gray-900">{event.location}</p>
                  </div>
                  
                  {event.dress_code && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Código de vestimenta</h3>
                      <p className="mt-1 text-sm text-gray-900">{event.dress_code}</p>
                    </div>
                  )}
                  
                  <div>
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
                          onClick={() => handleConfirmAttendance('tenta
(Content truncated due to size limit. Use line ranges to read in chunks)