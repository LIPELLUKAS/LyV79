import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ritualsService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
const RitualWorks = () => {
  const { planId, workId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const isEditMode = !!workId;
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ritualPlan, setRitualPlan] = useState(null);
  const [members, setMembers] = useState([]);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    work_type: 'lecture',
    responsible: '',
    estimated_duration: 15,
    order: 1,
    attachment: null,
    status: 'pending'
  });
  
  // Cargar datos del plan ritual
  useEffect(() => {
    const fetchRitualPlan = async () => {
      try {
        setLoading(true);
        const response = await ritualsService.getRitualPlanById(planId);
        setRitualPlan(response.data);
        
        // Si es un nuevo trabajo, establecer el orden como el siguiente disponible
        if (!isEditMode && response.data.works) {
          const maxOrder = response.data.works.reduce(
            (max, work) => Math.max(max, work.order || 0), 0
          );
          setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
        }
      } catch (error) {
        console.error('Error al cargar el plan ritual:', error);
        showNotification('Error al cargar el plan ritual', 'error');
        navigate('/rituals/plans');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRitualPlan();
  }, [planId, isEditMode, navigate, showNotification]);
  
  // Cargar datos del trabajo si estamos en modo edición
  useEffect(() => {
    const fetchWorkData = async () => {
      if (!isEditMode) return;
      
      try {
        setLoading(true);
        const response = await ritualsService.getRitualWorkById(workId);
        const work = response.data;
        
        setFormData({
          title: work.title || '',
          description: work.description || '',
          work_type: work.work_type || 'lecture',
          responsible: work.responsible || '',
          estimated_duration: work.estimated_duration || 15,
          order: work.order || 1,
          status: work.status || 'pending',
          attachment: null // No podemos cargar el archivo existente, solo el nombre
        });
      } catch (error) {
        console.error('Error al cargar el trabajo:', error);
        showNotification('Error al cargar el trabajo', 'error');
        navigate(`/rituals/plans/${planId}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkData();
  }, [workId, isEditMode, planId, navigate, showNotification]);
  
  // Cargar miembros para el selector de responsables
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await ritualsService.getLodgeMembers();
        setMembers(response.data);
      } catch (error) {
        console.error('Error al cargar miembros:', error);
      }
    };
    
    fetchMembers();
  }, []);
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const formDataToSend = new FormData();
      
      // Añadir todos los campos al FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Añadir el ID del plan ritual
      formDataToSend.append('ritual_plan', planId);
      
      if (isEditMode) {
        await ritualsService.updateRitualWork(workId, formDataToSend);
        showNotification('Trabajo actualizado correctamente', 'success');
      } else {
        await ritualsService.createRitualWork(formDataToSend);
        showNotification('Trabajo creado correctamente', 'success');
      }
      
      navigate(`/rituals/plans/${planId}`);
    } catch (error) {
      console.error('Error al guardar el trabajo:', error);
      showNotification('Error al guardar el trabajo', 'error');
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
          onClick={() => navigate(`/rituals/plans/${planId}`)}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Editar trabajo' : 'Nuevo trabajo'}
        </h1>
      </div>
      
      {ritualPlan && (
        <div className="mb-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Plan ritual: {ritualPlan.title}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {ritualPlan.date && new Date(ritualPlan.date).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow overflow-hidden sm:rounded-lg">
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
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Tipo de trabajo */}
            <div className="sm:col-span-2">
              <label htmlFor="work_type" className="block text-sm font-medium text-gray-700">
                Tipo de trabajo
              </label>
              <div className="mt-1">
                <select
                  id="work_type"
                  name="work_type"
                  value={formData.work_type}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="lecture">Plancha</option>
                  <option value="ritual">Ritual</option>
                  <option value="instruction">Instrucción</option>
                  <option value="discussion">Discusión</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>
            
            {/* Responsable */}
            <div className="sm:col-span-3">
              <label htmlFor="responsible" className="block text-sm font-medium text-gray-700">
                Responsable
              </label>
              <div className="mt-1">
                <select
                  id="responsible"
                  name="responsible"
                  value={formData.responsible}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar responsable</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} {member.office ? `(${member.office})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Duración estimada */}
            <div className="sm:col-span-3">
              <label htmlFor="estimated_duration" className="block text-sm font-medium text-gray-700">
                Duración estimada (minutos)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="estimated_duration"
                  id="estimated_duration"
                  min="1"
                  max="180"
                  value={formData.estimated_duration}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Orden */}
            <div className="sm:col-span-2">
              <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                Orden
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="order"
                  id="order"
                  min="1"
                  value={formData.order}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Estado */}
            <div className="sm:col-span-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <div className="mt-1">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En progreso</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
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
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Breve descripción del trabajo a realizar.
              </p>
            </div>
            
            {/* Archivo adjunto */}
            <div className="sm:col-span-6">
              <label htmlFor="attachment" className="block text-sm font-medium text-gray-700">
                Archivo adjunto
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="attachment"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Subir un archivo</span>
                      <input
                        id="attachment"
                        name="attachment"
                        type="file"
                        className="sr-only"
                        onChange={handleChange}
                      />
                    </label>
                    <p className="pl-1">o arrastrar y soltar</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, PPT, PPTX hasta 10MB
                  </p>
                  {formData.attachment && (
                    <p className="text-sm text-indigo-600">
                      Archivo seleccionado: {formData.attachment.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(`/rituals/plans/${planId}`)}
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
        </div>
      </form>
    </div>
  );
};

export default RitualWorks;
