import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { communicationsService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MessageDetail = () => {
  const { messageId } = useParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Cargar detalles del mensaje
  useEffect(() => {
    const fetchMessageDetails = async () => {
      try {
        setLoading(true);
        const response = await communicationsService.getMessageById(messageId);
        setMessage(response.data);
        
        // Marcar como leído si es un mensaje recibido y no está leído
        if (response.data.recipient_id === currentUser.id && !response.data.read) {
          await communicationsService.markMessageAsRead(messageId);
        }
      } catch (error) {
        console.error('Error al cargar detalles del mensaje:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (messageId) {
      fetchMessageDetails();
    }
  }, [messageId, currentUser.id]);

  // Responder mensaje
  const handleReply = () => {
    navigate(`/communications/messages/reply/${messageId}`);
  };

  // Reenviar mensaje
  const handleForward = () => {
    navigate(`/communications/messages/forward/${messageId}`);
  };

  // Archivar mensaje
  const handleArchive = async () => {
    try {
      await communicationsService.archiveMessage(messageId);
      navigate('/communications/messages');
    } catch (error) {
      console.error('Error al archivar mensaje:', error);
    }
  };

  // Destacar/quitar destacado de mensaje
  const handleToggleStar = async () => {
    try {
      await communicationsService.toggleMessageStar(messageId);
      setMessage(prev => ({
        ...prev,
        starred: !prev.starred
      }));
    } catch (error) {
      console.error('Error al destacar/quitar destacado de mensaje:', error);
    }
  };

  // Eliminar mensaje
  const handleDelete = async () => {
    if (window.confirm('¿Está seguro de que desea eliminar este mensaje?')) {
      try {
        await communicationsService.deleteMessage(messageId);
        navigate('/communications/messages');
      } catch (error) {
        console.error('Error al eliminar mensaje:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Mensaje no encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            El mensaje que está buscando no existe o ha sido eliminado.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/communications/messages')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Volver a mensajes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/communications/messages')}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900"
        >
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a mensajes
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Encabezado del mensaje */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{message.subject}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {message.sender_id === currentUser.id ? 'Enviado a' : 'Recibido de'}: {message.sender_id === currentUser.id ? message.recipient_name : message.sender_name}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-2">
              {message.recipient_id === currentUser.id && (
                <button
                  onClick={handleReply}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Responder
                </button>
              )}
              <button
                onClick={handleForward}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Reenviar
              </button>
              <button
                onClick={handleToggleStar}
                className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md ${
                  message.starred
                    ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <svg className={`mr-2 h-4 w-4 ${message.starred ? 'text-yellow-500' : 'text-gray-500'}`} fill={message.starred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {message.starred ? 'Quitar destacado' : 'Destacar'}
              </button>
              <button
                onClick={handleArchive}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Archivar
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
        
        {/* Detalles del mensaje */}
        <div className="px-6 py-5">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {message.sender_id === currentUser.id ? 'Para' : 'De'}: {message.sender_id === currentUser.id ? message.recipient_name : message.sender_name}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
              {message.sender_id !== currentUser.id && (
                <div className="flex items-center">
                  {message.sender_profile_image ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={message.sender_profile_image}
                      alt={message.sender_name}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-800 font-medium">
                        {message.sender_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="prose max-w-none text-gray-900 mb-6">
            {message.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Archivos adjuntos</h3>
              <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                {message.attachments.map((attachment) => (
                  <li key={attachment.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="ml-2 flex-1 w-0 truncate">
                        {attachment.filename}
                      </span>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <a
                        href={attachment.url}
                        download
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Descargar
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;
