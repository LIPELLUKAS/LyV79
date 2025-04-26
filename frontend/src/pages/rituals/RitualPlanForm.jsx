import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ritualsService, communicationsService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const RitualPlanForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const isEditMode = !!id;
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    ritual_type: 'regular',
    degree: 1,
    event: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [events, setEvents] = useState([]);
  
  // Cargar datos del plan ritual si estamos en modo edición
  useEffect(() => {
    const fetchData = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const response = await ritualsService.getRitualPlanById(id);
          
          // Formatear la fecha para el input date
          const date = new Date(response.data.date);
          const formattedDate = date.toISOString().split('T')[0];
          
          setFormData({
            title: response.data.title,
            description: response.data.description || '',
            date: formattedDate,
            start_time: response.data.start_time,
            end_time: response.data.end_time || '',
            ritual_type: response.data.ritual_type,
            degree: response.data.degree,
            event: response.data.event || ''
          });
        } catch (error) {
          console.error('Error al cargar el plan ritual:', error);
          showNotification('Error al cargar el plan ritual', 'error');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, [id, isEditMode, showNotification]);
  
  // Cargar eventos disponibles
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await communicationsService.getEvents({
          upcoming: true,
          limit: 100
        });
        setEvents(response.data.results);
      } catch (error) {
        console.error('Error al cargar eventos:', error);
      }
    };
    
    fetchEvents();
  }, []);
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Validar campos requeridos
      if (!formData.title || !formData.date || !formData.start_time || !formData.ritual_type) {
        showNotification('Por favor, complete todos los campos requeridos', 'error');
        return;
      }
      
      // Crear o actualizar el plan ritual
      if (isEditMode) {
        await ritualsService.updateRitualPlan(id, formData);
        showNotification('Plan ritual actualizado correctamente', 'success');
      } else {
        const response = await ritualsService.createRitualPlan(formData);
        showNotification('Plan ritual creado correctamente', 'success');
        navigate(`/rituals/plans/${response.data.id}`);
        return;
      }
      
      navigate(`/rituals/plans/${id}`);
    } catch (error) {
      console.error('Error al guardar el plan ritual:', error);
      showNotification('Error al guardar el plan ritual', 'error');
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
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Editar plan ritual' : 'Crear nuevo plan ritual'}
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Título */}
            <div className="sm:col-span-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Título <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
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
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Breve descripción del trabajo ritual.
              </p>
            </div>
            
            {/* Fecha */}
            <div className="sm:col-span-3">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Fecha <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Hora de inicio */}
            <div className="sm:col-span-3">
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                Hora de inicio <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="time"
                  name="start_time"
                  id="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
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
                  name="end_time"
                  id="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Tipo de ritual */}
            <div className="sm:col-span-3">
              <label htmlFor="ritual_type" className="block text-sm font-medium text-gray-700">
                Tipo de ritual <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="ritual_type"
                  name="ritual_type"
                  value={formData.ritual_type}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="regular">Tenida Regular</option>
                  <option value="initiation">Iniciación</option>
                  <option value="passing">Pase de Grado</option>
                  <option value="raising">Exaltación</option>
                  <option value="installation">Instalación de Oficiales</option>
                  <option value="special">Ceremonia Especial</option>
                </select>
              </div>
            </div>
            
            {/* Grado */}
            <div className="sm:col-span-3">
              <label htmlFor="degree" className="block text-sm font-medium text-gray-700">
                Grado <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="degree"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value={1}>Aprendiz (1°)</option>
                  <option value={2}>Compañero (2°)</option>
                  <option value={3}>Maestro (3°)</option>
                </select>
              </div>
            </div>
            
            {/* Evento asociado */}
            <div className="sm:col-span-6">
              <label htmlFor="event" className="block text-sm font-medium text-gray-700">
                Evento asociado
              </label>
              <div className="mt-1">
                <select
                  id="event"
                  name="event"
                  value={formData.event}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Ninguno</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.title} ({new Date(event.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Opcional: Asociar este plan ritual a un evento existente.
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                'Guardar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RitualPlanForm;
