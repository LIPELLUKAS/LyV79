import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { communicationsService } from '../../services/api';
import { memberService } from '../../services/api';

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    type: 'meeting', // meeting, ceremony, social, education
    status: 'scheduled', // scheduled, in_progress, completed, cancelled
    is_public: true,
    participants: [],
    attachments: []
  });
  
  // Estado para la lista de miembros disponibles
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cargar datos del evento si estamos editando
  useEffect(() => {
    if (isEditing) {
      fetchEventDetails();
    }
    
    // Cargar lista de miembros disponibles
    fetchAvailableMembers();
  }, [id, isEditing]);
  
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await communicationsService.getEvent(id);
      
      // Formatear fechas para el formato datetime-local
      const startDate = new Date(response.data.start_date);
      const endDate = new Date(response.data.end_date);
      
      const formattedStartDate = startDate.toISOString().slice(0, 16);
      const formattedEndDate = endDate.toISOString().slice(0, 16);
      
      setFormData({
        ...response.data,
        start_date: formattedStartDate,
        end_date: formattedEndDate
      });
      
      // Establecer los participantes seleccionados
      if (response.data.participants) {
        setSelectedMembers(response.data.participants);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar detalles del evento:', err);
      setError('No se pudieron cargar los detalles del evento');
      showNotification('Error al cargar detalles del evento', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAvailableMembers = async () => {
    try {
      const response = await memberService.getMembers({ status: 'active' });
      setAvailableMembers(response.data.results || []);
    } catch (err) {
      console.error('Error al cargar miembros disponibles:', err);
      showNotification('Error al cargar miembros disponibles', 'error');
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleMemberSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleAddMember = (member) => {
    if (!selectedMembers.some(m => m.id === member.id)) {
      setSelectedMembers(prev => [...prev, member]);
    }
  };
  
  const handleRemoveMember = (memberId) => {
    setSelectedMembers(prev => prev.filter(member => member.id !== memberId));
  };
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Crear objetos de archivo con URLs temporales para previsualización
    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };
  
  const handleRemoveAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };
  
  const validateForm = () => {
    // Validar que la fecha de fin sea posterior a la fecha de inicio
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    
    if (endDate < startDate) {
      showNotification('La fecha de fin debe ser posterior a la fecha de inicio', 'error');
      return false;
    }
    
    // Validar campos obligatorios
    if (!formData.title.trim()) {
      showNotification('El título es obligatorio', 'error');
      return false;
    }
    
    if (!formData.description.trim()) {
      showNotification('La descripción es obligatoria', 'error');
      return false;
    }
    
    if (!formData.start_date) {
      showNotification('La fecha de inicio es obligatoria', 'error');
      return false;
    }
    
    if (!formData.end_date) {
      showNotification('La fecha de fin es obligatoria', 'error');
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
    
    try {
      // Preparar datos para envío
      const eventData = {
        ...formData,
        participants: selectedMembers.map(member => member.id)
      };
      
      // Manejar archivos adjuntos
      const formDataObj = new FormData();
      
      // Agregar datos del evento
      Object.keys(eventData).forEach(key => {
        if (key !== 'attachments') {
          if (Array.isArray(eventData[key])) {
            eventData[key].forEach(value => {
              formDataObj.append(`${key}[]`, value);
            });
          } else {
            formDataObj.append(key, eventData[key]);
          }
        }
      });
      
      // Agregar archivos adjuntos
      eventData.attachments.forEach((attachment, index) => {
        if (attachment.file) {
          formDataObj.append(`attachments[${index}]`, attachment.file);
        }
      });
      
      let response;
      
      if (isEditing) {
        response = await communicationsService.updateEvent(id, formDataObj);
        showNotification('Evento actualizado correctamente', 'success');
      } else {
        response = await communicationsService.createEvent(formDataObj);
        showNotification('Evento creado correctamente', 'success');
      }
      
      // Redirigir a la página de detalles del evento
      navigate(`/communications/events/${response.data.id}`);
    } catch (err) {
      console.error('Error al guardar evento:', err);
      setError('Error al guardar el evento');
      showNotification('Error al guardar el evento', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Filtrar miembros disponibles según término de búsqueda
  const filteredMembers = availableMembers.filter(member => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const symbolicName = member.symbolic_name ? member.symbolic_name.toLowerCase() : '';
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) || 
           symbolicName.includes(searchLower) ||
           member.email.toLowerCase().includes(searchLower);
  });
  
  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
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
          {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/communications/events')}
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
            <div className="col-span-2">
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
                placeholder="Título del evento"
              />
            </div>
            
            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Descripción detallada del evento"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y hora de inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y hora de fin <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ubicación del evento"
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de evento <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="meeting">Reunión</option>
                <option value="ceremony">Ceremonia</option>
                <option value="social">Social</option>
                <option value="education">Educativo</option>
              </select>
            </div>
            
            {isEditing && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="scheduled">Programado</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            )}
            
            <div className={isEditing ? "" : "col-span-2"}>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
                  Evento público (visible para todos los miembros)
                </label>
              </div>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Participantes
              </label>
              
              <div className="flex flex-col space-y-4">
                {/* Búsqueda de miembros */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar miembros..."
                    value={searchTerm}
                    onChange={handleMemberSearch}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* Lista de miembros filtrados */}
                {searchTerm && (
                  <div className="border border-gray-300 rounded-md max-h-40 overflow-y-auto">
                    {filteredMembers.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {filteredMembers.map(member => (
                          <li 
                            key={member.id} 
                            className="p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                            onClick={() => handleAddMember(member)}
                          >
                            <div className="flex items-center">
                              <img 
                                className="h-8 w-8 rounded-full mr-2" 
                                src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${member.first_name} ${member.last_name}`)}&background=random`} 
                                alt={`${member.first_name} ${member.last_name}`} 
                              />
                              <span>{member.first_name} {member.last_name}</span>
                              {member.symbolic_name && (
                                <span className="ml-1 text-gray-500">({member.symbolic_name})</span>
                              )}
                            </div>
                            <button 
                              type="button"
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddMember(member);
                              }}
                            >
                              Agregar
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="p-2 text-gray-500 text-center">No se encontraron miembros</p>
                    )}
                  </div>
                )}
                
                {/* Lista de miembros seleccionados */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Miembros seleccionados:</h4>
                  {selectedMembers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedMembers.map(member => (
                        <div 
                          key={member.id} 
                          className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{member.first_name} {member.last_name}</span>
                          <button 
                            type="button"
                            className="ml-2 text-indigo-600 hover:text-indigo-900"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No hay miembros seleccionados</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Archivos adjuntos
              </label>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Subir archivos</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only" 
                        multiple 
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">o arrastrar y soltar</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF hasta 10MB
                  </p>
                </div>
              </div>
              
              {/* Lista de archivos adjuntos */}
              {formData.attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Archivos adjuntos:</h4>
                  <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                    {formData.attachments.map((attachment, index) => (
                      <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="ml-2 flex-1 w-0 truncate">
                            {attachment.name}
                          </span>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex items-center">
                          <span className="text-gray-500 mr-4">
                            {formatFileSize(attachment.size)}
                          </span>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleRemoveAttachment(index)}
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/communications/events')}
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
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>{isEditing ? 'Actualizar Evento' : 'Crear Evento'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
