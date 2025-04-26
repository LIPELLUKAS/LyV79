import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ritualsService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const RitualMinutes = () => {
  const { planId, minutesId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const isEditMode = !!minutesId;
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ritualPlan, setRitualPlan] = useState(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    content: '',
    attendance_count: 0,
    visitors_count: 0,
    status: 'draft'
  });
  
  // Cargar datos del plan ritual
  useEffect(() => {
    const fetchRitualPlan = async () => {
      try {
        setLoading(true);
        const response = await ritualsService.getRitualPlanById(planId);
        setRitualPlan(response.data);
        
        // Si el plan no está completado, redirigir
        if (response.data.status !== 'completed') {
          showNotification('Solo se pueden crear actas para planes rituales completados', 'warning');
          navigate(`/rituals/plans/${planId}`);
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
  }, [planId, navigate, showNotification]);
  
  // Cargar datos del acta si estamos en modo edición
  useEffect(() => {
    const fetchMinutesData = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const response = await ritualsService.getRitualMinutesById(minutesId);
          setFormData({
            content: response.data.content,
            attendance_count: response.data.attendance_count,
            visitors_count: response.data.visitors_count,
            status: response.data.status
          });
        } catch (error) {
          console.error('Error al cargar el acta ritual:', error);
          showNotification('Error al cargar el acta ritual', 'error');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchMinutesData();
  }, [minutesId, isEditMode, showNotification]);
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prevData => ({
        ...prevData,
        [name]: parseInt(value, 10) || 0
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
      
      const payload = {
        ...formData,
        ritual_plan: planId
      };
      
      if (isEditMode) {
        await ritualsService.updateRitualMinutes(minutesId, payload);
        showNotification('Acta ritual actualizada correctamente', 'success');
      } else {
        await ritualsService.createRitualMinutes(payload);
        showNotification('Acta ritual creada correctamente', 'success');
      }
      
      navigate(`/rituals/plans/${planId}`);
    } catch (error) {
      console.error('Error al guardar el acta ritual:', error);
      showNotification('Error al guardar el acta ritual', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Finalizar acta
  const handleFinalize = async () => {
    try {
      setSubmitting(true);
      await ritualsService.finalizeRitualMinutes(minutesId);
      showNotification('Acta ritual finalizada correctamente', 'success');
      navigate(`/rituals/plans/${planId}`);
    } catch (error) {
      console.error('Error al finalizar el acta ritual:', error);
      showNotification('Error al finalizar el acta ritual', 'error');
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
          {isEditMode ? 'Editar acta ritual' : 'Crear acta ritual'}
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
            {/* Contenido del acta */}
            <div className="sm:col-span-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Contenido del acta <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <textarea
                  id="content"
                  name="content"
                  rows={15}
                  value={formData.content}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Redacte aquí el contenido completo del acta ritual..."
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Incluya todos los detalles relevantes del trabajo ritual realizado.
              </p>
            </div>
            
            {/* Número de asistentes */}
            <div className="sm:col-span-3">
              <label htmlFor="attendance_count" className="block text-sm font-medium text-gray-700">
                Número de asistentes <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="attendance_count"
                  id="attendance_count"
                  min="0"
                  value={formData.attendance_count}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Número total de miembros de la Logia que asistieron.
              </p>
            </div>
            
            {/* Número de visitantes */}
            <div className="sm:col-span-3">
              <label htmlFor="visitors_count" className="block text-sm font-medium text-gray-700">
                Número de visitantes
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="visitors_count"
                  id="visitors_count"
                  min="0"
                  value={formData.visitors_count}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Número de visitantes de otras Logias que asistieron.
              </p>
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
            
            {isEditMode && formData.status === 'draft' && (
              <button
                type="button"
                onClick={handleFinalize}
                disabled={submitting}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Procesando...' : 'Finalizar acta'}
              </button>
            )}
            
            <button
              type="submit"
              disabled={submitting || (isEditMode && formData.status !== 'draft')}
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
          
          {isEditMode && formData.status !== 'draft' && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Acta finalizada</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Esta acta ya ha sido finalizada y no puede ser modificada. Si necesita realizar cambios, contacte al Venerable Maestro.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RitualMinutes;
