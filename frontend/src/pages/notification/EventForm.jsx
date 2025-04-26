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
        const startTimeStr = startDate.toTimeString().slice(0, 5);
        
        let endDateStr = '';
        let endTimeStr = '';
        if (event.end_date) {
          const endDate = new Date(event.end_date);
          endDateStr = endDate.toISOString().split('T')[0];
          endTimeStr = endDate.toTimeString().slice(0, 5);
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
        
        // Cargar miembros invitados
        const attendeesResponse = await communicationsService.getEventAttendees(eventId);
        setSelectedMembers(attendeesResponse.data.map(a => a.user_id));
      } catch (error) {
        console.error('Error al cargar datos del evento:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventData();
  }, [eventId, setValue]);
  
  // Cargar lista de miembros
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await communicationsService.getEligibleMembers(requiredDegree);
        setMembers(response.data);
      } catch (error) {
        console.error('Error al cargar miembros:', error);
      }
    };
    
    fetchMembers();
  }, [requiredDegree]);
  
  // Manejar selección de miembros
  const handleMemberSelection = (userId) => {
    setSelectedMembers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
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
      
      // Combinar fecha y hora
      const startDateTime = new Date(`${data.start_date}T${data.start_time}`);
      let endDateTime = null;
      if (data.end_date && data.end_time) {
        endDateTime = new Date(`${data.end_date}T${data.end_time}`);
      }
      
      const eventData = {
        title: data.title,
        event_type: data.event_type,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime ? endDateTime.toISOString() : null,
        location: data.location,
        description: data.description,
        required_degree: parseInt(data.required_degree),
        dress_code: data.dress_code,
        agenda: data.agenda,
        notes: data.notes,
        attendees: selectedMembers,
        notify_members: data.notify_members
      };
      
      if (eventId) {
        // Modo edición
        await communicationsService.updateEvent(eventId, eventData);
      } else {
        // Modo creación
        await communicationsService.createEvent(eventData);
      }
      
      navigate('/communications/events');
    } catch (error) {
      console.error('Error al guardar evento:', error);
      alert('Ha ocurrido un error al guardar el evento. Por favor, inténtelo de nuevo.');
    } finally {
      setSubmitting(false);
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
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-900">
            {eventId ? 'Editar Evento' : 'Crear Nuevo Evento'}
          </h1>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información básica */}
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Título del evento *
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title', { required: 'El título es obligatorio' })}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="event_type" className="block text-sm font-medium text-gray-700">
                  Tipo de evento *
                </label>
                <select
                  id="event_type"
                  {...register('event_type', { required: 'El tipo de evento es obligatorio' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="regular">Tenida Regular</option>
                  <option value="instruction">Instrucción</option>
                  <option value="ceremony">Ceremonia</option>
                  <option value="social">Evento Social</option>
                  <option value="committee">Comité</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="required_degree" className="block text-sm font-medium text-gray-700">
                  Grado requerido *
                </label>
                <select
                  id="required_degree"
                  {...register('required_degree', { required: 'El grado requerido es obligatorio' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="1">Aprendiz (1°)</option>
                  <option value="2">Compañero (2°)</option>
                  <option value="3">Maestro (3°)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                  Fecha de inicio *
                </label>
                <input
                  type="date"
                  id="start_date"
                  {...register('start_date', { required: 'La fecha de inicio es obligatoria' })}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.start_date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                  Hora de inicio *
                </label>
                <input
                  type="time"
                  id="start_time"
                  {...register('start_time', { required: 'La hora de inicio es obligatoria' })}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.start_time ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
                {errors.start_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                  Fecha de finalización
                </label>
                <input
                  type="date"
                  id="end_date"
                  {...register('end_date')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                  Hora de finalización
                </label>
                <input
                  type="time"
                  id="end_time"
                  {...register('end_time')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Ubicación *
                </label>
                <input
                  type="text"
                  id="location"
                  {...register('location', { required: 'La ubicación es obligatoria' })}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.location ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="dress_code" className="block text-sm font-medium text-gray-700">
                  Código de vestimenta
                </label>
                <input
                  type="text"
                  id="dress_code"
                  {...register('dress_code')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            {/* Detalles adicionales */}
            <div className="space-y-6">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  id="description"
                  rows={3}
                  {...register('description')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="agenda" className="block text-sm font-medium text-gray-700">
                  Agenda
                </label>
                <textarea
                  id="agenda"
                  rows={3}
                  {...register('agenda')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notas adicionales
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  {...register('notes')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Invitar miembros</h3>
                  <div className="flex space-x-2">
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
                           
(Content truncated due to size limit. Use line ranges to read in chunks)