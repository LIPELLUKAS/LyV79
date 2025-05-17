import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AttendanceRegister = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Cargar eventos y miembros al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Obtener eventos recientes y futuros
        const eventsResponse = await memberService.getEvents();
        setEvents(eventsResponse.data);
        
        // Obtener lista de miembros activos
        const membersResponse = await memberService.getAllMembers({ is_active: true });
        setMembers(membersResponse.data.results);
      } catch (err) {
        setError('Error al cargar datos. Por favor, intente nuevamente.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Cargar asistencia cuando se selecciona un evento
  useEffect(() => {
    if (selectedEvent) {
      const fetchAttendance = async () => {
        try {
          setLoading(true);
          const response = await memberService.getEventAttendance(selectedEvent.id);
          
          // Convertir la lista de asistencia a un objeto para facilitar su manejo
          const attendanceMap = {};
          response.data.forEach(item => {
            attendanceMap[item.user.id] = {
              is_present: item.is_present,
              excuse: item.excuse || '',
              id: item.id
            };
          });
          
          // Inicializar asistencia para miembros que no tienen registro
          const initialAttendance = {};
          members.forEach(member => {
            initialAttendance[member.id] = attendanceMap[member.id] || {
              is_present: false,
              excuse: '',
              id: null
            };
          });
          
          setAttendance(initialAttendance);
        } catch (err) {
          setError('Error al cargar la asistencia. Por favor, intente nuevamente.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchAttendance();
    }
  }, [selectedEvent, members]);

  const handleEventChange = (e) => {
    const eventId = parseInt(e.target.value);
    const event = events.find(event => event.id === eventId);
    setSelectedEvent(event);
    setSuccess(false);
  };

  const handleAttendanceChange = (memberId, field, value) => {
    setAttendance(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEvent) {
      setError('Por favor, seleccione un evento.');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // Preparar datos para enviar
      const attendanceData = Object.entries(attendance).map(([userId, data]) => ({
        user_id: parseInt(userId),
        event_id: selectedEvent.id,
        is_present: data.is_present,
        excuse: !data.is_present ? data.excuse : '',
        id: data.id
      }));
      
      // Enviar datos de asistencia
      await memberService.saveEventAttendance(selectedEvent.id, attendanceData);
      
      setSuccess(true);
    } catch (err) {
      setError('Error al guardar la asistencia. Por favor, intente nuevamente.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Registro de Asistencia</h1>
        <button
          onClick={() => navigate('/members')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Volver a Miembros
        </button>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">Asistencia guardada correctamente.</span>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-1">
            Seleccionar Evento
          </label>
          <select
            id="event"
            name="event"
            value={selectedEvent?.id || ''}
            onChange={handleEventChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            disabled={loading}
          >
            <option value="">Seleccione un evento</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.title} - {new Date(event.date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
        
        {selectedEvent && (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-800">
                {selectedEvent.title} - {new Date(selectedEvent.date).toLocaleDateString()}
              </h2>
              <p className="text-gray-600">{selectedEvent.description}</p>
            </div>
            
            {loading ? (
              <div className="text-center py-4">
                <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-gray-600">Cargando asistencia...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Miembro
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grado
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Asistencia
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Excusa (si ausente)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {members.map(member => (
                        <tr key={member.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {member.symbolic_name || `${member.first_name} ${member.last_name}`}
                                </div>
                                <div className="text-sm text-gray-500">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {member.degree === 1 ? 'Aprendiz' : 
                               member.degree === 2 ? 'Compañero' : 
                               member.degree === 3 ? 'Maestro' : 'Desconocido'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <input
                                  id={`present-${member.id}`}
                                  name={`attendance-${member.id}`}
                                  type="radio"
                                  checked={attendance[member.id]?.is_present === true}
                                  onChange={() => handleAttendanceChange(member.id, 'is_present', true)}
                                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                />
                                <label htmlFor={`present-${member.id}`} className="ml-2 block text-sm text-gray-700">
                                  Presente
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  id={`absent-${member.id}`}
                                  name={`attendance-${member.id}`}
                                  type="radio"
                                  checked={attendance[member.id]?.is_present === false}
                                  onChange={() => handleAttendanceChange(member.id, 'is_present', false)}
                                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                />
                                <label htmlFor={`absent-${member.id}`} className="ml-2 block text-sm text-gray-700">
                                  Ausente
                                </label>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={attendance[member.id]?.excuse || ''}
                              onChange={(e) => handleAttendanceChange(member.id, 'excuse', e.target.value)}
                              disabled={attendance[member.id]?.is_present === true}
                              className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:text-gray-500"
                              placeholder="Motivo de ausencia"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {saving ? 'Guardando...' : 'Guardar Asistencia'}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default AttendanceRegister;
