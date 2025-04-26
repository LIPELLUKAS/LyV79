import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Componentes
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/library/documents/${id}/`);
        setDocument(response.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los detalles del documento. Por favor, intente nuevamente.');
        console.error('Error fetching document details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/library/documents/${id}/`);
      navigate('/library');
    } catch (err) {
      setError('Error al eliminar el documento. Por favor, intente nuevamente.');
      console.error('Error deleting document:', err);
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (error) return <Alert type="error" message={error} />;

  if (!document) return <Alert type="warning" message="Documento no encontrado" />;

  return (
    <div className="p-4">
      <PageHeader 
        title="Detalle de Documento" 
        backLink="/library"
        backLabel="Volver a Biblioteca"
      />
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{document.title}</h1>
        
        <div className="flex items-center text-gray-500 mb-4">
          <span>Subido por {document.uploaded_by}</span>
          <span className="mx-2">•</span>
          <span>{new Date(document.upload_date).toLocaleDateString()}</span>
        </div>
        
        {document.categories && document.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {document.categories.map(category => (
              <span key={category} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {category}
              </span>
            ))}
          </div>
        )}
        
        {document.description && (
          <div className="mb-6">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Descripción</h3>
            <p className="text-gray-700">{document.description}</p>
          </div>
        )}
        
        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            label="Descargar"
            icon="download"
            variant="primary"
            as="a"
            href={document.file_url}
            target="_blank"
            rel="noopener noreferrer"
          />
          
          <Button
            label="Editar"
            icon="edit"
            variant="secondary"
            as={Link}
            to={`/library/documents/edit/${id}`}
          />
        </div>
      </div>
      
      <div className="flex justify-end">
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

export default DocumentDetail;
