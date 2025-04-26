import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Componentes
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';

const AnnouncementForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    attachments: []
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      const fetchAnnouncement = async () => {
        try {
          const response = await axios.get(`/api/communications/announcements/${id}/`);
          const { title, content, tags } = response.data;
          setFormData({
            title,
            content,
            tags: tags ? tags.join(', ') : '',
            attachments: []
          });
          setLoading(false);
        } catch (err) {
          setError('Error al cargar los datos del anuncio. Por favor, intente nuevamente.');
          console.error('Error fetching announcement:', err);
          setLoading(false);
        }
      };

      fetchAnnouncement();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRemoveAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.title || !formData.content) {
      setError('Por favor complete todos los campos requeridos.');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    
    // Procesar tags
    if (formData.tags) {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim());
      data.append('tags', JSON.stringify(tagsArray));
    }
    
    // Añadir archivos adjuntos
    formData.attachments.forEach(file => {
      data.append('attachments', file);
    });

    try {
      setSubmitting(true);
      
      if (isEditing) {
        await axios.put(`/api/communications/announcements/${id}/`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post('/api/communications/announcements/', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      navigate('/communications');
    } catch (err) {
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} el anuncio. Por favor, intente nuevamente.`);
      console.error('Error submitting form:', err);
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-4">
      <PageHeader 
        title={isEditing ? 'Editar Anuncio' : 'Nuevo Anuncio'} 
        backLink="/communications"
        backLabel="Volver a Comunicaciones"
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
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
              Contenido *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="10"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">
              Etiquetas (separadas por comas)
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Ejemplo: importante, reunión, evento"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="attachments">
              Archivos adjuntos
            </label>
            <input
              id="attachments"
              name="attachments"
              type="file"
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              multiple
            />
          </div>
          
          {formData.attachments.length > 0 && (
            <div>
              <h3 className="text-sm font-bold mb-2">Archivos seleccionados:</h3>
              <ul className="space-y-1">
                {formData.attachments.map((file, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end space-x-2">
          <Button
            type="button"
            label="Cancelar"
            variant="secondary"
            onClick={() => navigate('/communications')}
          />
          <Button
            type="submit"
            label={isEditing ? 'Actualizar' : 'Publicar'}
            variant="primary"
            disabled={submitting}
          />
        </div>
      </form>
    </div>
  );
};

export default AnnouncementForm;
