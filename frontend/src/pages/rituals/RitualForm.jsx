import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ritualsService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const RitualForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const [officers, setOfficers] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    location: '',
    degree: '1',
    status: 'scheduled',
    notes: '',
    officers: {}
  });

  // Verificar permisos - Solo VM, secretario y oficiales pueden crear rituales
  useEffect(() => {
    if (currentUser && 
        !(currentUser.office === 'Venerable Maestro' || 
          currentUser.office === 'Secretario' ||
          currentUser.is_admin ||
          currentUser.is_officer)) {
      showNotification('No tienes permisos para acceder a esta sección', 'error');
      navigate('/rituals');
    }
  }, [currentUser, navigate, showNotification]);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Cargar lista de miembros
        const membersResponse = await ritualsService.getMembersList();
        setMembers(membersResponse.data || []);
        
        // Si estamos editando, cargar datos del ritual
        if (isEditing) {
          const ritualResponse = await ritualsService.getRitual(id);
          const ritual = ritualResponse.data;
          
          // Formatear fecha
          const date = ritual.date ? new Date(ritual.date).toISOString().split('T')[0] : '';
          
          setFormData({
            title: ritual.title || '',
            description: ritual.description || '',
            date: date,
            time: ritual.time || '19:00',
            location: ritual.location || '',
            degree: ritual.degree ? ritual.degree.toString() : '1',
            status: ritual.status || 'scheduled',
            notes: ritual.notes || '',
            officers: ritual.officers || {}
          });
          
          // Cargar oficiales asignados
          setOfficers(ritual.officers || {});
        }
        
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
        setError('Error al cargar los datos necesarios. Por favor, intente nuevamente.');
        showNotification('Error al cargar datos', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [id, isEditing, showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOfficerChange = (office, memberId) => {
    setFormData(prev => ({
      ...prev,
      officers: {
        ...prev.officers,
        [office]: memberId
      }
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      showNotification('El título es obligatorio', 'error');
      return false;
    }
    
    if (!formData.date) {
      showNotification('La fecha es obligatoria', 'error');
      return false;
    }
    
    if (!formData.time) {
      showNotification('La hora es obligatoria', 'error');
      return false;
    }
    
    if (!formData.location.trim()) {
      showNotification('El lugar es obligatorio', 'error');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      let response;
      
      if (isEditing) {
        response = await ritualsService.updateRitual(id, formData);
        showNotification('Ritual actualizado correctamente', 'success');
      } else {
        response = await ritualsService.createRitual(formData);
        showNotification('Ritual creado correctamente', 'success');
      }
      
      // Redirigir a la lista de rituales
      navigate('/rituals');
    } catch (err) {
      console.error('Error al guardar ritual:', err);
      setError('Error al guardar el ritual. Por favor, intente nuevamente.');
      showNotification('Error al guardar el ritual', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Lista de oficiales masónicos
  const officerPositions = [
    { id: 'vm', name: 'Venerable Maestro' },
    { id: 'pv', name: 'Primer Vigilante' },
    { id: 'sv', name: 'Segundo Vigilante' },
    { id: 'orador', name: 'Orador' },
    { id: 'secretario', name: 'Secretario' },
    { id: 'tesorero', name: 'Tesorero' },
    { id: 'hospitalario', name: 'Hospitalario' },
    { id: 'experto', name: 'Experto' },
    { id: 'maestro_ceremonias', name: 'Maestro de Ceremonias' },
    { id: 'guarda_templo', name: 'Guarda Templo' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditing ? 'Editar Ritual' : 'Programar Nuevo Ritual'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/rituals')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Volver
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h2>
            </div>
            
            {/* Título */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Título del ritual"
              />
            </div>
            
            {/* Descripción */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Descripción del ritual"
              ></textarea>
            </div>
            
            {/* Fecha */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            {/* Hora */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Hora <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            {/* Lugar */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Lugar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Templo, dirección, etc."
              />
            </div>
            
            {/* Grado */}
            <div>
              <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">
                Grado <span className="text-red-500">*</span>
              </label>
              <select
                id="degree"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="1">Aprendiz</option>
                <option value="2">Compañero</option>
                <option value="3">Maestro</option>
              </select>
            </div>
            
            {/* Estado */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="scheduled">Programado</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
                <option value="postponed">Pospuesto</option>
              </select>
            </div>
            
            {/* Notas */}
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Notas adicionales sobre este ritual"
              ></textarea>
            </div>
            
            {/* Asignación de Oficiales */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Asignación de Oficiales</h2>
              <p className="text-sm text-gray-500 mb-4">
                Asigne los oficiales que participarán en este ritual. Puede dejar posiciones sin asignar.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {officerPositions.map(position => (
                  <div key={position.id}>
                    <label htmlFor={`officer-${position.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      {position.name}
                    </label>
                    <select
                      id={`officer-${position.id}`}
                      value={formData.officers[position.id] || ''}
                      onChange={(e) => handleOfficerChange(position.id, e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Sin asignar</option>
                      {members.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.first_name} {member.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/rituals')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                submitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                <>{isEditing ? 'Actualizar Ritual' : 'Programar Ritual'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RitualForm;
