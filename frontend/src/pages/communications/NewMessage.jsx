import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { communicationsService } from '../../services/api';

const NewMessage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [availableRecipients, setAvailableRecipients] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    recipient_ids: [],
    is_important: false,
    attachments: []
  });
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);

  // Cargar destinatarios disponibles
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const response = await communicationsService.getAvailableRecipients();
        setAvailableRecipients(response.data || []);
      } catch (error) {
        console.error('Error al cargar destinatarios:', error);
        showNotification('No se pudieron cargar los destinatarios disponibles', 'error');
      }
    };

    fetchRecipients();
  }, [showNotification]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Limpiar error cuando el usuario corrige el campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleRecipientChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({
      ...formData,
      recipient_ids: selectedOptions
    });
    
    if (errors.recipient_ids) {
      setErrors({
        ...errors,
        recipient_ids: null
      });
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es obligatorio';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'El contenido del mensaje es obligatorio';
    }
    
    if (formData.recipient_ids.length === 0) {
      newErrors.recipient_ids = 'Debe seleccionar al menos un destinatario';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('Por favor, corrija los errores en el formulario', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      // Crear FormData para enviar archivos
      const messageData = new FormData();
      messageData.append('subject', formData.subject);
      messageData.append('content', formData.content);
      messageData.append('is_important', formData.is_important);
      
      // Añadir destinatarios
      formData.recipient_ids.forEach(id => {
        messageData.append('recipient_ids', id);
      });
      
      // Añadir archivos adjuntos
      files.forEach(file => {
        messageData.append('attachments', file);
      });
      
      // Enviar mensaje
      const response = await communicationsService.createMessage(messageData);
      
      showNotification('Mensaje enviado correctamente', 'success');
      navigate('/communications/messages');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      
      if (error.response && error.response.data) {
        // Manejar errores de validación del backend
        const backendErrors = error.response.data;
        const formattedErrors = {};
        
        Object.keys(backendErrors).forEach(key => {
          formattedErrors[key] = backendErrors[key][0];
        });
        
        setErrors(formattedErrors);
        showNotification('Error al enviar el mensaje. Revise los campos del formulario.', 'error');
      } else {
        showNotification('Error al enviar el mensaje. Intente nuevamente más tarde.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/communications/messages');
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Nuevo Mensaje</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        {/* Destinatarios */}
        <div className="mb-4">
          <label htmlFor="recipient_ids" className="block text-sm font-medium text-gray-700 mb-1">
            Destinatarios <span className="text-red-500">*</span>
          </label>
          <select
            id="recipient_ids"
            name="recipient_ids"
            multiple
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
              errors.recipient_ids ? 'border-red-500' : 'border-gray-300'
            }`}
            value={formData.recipient_ids}
            onChange={handleRecipientChange}
          >
            {availableRecipients.map((recipient) => (
              <option key={recipient.id} value={recipient.id}>
                {recipient.name} ({recipient.role || 'Miembro'})
              </option>
            ))}
          </select>
          {errors.recipient_ids && (
            <p className="mt-1 text-sm text-red-600">{errors.recipient_ids}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Mantenga presionada la tecla Ctrl (o Cmd en Mac) para seleccionar múltiples destinatarios
          </p>
        </div>
        
        {/* Asunto */}
        <div className="mb-4">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Asunto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md ${
              errors.subject ? 'border-red-500' : 'border-gray-300'
            }`}
            value={formData.subject}
            onChange={handleChange}
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
          )}
        </div>
        
        {/* Contenido */}
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Mensaje <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            rows={6}
            className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            value={formData.content}
            onChange={handleChange}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>
        
        {/* Archivos adjuntos */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Archivos adjuntos
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
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
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
                <p className="pl-1">o arrastre y suelte</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, PDF hasta 10MB
              </p>
            </div>
          </div>
          
          {/* Lista de archivos seleccionados */}
          {files.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700">Archivos seleccionados:</h4>
              <ul className="mt-2 divide-y divide-gray-200">
                {files.map((file, index) => (
                  <li key={index} className="py-2 flex justify-between items-center">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Mensaje importante */}
        <div className="mb-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="is_important"
                name="is_important"
                type="checkbox"
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                checked={formData.is_important}
                onChange={handleChange}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="is_important" className="font-medium text-gray-700">
                Marcar como importante
              </label>
              <p className="text-gray-500">
                Los mensajes importantes se destacan en la bandeja de entrada del destinatario
              </p>
            </div>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              'Enviar mensaje'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewMessage;
