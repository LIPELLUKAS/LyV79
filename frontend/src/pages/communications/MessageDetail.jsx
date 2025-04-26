import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Componentes
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';

const MessageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/communications/messages/${id}/`);
        setMessage(response.data);
        
        // Marcar como leído si no lo está
        if (!response.data.read) {
          await axios.patch(`/api/communications/messages/${id}/`, { read: true });
        }
        
        setError(null);
      } catch (err) {
        setError('Error al cargar el mensaje. Por favor, intente nuevamente.');
        console.error('Error fetching message:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [id]);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/communications/messages/${id}/`);
      navigate('/communications');
    } catch (err) {
      setError('Error al eliminar el mensaje. Por favor, intente nuevamente.');
      console.error('Error deleting message:', err);
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (error) return <Alert type="error" message={error} />;

  if (!message) return <Alert type="warning" message="Mensaje no encontrado" />;

  return (
    <div className="p-4">
      <PageHeader 
        title="Detalle de Mensaje" 
        backLink="/communications"
        backLabel="Volver a Comunicaciones"
      />
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{message.subject}</h1>
        
        <div className="flex items-center text-gray-500 mb-4">
          <span>De: {message.sender}</span>
          <span className="mx-2">•</span>
          <span>Para: {message.recipients.join(', ')}</span>
          <span className="mx-2">•</span>
          <span>{new Date(message.sent_at).toLocaleString()}</span>
        </div>
        
        <div className="prose max-w-none mt-6 border-t pt-4">
          {message.content}
        </div>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Archivos adjuntos</h3>
            <ul className="space-y-2">
              {message.attachments.map((attachment, index) => (
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
        
        {message.thread && message.thread.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Conversación anterior</h3>
            <div className="space-y-4">
              {message.thread.map((threadMessage, index) => (
                <div key={index} className="border-l-2 pl-4 py-2">
                  <div className="flex items-center text-gray-500 mb-1">
                    <span>De: {threadMessage.sender}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(threadMessage.sent_at).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700">{threadMessage.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <Button
            label="Responder"
            icon="reply"
            variant="primary"
            as={Link}
            to={`/communications/messages/reply/${id}`}
          />
          <Button
            label="Reenviar"
            icon="forward"
            variant="secondary"
            as={Link}
            to={`/communications/messages/forward/${id}`}
          />
        </div>
        
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

export default MessageDetail;
