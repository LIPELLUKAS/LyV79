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
  }, [planId, navigate, showNotification, isEditMode]);
  
  // Cargar datos del trabajo si estamos en modo edición
  useEffect(() => {
    const fetchWorkData = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const response = await ritualsService.getRitualWorkById(workId);
          setFormData({
            title: response.data.title,
            description: response.data.description || '',
            work_type: response.data.work_type,
            responsible: response.data.responsible || '',
            estimated_duration: response.data.estimated_duration || 15,
            order: response.data.order || 1,
            attachment: response.data.attachment || null,
            status: response.data.status
          });
        } catch (error) {
          console.error('Error al cargar el trabajo ritual:', error);
          showNotification('Error al cargar el trabajo ritual', 'error');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchWorkData();
  }, [workId, isEditMode, showNotification]);
  
  // Cargar miembros disponibles
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Aquí se debería llamar a un servicio para obtener los miembros
        // Por ahora, usamos datos de ejemplo
        const response = await fetch('/api/members?degree=3');
        const data = await response.json();
        setMembers(data.results);
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
      setFormData(prevData => ({
        ...prevData,
        [name]: files[0]
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };
  
  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Crear un FormData para manejar la carga de archivos
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Añadir el ID del plan ritual
      formDataToSend.append('ritual_plan', planId);
      
      if (isEditMode) {
        await ritualsService.updateRitualWork(workId, formDataToSend);
        showNotification('Trabajo ritual actualizado correctamente', 'success');
      } else {
        await ritualsService.createRitualWork(formDataToSend);
        showNotification('Trabajo ritual creado correctamente', 'success');
      }
      
      navigate(`/rituals/plans/${planId}`);
    } catch (error) {
      console.error('Error al guardar el trabajo ritual:', error);
      showNotification('Error al guardar el trabajo ritual', 'error');
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
          {isEditMode ? 'Editar trabajo ritual' : 'Añadir trabajo ritual'}
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Plan ritual: {ritualPlan.title}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Fecha: {new Date(ritualPlan.date).toLocaleDateString()} | Tipo: {ritualPlan.ritual_type_display}
          </p>
        </div>
        
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
            
            {/* Tipo de trabajo */}
            <div className="sm:col-span-3">
              <label htmlFor="work_type" className="block text-sm font-medium text-gray-700">
                Tipo de trabajo <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="work_type"
                  name="work_type"
                  value={formData.work_type}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="lecture">Plancha</option>
                  <option value="ceremony">Ceremonia</option>
                  <option value="discussion">Discusión</option>
                  <option value="presentation">Presentación</option>
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
                  <option value="">No asignado</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.symbolic_name || `${member.first_name} ${member.last_name}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Duración estimada */}
            <div className="sm:col-span-3">
              <label htmlFor="estimated_duration" className="block text-sm font-medium text-gray-700">
                Duración estimada (minutos) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="estimated_duration"
                  id="estimated_duration"
                  min="1"
                  value={formData.estimated_duration}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Orden */}
            <div className="sm:col-span-3">
              <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                Orden <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="order"
                  id="order"
                  min="1"
                  value={formData.order}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Posición en la agenda del ritual.
              </p>
            </div>
            
            {/* Adjunto */}
            <div className="sm:col-span-6">
              <label htmlFor="attachment" className="block text-sm font-medium text-gray-700">
                Adjunto
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  name="attachment"
                  id="attachment"
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Documento relacionado con este trabajo (opcional).
              </p>
              {formData.attachment && typeof formData.attachment === 'string' && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Archivo actual: <a href={formData.attachment} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">Ver archivo</a>
                  </p>
                </div>
              )}
            </div>
            
            {/* Estado */}
            <div className="sm:col-span-3">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Estado <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
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
                    <circle className="opacity-25" cx="
(Content truncated due to size limit. Use line ranges to read in chunks)