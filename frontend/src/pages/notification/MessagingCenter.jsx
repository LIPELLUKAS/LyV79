import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { communicationsService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MessagingCenter = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [folder, setFolder] = useState('inbox');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Cargar mensajes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await communicationsService.getMessages({
          page,
          folder,
          search: searchTerm,
          limit: 10
        });
        
        setMessages(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10));
      } catch (error) {
        console.error('Error al cargar mensajes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [page, folder, searchTerm]);

  // Manejar selección de todos los mensajes
  useEffect(() => {
    if (selectAll) {
      setSelectedMessages(messages.map(message => message.id));
    } else {
      setSelectedMessages([]);
    }
  }, [selectAll, messages]);

  // Navegar a la página de detalle del mensaje
  const handleViewMessage = async (messageId) => {
    // Marcar como leído si está en la bandeja de entrada
    if (folder === 'inbox') {
      try {
        await communicationsService.markMessageAsRead(messageId);
        
        // Actualizar estado local
        setMessages(prevMessages => 
          prevMessages.map(message => 
            message.id === messageId 
              ? { ...message, read: true } 
              : message
          )
        );
      } catch (error) {
        console.error('Error al marcar mensaje como leído:', error);
      }
    }
    
    navigate(`/communications/messages/${messageId}`);
  };

  // Navegar a la página de creación de mensaje
  const handleComposeMessage = () => {
    navigate('/communications/messages/new');
  };

  // Manejar selección de mensaje
  const handleSelectMessage = (messageId) => {
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  // Marcar mensajes como leídos
  const handleMarkAsRead = async () => {
    if (selectedMessages.length === 0) return;
    
    try {
      await Promise.all(
        selectedMessages.map(messageId => 
          communicationsService.markMessageAsRead(messageId)
        )
      );
      
      // Actualizar estado local
      setMessages(prevMessages => 
        prevMessages.map(message => 
          selectedMessages.includes(message.id) 
            ? { ...message, read: true } 
            : message
        )
      );
      
      // Limpiar selección
      setSelectedMessages([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error);
    }
  };

  // Marcar mensajes como destacados
  const handleToggleStar = async () => {
    if (selectedMessages.length === 0) return;
    
    try {
      await Promise.all(
        selectedMessages.map(messageId => 
          communicationsService.toggleMessageStar(messageId)
        )
      );
      
      // Actualizar estado local
      setMessages(prevMessages => 
        prevMessages.map(message => 
          selectedMessages.includes(message.id) 
            ? { ...message, starred: !message.starred } 
            : message
        )
      );
      
      // Limpiar selección
      setSelectedMessages([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Error al destacar/quitar destacado de mensajes:', error);
    }
  };

  // Archivar mensajes
  const handleArchive = async () => {
    if (selectedMessages.length === 0) return;
    
    try {
      await Promise.all(
        selectedMessages.map(messageId => 
          communicationsService.archiveMessage(messageId)
        )
      );
      
      // Actualizar estado local
      setMessages(prevMessages => 
        prevMessages.filter(message => !selectedMessages.includes(message.id))
      );
      
      // Limpiar selección
      setSelectedMessages([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Error al archivar mensajes:', error);
    }
  };

  // Eliminar mensajes
  const handleDelete = async () => {
    if (selectedMessages.length === 0) return;
    
    if (window.confirm(`¿Está seguro de que desea eliminar ${selectedMessages.length} mensaje(s)?`)) {
      try {
        await Promise.all(
          selectedMessages.map(messageId => 
            communicationsService.deleteMessage(messageId)
          )
        );
        
        // Actualizar estado local
        setMessages(prevMessages => 
          prevMessages.filter(message => !selectedMessages.includes(message.id))
        );
        
        // Limpiar selección
        setSelectedMessages([]);
        setSelectAll(false);
      } catch (error) {
        console.error('Error al eliminar mensajes:', error);
      }
    }
  };

  // Renderizar icono según estado del mensaje
  const renderMessageIcon = (message) => {
    if (folder === 'inbox' && !message.read) {
      return (
        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-600"></div>
      );
    } else if (message.starred) {
      return (
        <svg className="flex-shrink-0 h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    } else {
      return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Centro de Mensajería</h1>
        <button
          onClick={handleComposeMessage}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Redactar mensaje
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Barra lateral */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              <li>
                <button
                  onClick={() => { setFolder('inbox'); setPage(1); }}
                  className={`w-full px-4 py-3 flex items-center text-sm font-medium ${
                    folder === 'inbox'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  Recibidos
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setFolder('sent'); setPage(1); }}
                  className={`w-full px-4 py-3 flex items-center text-sm font-medium ${
                    folder === 'sent'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  Enviados
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setFolder('drafts'); setPage(1); }}
                  className={`w-full px-4 py-3 flex items-center text-sm font-medium ${
                    folder === 'drafts'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Borradores
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setFolder('starred'); setPage(1); }}
                  className={`w-full px-4 py-3 flex items-center text-sm font-medium ${
                    folder === 'starred'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Destacados
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setFolder('archived'); setPage(1); }}
                  className={`w-full px-4 py-3 flex items-center text-sm font-medium ${
                    folder === 'archived'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Archivados
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setFolder('trash'); setPage(1); }}
                  className={`w-full px-4 py-3 flex items-center text-sm font-medium ${
                    folder === 'trash'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Papelera
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Lista de mensajes */}
        <div className="md:col-span-3">
          {/* Barra de búsqueda y acciones */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="w-full md:w-1/3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  placeholder="Buscar mensajes..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleMarkAsRead}
                  disabled={selectedMessages.length === 0 || folder !== 'inbox'}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    selectedMessages.length === 0 || folder !== 'inbox'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Marcar como leído
                </button>
                <button
                  onClick={handleToggleStar}
                  disabled={selectedMessages.length === 0}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    selectedMessages.length === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Destacar
                </button>
                <button
                  onClick={handleArchive}
                  disabled={selectedMessages.length === 0 || folder === 'archived' || folder === 'trash'}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    selectedMessages.length === 0 || folder === 'archived' || folder === 'trash'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Archivar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={selectedMessages.length === 0}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    selectedMessages.length === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
          
          {/* Mensajes */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-9
(Content truncated due to size limit. Use line ranges to read in chunks)