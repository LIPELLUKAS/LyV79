import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Componentes
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';

const DocumentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categories: [],
    file: null
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    // Cargar categorías
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/library/categories/?type=documents');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback categories if API fails
        setCategories([
          { id: 1, name: 'Administrativo' },
          { id: 2, name: 'Ritual' },
          { id: 3, name: 'Educativo' },
          { id: 4, name: 'Histórico' },
          { id: 5, name: 'Legal' }
        ]);
      }
    };

    fetchCategories();

    if (isEditing) {
      const fetchDocument = async () => {
        try {
          const response = await axios.get(`/api/library/documents/${id}/`);
          const { title, description, categories, file_url } = response.data;
          
          setFormData({
            title,
            description: description || '',
            categories: categories || [],
            file: null
          });
          
          if (file_url) {
            // Extraer nombre del archivo de la URL
            const urlParts = file_url.split('/');
            setFileName(urlParts[urlParts.length - 1]);
          }
          
          setLoading(false);
        } catch (err) {
          setError('Error al cargar los datos del documento. Por favor, intente nuevamente.');
          console.error('Error fetching document:', err);
          setLoading(false);
        }
      };

      fetchDocument();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
      
      if (files[0]) {
        setFileName(files[0].name);
      }
    } else if (type === 'checkbox') {
      // Manejar categorías como array
      const updatedCategories = [...formData.categories];
      if (checked) {
        updatedCategories.push(value);
      } else {
        const index = updatedCategories.indexOf(value);
        if (index > -1) {
          updatedCategories.splice(index, 1);
        }
      }
      
      setFormData(prev => ({
        ...prev,
        categories: updatedCategories
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.title) {
      setError('Por favor complete el título del documento.');
      return;
    }

    if (!isEditing && !formData.file) {
      setError('Por favor seleccione un archivo para subir.');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    
    if (formData.description) {
      data.append('description', formData.description);
    }
    
    // Añadir categorías
    if (formData.categories.length > 0) {
      data.append('categories', JSON.stringify(formData.categories));
    }
    
    // Añadir archivo si existe
    if (formData.file) {
      data.append('file', formData.file);
    }

    try {
      setSubmitting(true);
      
      if (isEditing) {
        await axios.put(`/api/library/documents/${id}/`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post('/api/library/documents/', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      navigate('/library');
    } catch (err) {
      setError(`Error al ${isEditing ? 'actualizar' : 'subir'} el documento. Por favor, intente nuevamente.`);
      console.error('Error submitting form:', err);
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-4">
      <PageHeader 
        title={isEditing ? 'Editar Documento' : 'Subir Nuevo Documento'} 
        backLink="/library"
        backLabel="Volver a Biblioteca"
      />
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Título *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="4"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Categorías
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map(category => (
                <div key={category.id} className="flex items-center">
                  <input
                    id={`category-${category.id}`}
                    name="categories"
                    type="checkbox"
                    value={category.name}
                    checked={formData.categories.includes(category.name)}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor={`category-${category.id}`}>
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
              Archivo {isEditing ? '(opcional)' : '*'}
            </label>
            <input
              id="file"
              name="file"
              type="file"
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required={!isEditing}
            />
            {isEditing && fileName && !formData.file && (
              <p className="text-sm text-gray-500 mt-1">
                Archivo actual: {fileName}. Seleccione un nuevo archivo solo si desea reemplazarlo.
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-2">
          <Button
            type="button"
            label="Cancelar"
            variant="secondary"
            onClick={() => navigate('/library')}
          />
          <Button
            type="submit"
            label={isEditing ? 'Actualizar' : 'Subir'}
            variant="primary"
            disabled={submitting}
          />
        </div>
      </form>
    </div>
  );
};

export default DocumentForm;
