import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Componentes
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';
import Tabs from '../../components/Tabs';

const CommunicationsList = () => {
  const [activeTab, setActiveTab] = useState('announcements');
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunications = async () => {
      try {
        setLoading(true);
        const endpoint = activeTab === 'announcements' 
          ? '/api/communications/announcements/' 
          : '/api/communications/messages/';
        
        const response = await axios.get(endpoint);
        setCommunications(response.data);
        setError(null);
      } catch (err) {
        setError(`Error al cargar las ${activeTab === 'announcements' ? 'comunicaciones' : 'mensajes'}. Por favor, intente nuevamente.`);
        console.error('Error fetching communications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunications();
  }, [activeTab]);

  const tabs = [
    { id: 'announcements', label: 'Anuncios' },
    { id: 'messages', label: 'Mensajes' }
  ];

  const renderAnnouncementsList = () => {
    if (communications.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay anuncios disponibles</p>
          <Button
            label="Crear Anuncio"
            variant="primary"
            className="mt-4"
            as={Link}
            to="/communications/announcements/new"
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {communications.map(announcement => (
          <div key={announcement.id} className="bg-white shadow-md rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{announcement.title}</h3>
                <p className="text-sm text-gray-500">
                  Publicado el {new Date(announcement.created_at).toLocaleDateString()} por {announcement.author}
                </p>
              </div>
              <div className="flex space-x-2">
                <Link 
                  to={`/communications/announcements/${announcement.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Ver
                </Link>
                <Link 
                  to={`/communications/announcements/edit/${announcement.id}`}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  Editar
                </Link>
              </div>
            </div>
            <p className="mt-2 text-gray-700 line-clamp-2">{announcement.content}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {announcement.tags && announcement.tags.map(tag => (
                <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMessagesList = () => {
    if (communications.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay mensajes disponibles</p>
          <Button
            label="Enviar Mensaje"
            variant="primary"
            className="mt-4"
            as={Link}
            to="/communications/messages/new"
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {communications.map(message => (
          <div 
            key={message.id} 
            className={`bg-white shadow-md rounded-lg p-4 ${!message.read ? 'border-l-4 border-blue-500' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{message.subject}</h3>
                <p className="text-sm text-gray-500">
                  {message.sender} • {new Date(message.sent_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <Link 
                  to={`/communications/messages/${message.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Ver
                </Link>
                <Link 
                  to={`/communications/messages/reply/${message.id}`}
                  className="text-green-600 hover:text-green-800"
                >
                  Responder
                </Link>
              </div>
            </div>
            <p className="mt-2 text-gray-700 line-clamp-2">{message.content}</p>
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2">
                <span className="text-sm text-gray-500">
                  <i className="fas fa-paperclip mr-1"></i>
                  {message.attachments.length} adjunto(s)
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      <PageHeader title="Comunicaciones" />
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      <div className="mt-4 flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {activeTab === 'announcements' ? 'Anuncios' : 'Mensajes'}
        </h2>
        <Button
          label={activeTab === 'announcements' ? 'Nuevo Anuncio' : 'Nuevo Mensaje'}
          icon="plus"
          variant="primary"
          as={Link}
          to={activeTab === 'announcements' ? '/communications/announcements/new' : '/communications/messages/new'}
        />
      </div>
      
      {loading ? (
        <Loading />
      ) : (
        activeTab === 'announcements' ? renderAnnouncementsList() : renderMessagesList()
      )}
    </div>
  );
};

export default CommunicationsList;
