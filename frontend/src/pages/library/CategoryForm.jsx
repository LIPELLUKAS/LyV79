import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { libraryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const isEditMode = !!id;
  
  // Obtener parent_id de los query params si existe
  const queryParams = new URLSearchParams(location.search);
  const parentIdFromQuery = queryParams.get('parent_id');
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: parentIdFromQuery || null,
    required_degree: 1,
    order: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Cargar datos de la categoría si estamos en modo edición
  useEffect(() => {
    const fetchData = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const response = await libraryService.getCategoryById(id);
          setFormData({
            name: response.data.name,
            description: response.data.description || '',
            parent: response.data.parent || null,
            required_degree: response.data.required_degree,
            order: response.data.order
          });
        } catch (error) {
          console.error('Error al cargar la categoría:', error);
          showNotification('Error al cargar la categoría', 'error');
          navigate('/library/categories');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, [id, isEditMode, navigate, showNotification]);
  
  // Cargar categorías disponibles para seleccionar como padre
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await libraryService.getCategories();
        // Filtrar la categoría actual si estamos en modo edición
        const filteredCategories = isEditMode
          ? response.data.filter(category => category.id !== parseInt(id))
          : response.data;
        setCategories(filteredCategories);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };
    
    fetchCategories();
  }, [id, isEditMode]);
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'select-one' && name === 'parent') {
      setFormData(prevData => ({
        ...prevData,
        [name]: value === '' ? null : parseInt(value)
      }));
    } else if (type === 'number') {
      setFormData(prevData => ({
        ...prevData,
        [name]: parseInt(value)
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
      
      if (isEditMode) {
        await libraryService.updateCategory(id, formData);
        showNotification('Categoría actualizada correctamente', 'success');
        navigate(`/library/categories/${id}`);
      } else {
        const response = await libraryService.createCategory(formData);
        showNotification('Categoría creada correctamente', 'success');
        navigate(`/library/categories/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error al guardar la categoría:', error);
      showNotification('Error al guardar la categoría', 'error');
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
          {isEditMode ? 'Editar categoría' : 'Crear nueva categoría'}
        </h1>
      </div>
      
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Nombre */}
            <div className="sm:col-span-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
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
                Breve descripción de la categoría.
              </p>
            </div>
            
            {/* Categoría padre */}
            <div className="sm:col-span-3">
              <label htmlFor="parent" className="block text-sm font-medium text-gray-700">
                Categoría padre
              </label>
              <div className="mt-1">
                <select
                  id="parent"
                  name="parent"
                  value={formData.parent || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Ninguna (categoría principal)</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Opcional: Selecciona una categoría padre para crear una jerarquía.
              </p>
            </div>
            
            {/* Grado requerido */}
            <div className="sm:col-span-3">
              <label htmlFor="required_degree" className="block text-sm font-medium text-gray-700">
                Grado requerido <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="required_degree"
                  name="required_degree"
                  value={formData.required_degree}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value={1}>Aprendiz (1°)</option>
                  <option value={2}>Compañero (2°)</option>
                  <option value={3}>Maestro (3°)</option>
                </select>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Grado mínimo requerido para acceder a esta categoría.
              </p>
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
                  min="0"
                  value={formData.order}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Orden de visualización (menor número = mayor prioridad).
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

export default CategoryForm;
