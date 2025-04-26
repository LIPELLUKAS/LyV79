import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { communicationsService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MessageForm = () => {
  const { messageId, action } = useParams(); // action puede ser 'reply' o 'forward'
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [originalMessage, setOriginalMessage] = useState(null);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      subject: '',
      content: '',
      save_as_draft: false
    }
  });
  
  // Cargar lista de miembros
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await communicationsService.getAllMembers();
        setMembers(response.data);
      } catch (error) {
        console.error('Error al cargar miembros:', error);
      }
    };
    
    fetchMembers();
  }, []);
  
  // Cargar mensaje original si estamos respondiendo o reenviando
  useEffect(() => {
    const fetchOriginalMessage = async () => {
      if (!messageId || !action) return;
      
      try {
        setLoading(true);
        const response = await communicationsService.getMessageById(messageId);
        setOriginalMessage(response.data);
        
        if (action === 'reply') {
          // Preseleccionar al remitente original como destinatario
          setSelectedRecipients([response.data.sender_id]);
          
          // Establecer asunto con "Re: "
          setValue('subject', `Re: ${response.data.subject}`);
          
          // Establecer contenido con cita del mensaje original
          setValue('content', `\n\n---\nEn ${new Date(response.data.created_at).toLocaleString()}, ${response.data.sender_name} escribió:\n\n${response.data.content.split('\n').map(line => `> ${line}`).join('\n')}`);
        } else if (action === 'forward') {
          // Establecer asunto con "Fwd: "
          setValue('subject', `Fwd: ${response.data.subject}`);
          
          // Establecer contenido con mensaje original
          setValue('content', `\n\n---\nMensaje reenviado:\nDe: ${response.data.sender_name}\nFecha: ${new Date(response.data.created_at).toLocaleString()}\nAsunto: ${response.data.subject}\n\n${response.data.content}`);
        }
      } catch (error) {
        console.error('Error al cargar mensaje original:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOriginalMessage();
  }, [messageId, action, setValue]);
  
  // Manejar selección de destinatarios
  const handleRecipientSelection = (userId) => {
    setSelectedRecipients(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };
  
  // Enviar formulario
  const onSubmit = async (data) => {
    if (selectedRecipients.length === 0) {
      alert('Debe seleccionar al menos un destinatario.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const messageData = {
        subject: data.subject,
        content: data.content,
        recipients: selectedRecipients,
        save_as_draft: data.save_as_draft,
        original_message_id: action ? messageId : null,
        action: action || null
      };
      
      if (data.save_as_draft) {
        await communicationsService.saveDraft(messageData);
      } else {
        await communicationsService.sendMessage(messageData);
      }
      
      navigate('/communications/messages');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      alert('Ha ocurrido un error al enviar el mensaje. Por favor, inténtelo de nuevo.');
    } finally {
      setSubmitting(false);
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
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-900">
            {action === 'reply' ? 'Responder mensaje' : 
             action === 'forward' ? 'Reenviar mensaje' : 
             'Nuevo mensaje'}
          </h1>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5">
          <div className="space-y-6">
            <div>
              <label htmlFor="recipients" className="block text-sm font-medium text-gray-700">
                Destinatarios *
              </label>
              <div className="mt-1 border border-gray-300 rounded-md p-2 max-h-60 overflow-y-auto">
                {members.length === 0 ? (
                  <p className="text-sm text-gray-500 p-2">
                    Cargando miembros...
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {members.map((member) => (
                      <li key={member.id} className="py-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`member-${member.id}`}
                            checked={selectedRecipients.includes(member.id)}
                            onChange={() => handleRecipientSelection(member.id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`member-${member.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                            {member.name} {member.symbolic_name && `(${member.symbolic_name})`}
                            <span className="text-xs text-gray-500 ml-2">
                              Grado: {member.degree}° | {member.office || 'Sin cargo'}
                            </span>
                          </label>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {selectedRecipients.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  Debe seleccionar al menos un destinatario.
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Asunto *
              </label>
              <input
                type="text"
                id="subject"
                {...register('subject', { required: 'El asunto es obligatorio' })}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.subject ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Contenido *
              </label>
              <textarea
                id="content"
                rows={10}
                {...register('content', { required: 'El contenido es obligatorio' })}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.content ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="save_as_draft"
                {...register('save_as_draft')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="save_as_draft" className="ml-2 block text-sm text-gray-900">
                Guardar como borrador
              </label>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/communications/messages')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Enviando...' : watch('save_as_draft') ? 'Guardar borrador' : 'Enviar mensaje'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageForm;
