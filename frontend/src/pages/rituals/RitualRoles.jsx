import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ritualsService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const RitualRoles = () => {
  const { planId, roleId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const isEditMode = !!roleId;
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ritualPlan, setRitualPlan] = useState(null);
  const [members, setMembers] = useState([]);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    role_type: 'vm',
    custom_role: '',
    assigned_to: '',
    notes: '',
    is_confirmed: false
  });
  
  // Cargar datos del plan ritual
  useEffect(() => {
    const fetchRitualPlan = async () => {
      try {
        setLoading(true);
        const response = await ritualsService.getRitualPlanById(planId);
        setRitualPlan(response.data);
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
  
  // Cargar datos del rol si estamos en modo edición
  useEffect(() => {
    const fetchRoleData = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const response = await ritualsService.getRitualRoleById(roleId);
          setFormData({
            role_type: response.data.role_type,
            custom_role: response.data.custom_role || '',
            assigned_to: response.data.assigned_to || '',
            notes: response.data.notes || '',
            is_confirmed: response.data.is_confirmed
          });
        } catch (error) {
          console.error('Error al cargar el rol ritual:', error);
          showNotification('Error al cargar el rol ritual', 'error');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchRoleData();
  }, [roleId, isEditMode, showNotification]);
  
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
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
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
        await ritualsService.updateRitualRole(roleId, payload);
        showNotification('Rol ritual actualizado correctamente', 'success');
      } else {
        await ritualsService.createRitualRole(payload);
        showNotification('Rol ritual creado correctamente', 'success');
      }
      
      navigate(`/rituals/plans/${planId}`);
    } catch (error) {
      console.error('Error al guardar el rol ritual:', error);
      showNotification('Error al guardar el rol ritual', 'error');
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
          {isEditMode ? 'Editar rol ritual' : 'Añadir rol ritual'}
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
            {/* Tipo de rol */}
            <div className="sm:col-span-3">
              <label htmlFor="role_type" className="block text-sm font-medium text-gray-700">
                Tipo de rol <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="role_type"
                  name="role_type"
                  value={formData.role_type}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="vm">Venerable Maestro</option>
                  <option value="pv">Primer Vigilante</option>
                  <option value="sv">Segundo Vigilante</option>
                  <option value="sec">Secretario</option>
                  <option value="tes">Tesorero</option>
                  <option value="pd">Primer Diácono</option>
                  <option value="sd">Segundo Diácono</option>
                  <option value="gi">Guarda Templo Interior</option>
                  <option value="gt">Guarda Templo Exterior</option>
                  <option value="cap">Capellán</option>
                  <option value="ora">Orador</option>
                  <option value="mce">Maestro de Ceremonias</option>
                  <option value="exp">Experto</option>
                  <option value="hos">Hospitalario</option>
                  <option value="mus">Músico</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>
            
            {/* Rol personalizado (si es "Otro") */}
            {formData.role_type === 'other' && (
              <div className="sm:col-span-3">
                <label htmlFor="custom_role" className="block text-sm font-medium text-gray-700">
                  Rol personalizado <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="custom_role"
                    id="custom_role"
                    value={formData.custom_role}
                    onChange={handleChange}
                    required={formData.role_type === 'other'}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}
            
            {/* Miembro asignado */}
            <div className="sm:col-span-6">
              <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">
                Asignado a
              </label>
              <div className="mt-1">
                <select
                  id="assigned_to"
                  name="assigned_to"
                  value={formData.assigned_to}
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
            
            {/* Notas */}
            <div className="sm:col-span-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notas
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Notas adicionales sobre este rol.
              </p>
            </div>
            
            {/* Confirmación */}
            <div className="sm:col-span-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="is_confirmed"
                    name="is_confirmed"
                    type="checkbox"
                    checked={formData.is_confirmed}
                    onChange={handleChange}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="is_confirmed" className="font-medium text-gray-700">
                    Confirmado
                  </label>
                  <p className="text-gray-500">
                    Marcar si el miembro ha confirmado su participación.
                  </p>
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
        </form>
      </div>
    </div>
  );
};

export default RitualRoles;
