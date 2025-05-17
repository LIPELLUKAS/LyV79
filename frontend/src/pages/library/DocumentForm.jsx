import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { libraryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const DocumentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  const [existingFile, setExistingFile] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    min_degree: '0',
    is_public: true,
    tags: ''
  });

  // Verificar permisos - Solo secretario, VM y admin pueden subir documentos
  useEffect(() => {
    if (currentUser && 
        !(currentUser.office === 'Secretario' || 
          currentUser.office === 'Venerable Maestro' ||
          currentUser.is_admin)) {
      showNotification('No tienes permisos para acceder a esta sección', 'error');
      navigate('/library/documents');
    }
  }, [currentUser, navigate, showNotification]);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Cargar categorías
        const categoriesResponse = await libraryService.getCategories();
        setCategories(categoriesResponse.data || []);
        
        // Si estamos editando, cargar datos del documento
        if (isEditing) {
          const documentResponse = await libraryService.getDocument(id);
          const document = documentResponse.data;
          
          setFormData({
            title: document.title || '',
            description: document.description || '',
            category_id: document.category_id || '',
            min_degree: document.min_degree !== undefined ? document.min_degree.toString() : '0',
            is_public: document.is_public !== undefined ? document.is_public : true,
            tags: document.tags ? document.tags.join(', ') : ''
          });
          
          // Información del archivo existente
          if (document.file_url) {
            setExistingFile({
              url: document.file_url,
              name: document.file_name || 'Documento',
              size: document.file_size || 'Desconocido'
            });
          }
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
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      if (files && files.length > 0) {
        setFile(files[0]);
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleRemoveExistingFile = () => {
    setExistingFile(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      showNotification('El título es obligatorio', 'error');
      return false;
    }
    
    if (!formData.category_id) {
      showNotification('Debe seleccionar una categoría', 'error');
      return false;
    }
    
    if (!isEditing && !file) {
      showNotification('Debe seleccionar un archivo para subir', 'error');
      return false;
    }
    
    if (isEditing && !existingFile && !file) {
      showNotification('Debe mantener el archivo existente o subir uno nuevo', 'error');
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
      // Crear FormData para enviar archivos
      const formDataObj = new FormData();
      
      // Agregar campos del formulario
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('category_id', formData.category_id);
      formDataObj.append('min_degree', formData.min_degree);
      formDataObj.append('is_public', formData.is_public);
      
      // Procesar tags
      if (formData.tags) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        formDataObj.append('tags', JSON.stringify(tagsArray));
      }
      
      // Agregar archivo si existe
      if (file) {
        formDataObj.append('file', file);
      }
      
      // Indicar si se debe mantener el archivo existente
      if (isEditing) {
        formDataObj.append('keep_existing_file', existingFile ? 'true' : 'false');
      }
      
      let response;
      
      if (isEditing) {
        response = await libraryService.updateDocument(id, formDataObj);
        showNotification('Documento actualizado correctamente', 'success');
      } else {
        response = await libraryService.createDocument(formDataObj);
        showNotification('Documento subido correctamente', 'success');
      }
      
      // Redirigir a la lista de documentos
      navigate('/library/documents');
    } catch (err) {
      console.error('Error al guardar documento:', err);
      setError('Error al guardar el documento. Por favor, intente nuevamente.');
      showNotification('Error al guardar el documento', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Función para formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return 'Desconocido';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
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
          {isEditing ? 'Editar Documento' : 'Subir Nuevo Documento'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/library/documents')}
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
            {/* Información del Documento */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Información del Documento</h2>
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
                placeholder="Título del documento"
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
                placeholder="Descripción del documento"
              ></textarea>
            </div>
            
            {/* Categoría */}
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Seleccione una categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Grado Mínimo */}
            <div>
              <label htmlFor="min_degree" className="block text-sm font-medium text-gray-700 mb-1">
                Grado Mínimo <span className="text-red-500">*</span>
              </label>
              <select
                id="min_degree"
                name="min_degree"
                value={formData.min_degree}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="0">Público</option>
                <option value="1">Aprendiz</option>
                <option value="2">Compañero</option>
                <option value="3">Maestro</option>
              </select>
            </div>
            
            {/* Etiquetas */}
            <div className="md:col-span-2">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Etiquetas
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Etiquetas separadas por comas (ej: ritual, historia, simbolismo)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Separe las etiquetas con comas.
              </p>
            </div>
            
            {/* Visibilidad */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  id="is_public"
                  name="is_public"
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
                  Documento público (visible para todos los miembros con el grado mínimo requerido)
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Si no está marcado, solo los oficiales y administradores podrán ver este documento.
              </p>
            </div>
            
            {/* Archivo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo {!isEditing && <span className="text-red-500">*</span>}
              </label>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Subir archivo</span>
                      <input 
                        id="file" 
                        name="file" 
                        type="file" 
                        className="sr-only" 
                        onChange={handleChange}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="pl-1">o arrastrar y soltar</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, JPEG, PNG hasta 10MB
                  </p>
                </div>
              </div>
              
              {/* Archivo existente */}
              {existingFile && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Archivo existente:</h3>
                  <div className="flex items-center justify-between py-2 px-4 text-sm border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{existingFile.name}</span>
                      {existingFile.size && (
                        <span className="ml-2 text-gray-500">({formatFileSize(existingFile.size)})</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={existingFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver
                      </a>
                      <button
                        type="button"
                        onClick={handleRemoveExistingFile}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Nuevo archivo */}
              {file && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Nuevo archivo:</h3>
                  <div className="flex items-center justify-between py-2 px-4 text-sm border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{file.name}</span>
                      <span className="ml-2 text-gray-500">({formatFileSize(file.size)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/library/documents')}
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
                  {isEditing ? 'Actualizando...' : 'Subiendo...'}
                </>
              ) : (
                <>{isEditing ? 'Actualizar Documento' : 'Subir Documento'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentForm;
