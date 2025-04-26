import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Componentes
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';

const MessageForm = () => {
  const { id, action } = useParams();
  const navigate = useNavigate();
  const isReply = action === 'reply';
  const isForward = action === 'forward';
  
  const [formData, setFormData] = useState({
    recipients: '',
    subject: '',
    content: '',
    attachments: []
  });
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(id ? true : false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cargar lista de miembros para destinatarios
    const fetchMembers = async () => {
      try {
        const response = await axios.get('/api/members/');
        setMembers(response.data);
      } catch (err) {
        console.error('Error fetching members:', err);
      }
    };

    fetchMembers();

    // Si es respuesta o reenvío, cargar mensaje original
    if (id && (isReply || isForward)) {
      const fetchOriginalMessage = async () => {
        try {
          const response = await axios.get(`/api/communications/messages/${id}/`);
          
          if (isReply) {
            setFormData({
              recipients: response.data.sender,
              subject: `Re: ${response.data.subject}`,
              content: `\n\n\n----- Mensaje Original -----\nDe: ${response.data.sender}\nFecha: ${new Date(response.data.sent_at).toLocaleString()}\nAsunto: ${response.data.subject}\n\n${response.data.content}`,
              attachments: []
            });
          } else if (isForward) {
            setFormData({
              recipients: '',
              subject: `Fwd: ${response.data.subject}`,
              content: `\n\n\n----- Mensaje Reenviado -----\nDe: ${response.data.sender}\nFecha: ${new Date(response.data.sent_at).toLocaleString()}\nAsunto: ${response.data.subject}\n\n${response.data.content}`,
              attachments: []
            });
          }
          
          setLoading(false);
        } catch (err) {
          setError('Error al cargar el mensaje original. Por favor, intente nuevamente.');
          console.error('Error fetching original message:', err);
          setLoading(false);
        }
      };

      fetchOriginalMessage();
    }
  }, [id, isReply, isForward]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
      }));
    } else if (name === 'recipients' && type === 'select-multiple') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({
        ...prev,
        recipients: selectedOptions.join(', ')
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
    if (!formData.recipients || !formData.subject || !formData.content) {
      setError('Por favor complete todos los campos requeridos.');
      return;
    }

    const data = new FormData();
    data.append('recipients', formData.recipients);
    data.append('subject', formData.subject);
    data.append('content', formData.content);
    
    if (id && (isReply || isForward)) {
      data.append('parent_message', id);
    }
    
    // Añadir archivos adjuntos
    formData.attachments.forEach(file => {
      data.append('attachments', file);
    });

    try {
      setSubmitting(true);
      await axios.post('/api/communications/messages/', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      navigate('/communications');
    } catch (err) {
      setError('Error al enviar el mensaje. Por favor, intente nuevamente.');
      console.error('Error submitting form:', err);
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-4">
      <PageHeader 
        title={isReply ? 'Responder Mensaje' : isForward ? 'Reenviar Mensaje' : 'Nuevo Mensaje'} 
        backLink="/communications"
        backLabel="Volver a Comunicaciones"
      />
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="recipients">
              Destinatarios *
            </label>
            <select
              id="recipients"
              name="recipients"
              multiple={!isReply}
              value={isReply ? [formData.recipients] : formData.recipients.split(', ').filter(r => r)}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              disabled={isReply}
            >
              {members.map(member => (
                <option key={member.id} value={member.email || member.username}>
                  {member.full_name || member.username}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {isReply ? 'En respuestas, el destinatario es fijo' : 'Mantenga presionada la tecla Ctrl para seleccionar múltiples destinatarios'}
            </p>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subject">
              Asunto *
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
              Mensaje *
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
            label="Enviar Mensaje"
            variant="primary"
            disabled={submitting}
          />
        </div>
      </form>
    </div>
  );
};

export default MessageForm;
