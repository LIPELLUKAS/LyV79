import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { communicationService } from '../../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const MessagingCenter = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  const messageEndRef = useRef(null);
  
  // Estados para la lista de conversaciones
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, direct, group
  
  // Cargar conversaciones al iniciar
  useEffect(() => {
    fetchConversations();
  }, [filter]);
  
  // Cargar mensajes cuando se selecciona una conversación
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);
  
  // Scroll al último mensaje cuando se cargan nuevos mensajes
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Simular recepción de mensajes en tiempo real (en producción se usaría WebSockets)
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedConversation) {
        fetchMessages(selectedConversation.id, false);
      }
    }, 10000); // Cada 10 segundos
    
    return () => clearInterval(interval);
  }, [selectedConversation]);
  
  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      // Construir parámetros de consulta
      const queryParams = { filter };
      
      const response = await communicationService.getConversations(queryParams);
      setConversations(response.data.results || []);
      
      // Si no hay conversación seleccionada y hay conversaciones, seleccionar la primera
      if (!selectedConversation && response.data.results && response.data.results.length > 0) {
        setSelectedConversation(response.data.results[0]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar conversaciones:', err);
      setError('No se pudieron cargar las conversaciones');
      showNotification('Error al cargar conversaciones', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMessages = async (conversationId, showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true);
    }
    
    try {
      const response = await communicationService.getMessages(conversationId);
      setMessages(response.data.results || []);
      
      // Marcar conversación como leída
      if (selectedConversation && selectedConversation.unread_count > 0) {
        await communicationService.markConversationAsRead(conversationId);
        
        // Actualizar el contador de no leídos en la lista de conversaciones
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
          )
        );
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar mensajes:', err);
      if (showLoadingState) {
        setError('No se pudieron cargar los mensajes');
        showNotification('Error al cargar mensajes', 'error');
      }
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) {
      return;
    }
    
    setSendingMessage(true);
    
    try {
      const response = await communicationService.sendMessage({
        conversation_id: selectedConversation.id,
        content: newMessage,
        attachments: [] // Implementar adjuntos en el futuro
      });
      
      // Agregar el mensaje a la lista
      setMessages(prevMessages => [...prevMessages, response.data]);
      
      // Limpiar el campo de mensaje
      setNewMessage('');
      
      // Actualizar la última actividad en la conversación
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === selectedConversation.id 
            ? { 
                ...conv, 
                last_message: newMessage,
                last_activity: new Date().toISOString()
              } 
            : conv
        )
      );
      
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      showNotification('Error al enviar el mensaje', 'error');
    } finally {
      setSendingMessage(false);
    }
  };
  
  const handleNewConversation = () => {
    navigate('/communications/messages/new');
  };
  
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };
  
  // Filtrar conversaciones por término de búsqueda
  const filteredConversations = conversations.filter(conv => {
    const searchLower = searchTerm.toLowerCase();
    return (
      conv.title.toLowerCase().includes(searchLower) ||
      (conv.participants && conv.participants.some(p => 
        p.name.toLowerCase().includes(searchLower)
      ))
    );
  });
  
  // Formatear fecha relativa
  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return format(date, 'HH:mm', { locale: es });
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return format(date, 'EEEE', { locale: es });
    } else {
      return format(date, 'dd/MM/yyyy', { locale: es });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Centro de Mensajes</h1>
        <button
          onClick={handleNewConversation}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nueva Conversación
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row h-[calc(100vh-200px)]">
          {/* Panel lateral de conversaciones */}
          <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
            {/* Búsqueda y filtros */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar conversaciones..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex mt-3 space-x-2">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === 'all' 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => handleFilterChange('unread')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === 'unread' 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  No leídos
                </button>
                <button
                  onClick={() => handleFilterChange('direct')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === 'direct' 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Directos
                </button>
                <button
                  onClick={() => handleFilterChange('group')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === 'group' 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Grupos
                </button>
              </div>
            </div>
            
            {/* Lista de conversaciones */}
            <div className="flex-1 overflow-y-auto">
              {loading && !selectedConversation ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : error && !selectedConversation ? (
                <div className="p-4 text-center">
                  <p className="text-red-500">{error}</p>
                  <button 
                    onClick={fetchConversations}
                    className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Intentar nuevamente
                  </button>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm 
                    ? 'No se encontraron conversaciones que coincidan con la búsqueda.' 
                    : 'No hay conversaciones disponibles.'}
                </div>
              ) : (
                filteredConversations.map(conversation => (
                  <div
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                      selectedConversation && selectedConversation.id === conversation.id 
                        ? 'bg-indigo-50' 
                        : ''
                    }`}
                  >
                    <div className="flex items-start">
                      {conversation.is_group ? (
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded-full" 
                            src={conversation.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.title)}&background=random`} 
                            alt={conversation.title} 
                          />
                        </div>
                      )}
                      
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatRelativeDate(conversation.last_activity)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.last_message}
                        </p>
                      </div>
                      
                      {conversation.unread_count > 0 && (
                        <div className="ml-2 flex-shrink-0">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-600 text-xs font-medium text-white">
                            {conversation.unread_count}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Panel de mensajes */}
          <div className="w-full md:w-2/3 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Cabecera de la conversación */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  {selectedConversation.is_group ? (
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  ) : (
                    <img 
                      className="h-10 w-10 rounded-full" 
                      src={selectedConversation.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.title)}&background=random`} 
                      alt={selectedConversation.title} 
                    />
                  )}
                  
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {selectedConversation.title}
                    </p>
                    {selectedConversation.participants && (
                      <p className="text-xs text-gray-500">
                        {selectedConversation.is_group 
                          ? `${selectedConversation.participants.length} participantes` 
                          : 'Conversación privada'}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Mensajes */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : error ? (
                    <div className="p-4 text-center">
                      <p className="text-red-500">{error}</p>
                      <button 
                        onClick={() => fetchMessages(selectedConversation.id)}
                        className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Intentar nuevamente
                      </button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <p className="mt-2 text-gray-500">
                        No hay mensajes en esta conversación.
                      </p>
                      <p className="text-sm text-gray-400">
                        Envía un mensaje para comenzar.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => {
                        const isCurrentUser = message.sender_id === currentUser?.id;
                        const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
                        
                        return (
                          <div 
                            key={message.id} 
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isCurrentUser && showAvatar && (
                              <div className="flex-shrink-0 mr-2">
                                <img 
                                  className="h-8 w-8 rounded-full" 
                                  src={message.sender_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender_name)}&background=random`} 
                                  alt={message.sender_name} 
                                />
                              </div>
                            )}
                            
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg ${!isCurrentUser && !showAvatar ? 'ml-10' : ''}`}>
                              {!isCurrentUser && showAvatar && (
                                <p className="text-xs text-gray-500 mb-1">{message.sender_name}</p>
                              )}
                              
                              <div 
                                className={`px-4 py-2 rounded-lg ${
                                  isCurrentUser 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-white border border-gray-200 text-gray-800'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                              
                              <p className={`text-xs mt-1 ${isCurrentUser ? 'text-right' : ''} text-gray-500`}>
                                {format(new Date(message.created_at), 'HH:mm', { locale: es })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messageEndRef} />
                    </div>
                  )}
                </div>
                
                {/* Formulario de envío de mensajes */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex items-end">
                    <div className="flex-1 mr-2">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        rows="2"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sendingMessage}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        !newMessage.trim() || sendingMessage
                          ? 'bg-indigo-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {sendingMessage ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                      Enviar
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Centro de Mensajes</h3>
                <p className="mt-1 text-gray-500">
                  Selecciona una conversación o inicia una nueva para comenzar a chatear.
                </p>
                <button
                  onClick={handleNewConversation}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nueva Conversación
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingCenter;
