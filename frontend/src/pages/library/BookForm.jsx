import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Componentes
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';

const BookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publication_year: '',
    publisher: '',
    isbn: '',
    description: '',
    categories: [],
    cover_image: null
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [coverPreview, setCoverPreview] = useState(null);

  useEffect(() => {
    // Cargar categorías
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/library/categories/?type=books');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback categories if API fails
        setCategories([
          { id: 1, name: 'Filosofía' },
          { id: 2, name: 'Historia' },
          { id: 3, name: 'Simbolismo' },
          { id: 4, name: 'Ritual' },
          { id: 5, name: 'Educación' }
        ]);
      }
    };

    fetchCategories();

    if (isEditing) {
      const fetchBook = async () => {
        try {
          const response = await axios.get(`/api/library/books/${id}/`);
          const { title, author, publication_year, publisher, isbn, description, categories, cover_image } = response.data;
          
          setFormData({
            title,
            author,
            publication_year: publication_year || '',
            publisher: publisher || '',
            isbn: isbn || '',
            description: description || '',
            categories: categories || [],
            cover_image: null
          });
          
          if (cover_image) {
            setCoverPreview(cover_image);
          }
          
          setLoading(false);
        } catch (err) {
          setError('Error al cargar los datos del libro. Por favor, intente nuevamente.');
          console.error('Error fetching book:', err);
          setLoading(false);
        }
      };

      fetchBook();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
      
      // Crear preview de la imagen
      if (files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCoverPreview(reader.result);
        };
        reader.readAsDataURL(files[0]);
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
    if (!formData.title || !formData.author) {
      setError('Por favor complete los campos requeridos (título y autor).');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('author', formData.author);
    
    if (formData.publication_year) {
      data.append('publication_year', formData.publication_year);
    }
    
    if (formData.publisher) {
      data.append('publisher', formData.publisher);
    }
    
    if (formData.isbn) {
      data.append('isbn', formData.isbn);
    }
    
    if (formData.description) {
      data.append('description', formData.description);
    }
    
    // Añadir categorías
    if (formData.categories.length > 0) {
      data.append('categories', JSON.stringify(formData.categories));
    }
    
    // Añadir imagen de portada si existe
    if (formData.cover_image) {
      data.append('cover_image', formData.cover_image);
    }

    try {
      setSubmitting(true);
      
      if (isEditing) {
        await axios.put(`/api/library/books/${id}/`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post('/api/library/books/', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      navigate('/library');
    } catch (err) {
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} el libro. Por favor, intente nuevamente.`);
      console.error('Error submitting form:', err);
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-4">
      <PageHeader 
        title={isEditing ? 'Editar Libro' : 'Añadir Nuevo Libro'} 
        backLink="/library"
        backLabel="Volver a Biblioteca"
      />
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
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
          
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="author">
              Autor *
            </label>
            <input
              id="author"
              name="author"
              type="text"
              value={formData.author}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="publication_year">
              Año de Publicación
            </label>
            <input
              id="publication_year"
              name="publication_year"
              type="number"
              min="1000"
              max={new Date().getFullYear()}
              value={formData.publication_year}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="publisher">
              Editorial
            </label>
            <input
              id="publisher"
              name="publisher"
              type="text"
              value={formData.publisher}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="isbn">
              ISBN
            </label>
            <input
              id="isbn"
              name="isbn"
              type="text"
              value={formData.isbn}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="col-span-2">
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
          
          <div className="col-span-2">
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
          
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cover_image">
              Imagen de Portada
            </label>
            <input
              id="cover_image"
              name="cover_image"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          {coverPreview && (
            <div className="col-span-2">
              <p className="text-sm font-bold mb-2">Vista previa:</p>
              <img 
                src={coverPreview} 
                alt="Vista previa de portada" 
                className="w-40 h-auto object-cover rounded"
              />
            </div>
          )}
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
            label={isEditing ? 'Actualizar' : 'Guardar'}
            variant="primary"
            disabled={submitting}
          />
        </div>
      </form>
    </div>
  );
};

export default BookForm;
