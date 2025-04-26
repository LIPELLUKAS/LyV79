import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { communicationsService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
const EventForm = ({ eventId = null }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      event_type: 'regular',
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
      location: 'Templo Principal',
      description: '',
      required_degree: 1,
      dress_code: 'Formal',
      agenda: '',
      notes: '',
      notify_members: true
    }
  });
  
  const eventType = watch('event_type');
  const requiredDegree = watch('required_degree');
  
  // Cargar datos del evento si estamos en modo edición
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      
      try {
        setLoading(true);
        const response = await communicationsService.getEventById(eventId);
        const event = response.data;
        
        // Formatear fechas para los inputs
        const startDate = new Date(event.start_date);
        const startDateStr = startDate.toISOString().split('T')[0];
        const startTimeStr = event.start_time || startDate.toTimeString().slice(0, 5);
        
        let endDateStr = '';
        let endTimeStr = '';
        
        if (event.end_date) {
          const endDate = new Date(event.end_date);
          endDateStr = endDate.toISOString().split('T')[0];
          endTimeStr = event.end_time || endDate.toTimeString().slice(0, 5);
        }
        
        // Establecer valores en el formulario
        setValue('title', event.title);
        setValue('event_type', event.event_type);
        setValue('start_date', startDateStr);
        setValue('start_time', startTimeStr);
        setValue('end_date', endDateStr);
        setValue('end_time', endTimeStr);
        setValue('location', event.location);
        setValue('description', event.description);
        setValue('required_degree', event.required_degree);
        setValue('dress_code', event.dress_code);
        setValue('agenda', event.agenda);
        setValue('notes', event.notes);
        
        // Cargar asistentes
        const attendeesResponse = await communicationsService.getEventAttendees(eventId);
        setSelectedMembers(attendeesResponse.data.map(attendee => attendee.user_id));
      } catch (error) {
        console.error('Error al cargar datos del evento:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventData();
  }, [eventId, setValue]);
  
  // Cargar miembros disponibles
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await communicationsService.getMembers({ degree: requiredDegree });
        setMembers(response.data);
      } catch (error) {
        console.error('Error al cargar miembros:', error);
      }
    };
    
    fetchMembers();
  }, [requiredDegree]);
  
  // Manejar selección de miembros
  const handleMemberSelection = (memberId) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };
  
  // Seleccionar todos los miembros
  const handleSelectAllMembers = () => {
    setSelectedMembers(members.map(member => member.id));
  };
  
  // Deseleccionar todos los miembros
  const handleDeselectAllMembers = () => {
    setSelectedMembers([]);
  };
  
  // Enviar formulario
  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      const eventData = {
        ...data,
        attendees: selectedMembers
      };
      
      if (eventId) {
        await communicationsService.updateEvent(eventId, eventData);
      } else {
        await communicationsService.createEvent(eventData);
      }
      
      navigate('/events');
    } catch (error) {
      console.error('Error al guardar evento:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {eventId ? 'Editar evento' : 'Crear nuevo evento'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {eventId ? 'Modifica los detalles del evento' : 'Completa el formulario para crear un nuevo evento'}
          </p>
        </div>
      </div>
      
      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Título */}
              <div className="sm:col-span-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Título *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="title"
                    {...register('title', { required: 'El título es obligatorio' })}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.title ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>
              </div>
              
              {/* Tipo de evento */}
              <div className="sm:col-span-2">
                <label htmlFor="event_type" className="block text-sm font-medium text-gray-700">
                  Tipo de evento
                </label>
                <div className="mt-1">
                  <select
                    id="event_type"
                    {...register('event_type')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="regular">Tenida Regular</option>
                    <option value="special">Tenida Especial</option>
                    <option value="white">Tenida Blanca</option>
                    <option value="instruction">Instrucción</option>
                    <option value="social">Evento Social</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>
              
              {/* Fecha de inicio */}
              <div className="sm:col-span-3">
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                  Fecha de inicio *
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="start_date"
                    {...register('start_date', { required: 'La fecha de inicio es obligatoria' })}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.start_date ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                  )}
                </div>
              </div>
              
              {/* Hora de inicio */}
              <div className="sm:col-span-3">
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                  Hora de inicio *
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    id="start_time"
                    {...register('start_time', { required: 'La hora de inicio es obligatoria' })}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.start_time ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.start_time && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
                  )}
                </div>
              </div>
              
              {/* Fecha de finalización */}
              <div className="sm:col-span-3">
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                  Fecha de finalización
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="end_date"
                    {...register('end_date')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Hora de finalización */}
              <div className="sm:col-span-3">
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                  Hora de finalización
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    id="end_time"
                    {...register('end_time')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Ubicación */}
              <div className="sm:col-span-3">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Ubicación
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="location"
                    {...register('location')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Grado requerido */}
              <div className="sm:col-span-3">
                <label htmlFor="required_degree" className="block text-sm font-medium text-gray-700">
                  Grado requerido
                </label>
                <div className="mt-1">
                  <select
                    id="required_degree"
                    {...register('required_degree')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="1">1° Aprendiz</option>
                    <option value="2">2° Compañero</option>
                    <option value="3">3° Maestro</option>
                  </select>
                </div>
              </div>
              
              {/* Código de vestimenta */}
              <div className="sm:col-span-3">
                <label htmlFor="dress_code" className="block text-sm font-medium text-gray-700">
                  Código de vestimenta
                </label>
                <div className="mt-1">
                  <select
                    id="dress_code"
                    {...register('dress_code')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="Formal">Formal</option>
                    <option value="Semi-formal">Semi-formal</option>
                    <option value="Casual">Casual</option>
                    <option value="Traje oscuro">Traje oscuro</option>
                    <option value="Tenida de gala">Tenida de gala</option>
                  </select>
                </div>
              </div>
              
              {/* Descripción */}
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    rows={3}
                    {...register('description')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Breve descripción del evento.
                </p>
              </div>
              
              {/* Agenda */}
              <div className="sm:col-span-6">
                <label htmlFor="agenda" className="block text-sm font-medium text-gray-700">
                  Agenda
                </label>
                <div className="mt-1">
                  <textarea
                    id="agenda"
                    rows={3}
                    {...register('agenda')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Agenda detallada del evento.
                </p>
              </div>
              
              {/* Notas adicionales */}
              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notas adicionales
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    rows={3}
                    {...register('notes')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Información adicional para los asistentes.
                </p>
              </div>
              
              {/* Notificar a miembros */}
              <div className="sm:col-span-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="notify_members"
                      type="checkbox"
                      {...register('notify_members')}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="notify_members" className="font-medium text-gray-700">
                      Notificar a miembros
                    </label>
                    <p className="text-gray-500">
                      Enviar notificaciones por correo electrónico a los miembros invitados.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Selección de miembros */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Invitar miembros</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Selecciona los miembros que deseas invitar a este evento.</p>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-500">
                  {selectedMembers.length} de {members.length} miembros seleccionados
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleSelectAllMembers}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    Seleccionar todos
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAllMembers}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    Deseleccionar todos
                  </button>
                </div>
              </div>
                
              <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
                {members.length === 0 ? (
                  <p className="text-sm text-gray-500 p-2">
                    No hay miembros disponibles para el grado seleccionado.
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {members.map((member) => (
                      <li key={member.id} className="py-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`member-${member.id}`}
                            checked={selectedMembers.includes(member.id)}
                            onChange={() => handleMemberSelection(member.id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`member-${member.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                            {member.name}
                            {member.office && (
                              <span className="ml-2 text-sm text-gray-500">({member.office})</span>
                            )}
                          </label>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar evento'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
