import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { communicationsService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const EventsList = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('upcoming');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventType, setEventType] = useState('all');
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Cargar eventos
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await communicationsService.getEvents({
          page,
          filter,
          search: searchTerm,
          event_type: eventType,
          limit: 10
        });
        
        setEvents(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10));
      } catch (error) {
        console.error('Error al cargar eventos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [page, filter, searchTerm, eventType]);

  // Navegar a la página de detalle del evento
  const handleViewEvent = (eventId) => {
    navigate(`/communications/events/${eventId}`);
  };

  // Navegar a la página de creación de evento
  const handleCreateEvent = () => {
    navigate('/communications/events/new');
  };

  // Confirmar asistencia a un evento
  const handleConfirmAttendance = async (eventId, status) => {
    try {
      await communicationsService.updateAttendance(eventId, { status });
      
      // Actualizar estado local
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, attendance_status: status } 
            : event
        )
      );
    } catch (error) {
      console.error('Error al confirmar asistencia:', error);
    }
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

  // Verificar si un evento ya pasó
  const isPastEvent = (date) => {
    return new Date(date) < new Date();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendario de Eventos</h1>
        {currentUser && (currentUser.office === 'Venerable Maestro' || 
                          currentUser.office === 'Secretario' || 
                          currentUser.degree >= 3) && (
          <button
            onClick={handleCreateEvent}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Crear Evento
          </button>
        )}
      </div>
      
      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="upcoming">Próximos</option>
              <option value="past">Pasados</option>
              <option value="all">Todos</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Evento</label>
            <select
              id="eventType"
              value={eventType}
              onChange={(e) => { setEventType(e.target.value); setPage(1); }}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">Todos</option>
              <option value="regular">Tenida Regular</option>
              <option value="instruction">Instrucción</option>
              <option value="ceremony">Ceremonia</option>
              <option value="social">Evento Social</option>
              <option value="committee">Comité</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Título, descripción..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
      
      {/* Lista de eventos */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay eventos</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'upcoming' 
              ? 'No hay eventos programados próximamente.' 
              : filter === 'past'
                ? 'No hay eventos pasados registrados.'
                : 'No hay eventos que coincidan con los criterios de búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {events.map((event) => (
              <li key={event.id} className="p-6 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleViewEvent(event.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                        {renderEventTypeBadge(event.event_type)}
                        {event.required_degree > 1 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            Grado {event.required_degree}+
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {new Date(event.start_date).toLocaleDateString()} {new Date(event.start_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          {event.end_date && ` - ${new Date(event.end_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                      
                      {event.description && (
                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex flex-col items-end space-y-2">
                    {renderAttendanceStatusBadge(event.attendance_status)}
                    
                    {!isPastEvent(event.start_date) && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleConfirmAttendance(event.id, 'confirmed')}
                          className={`px-3 py-1 text-xs font-medium rounded ${
                            event.attendance_status === 'confirmed'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          Asistiré
                        </button>
                        <button
                          onClick={() => handleConfirmAttendance(event.id, 'tentative')}
                          className={`px-3 py-1 text-xs font-medium rounded ${
                            event.attendance_status === 'tentative'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          Tal vez
                        </button>
                        <button
                          onClick={() => handleConfirmAttendance(event.id, 'declined')}
                          className={`px-3 py-1 text-xs font-medium rounded ${
                            event.attendance_status === 'declined'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          No asistiré
                        </button>
                      </div>
                    )}
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

export default EventsList;
