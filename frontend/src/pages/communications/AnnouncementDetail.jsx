import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Componentes
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';

const AnnouncementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/communications/announcements/${id}/`);
        setAnnouncement(response.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar el anuncio. Por favor, intente nuevamente.');
        console.error('Error fetching announcement:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/communications/announcements/${id}/`);
      navigate('/communications');
    } catch (err) {
      setError('Error al eliminar el anuncio. Por favor, intente nuevamente.');
      console.error('Error deleting announcement:', err);
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (error) return <Alert type="error" message={error} />;

  if (!announcement) return <Alert type="warning" message="Anuncio no encontrado" />;

  return (
    <div className="p-4">
      <PageHeader 
        title="Detalle de Anuncio" 
        backLink="/communications"
        backLabel="Volver a Comunicaciones"
      />
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{announcement.title}</h1>
        
        <div className="flex items-center text-gray-500 mb-4">
          <span>Publicado por {announcement.author}</span>
          <span className="mx-2">•</span>
          <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
        </div>
        
        {announcement.tags && announcement.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {announcement.tags.map(tag => (
              <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="prose max-w-none mt-6">
          {announcement.content}
        </div>
        
        {announcement.attachments && announcement.attachments.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Archivos adjuntos</h3>
            <ul className="space-y-2">
              {announcement.attachments.map((attachment, index) => (
                <li key={index}>
                  <a 
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <i className="fas fa-file mr-2"></i>
                    {attachment.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button
          label="Editar"
          icon="edit"
          variant="primary"
          as={Link}
          to={`/communications/announcements/edit/${id}`}
        />
        
        {!deleteConfirm ? (
          <Button
            label="Eliminar"
            icon="trash"
            variant="danger"
            onClick={() => setDeleteConfirm(true)}
          />
        ) : (
          <div className="flex space-x-2">
            <Button
              label="Cancelar"
              variant="secondary"
              onClick={() => setDeleteConfirm(false)}
            />
            <Button
              label="Confirmar Eliminación"
              variant="danger"
              onClick={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementDetail;
