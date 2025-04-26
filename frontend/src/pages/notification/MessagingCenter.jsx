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
  
  // Manejar selección de mensaje individual
  const handleSelectMessage = (messageId) => {
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };
  
  // Manejar cambio de carpeta
  const handleFolderChange = (newFolder) => {
    setFolder(newFolder);
    setPage(1);
    setSelectedMessages([]);
    setSelectAll(false);
  };
  
  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };
  
  // Manejar eliminación de mensajes
  const handleDeleteMessages = async () => {
    if (selectedMessages.length === 0) return;
    
    if (window.confirm(`¿Estás seguro de que deseas eliminar ${selectedMessages.length} mensaje(s)?`)) {
      try {
        await Promise.all(
          selectedMessages.map(messageId => 
            communicationsService.deleteMessage(messageId)
          )
        );
        
        // Actualizar lista de mensajes
        setMessages(prev => prev.filter(message => !selectedMessages.includes(message.id)));
        setSelectedMessages([]);
        setSelectAll(false);
      } catch (error) {
        console.error('Error al eliminar mensajes:', error);
      }
    }
  };
  
  // Manejar marcar como leído/no leído
  const handleMarkAsRead = async (read = true) => {
    if (selectedMessages.length === 0) return;
    
    try {
      await Promise.all(
        selectedMessages.map(messageId => 
          communicationsService.updateMessage(messageId, { is_read: read })
        )
      );
      
      // Actualizar lista de mensajes
      setMessages(prev => 
        prev.map(message => 
          selectedMessages.includes(message.id) 
            ? { ...message, is_read: read } 
            : message
        )
      );
    } catch (error) {
      console.error('Error al actualizar mensajes:', error);
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Si es hoy, mostrar solo la hora
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Si es este año, mostrar día y mes
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
    
    // Si es otro año, mostrar día, mes y año
    return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centro de mensajes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona tus comunicaciones internas
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => navigate('/messages/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Nuevo mensaje
          </button>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Barra lateral */}
        <div className="md:col-span-1">
          <nav className="space-y-1">
            <button
              onClick={() => handleFolderChange('inbox')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                folder === 'inbox'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <svg className={`mr-3 h-5 w-5 ${folder === 'inbox' ? 'text-indigo-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              Bandeja de entrada
            </button>
            
            <button
              onClick={() => handleFolderChange('sent')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                folder === 'sent'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <svg className={`mr-3 h-5 w-5 ${folder === 'sent' ? 'text-indigo-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              Enviados
            </button>
            
            <button
              onClick={() => handleFolderChange('drafts')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                folder === 'drafts'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <svg className={`mr-3 h-5 w-5 ${folder === 'drafts' ? 'text-indigo-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Borradores
            </button>
            
            <button
              onClick={() => handleFolderChange('trash')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                folder === 'trash'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <svg className={`mr-3 h-5 w-5 ${folder === 'trash' ? 'text-indigo-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Papelera
            </button>
          </nav>
        </div>
        
        {/* Lista de mensajes */}
        <div className="md:col-span-3">
          {/* Barra de búsqueda y acciones */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <form onSubmit={handleSearch} className="flex-1 sm:max-w-xs">
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Buscar mensajes..."
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </form>
                
                <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                  <button
                    onClick={() => handleMarkAsRead(true)}
                    disabled={selectedMessages.length === 0}
                    className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm ${
                      selectedMessages.length === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Marcar como leído
                  </button>
                  <button
                    onClick={() => handleMarkAsRead(false)}
                    disabled={selectedMessages.length === 0}
                    className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm ${
                      selectedMessages.length === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Marcar como no leído
                  </button>
                  <button
                    onClick={handleDeleteMessages}
                    disabled={selectedMessages.length === 0}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm ${
                      selectedMessages.length === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    Eliminar
                  </button>
                </div>
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay mensajes</h3>
              <p className="mt-1 text-sm text-gray-500">
                {folder === 'inbox' && 'Tu bandeja de entrada está vacía.'}
                {folder === 'sent' && 'No has enviado ningún mensaje.'}
                {folder === 'drafts' && 'No tienes borradores guardados.'}
                {folder === 'trash' && 'La papelera está vacía.'}
              </p>
              {folder === 'inbox' && (
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/messages/new')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Nuevo mensaje
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="border-b border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={() => setSelectAll(!selectAll)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {folder === 'sent' ? 'Destinatario' : 'Remitente'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asunto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {messages.map((message) => (
                      <tr
                        key={message.id}
                        onClick={() => navigate(`/messages/${message.id}`)}
                        className={`cursor-pointer hover:bg-gray-50 ${!message.is_read ? 'font-semibold bg-gray-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedMessages.includes(message.id)}
                              onChange={() => handleSelectMessage(message.id)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {folder === 'sent' ? message.recipient_name : message.sender_name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 truncate max-w-xs">
                            {message.subject || '(Sin asunto)'}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {message.content.substring(0, 50)}
                            {message.content.length > 50 ? '...' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(message.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Paginación */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        page === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        page === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Siguiente
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{(page - 1) * 10 + 1}</span> a{' '}
                        <span className="font-medium">{Math.min(page * 10, messages.length)}</span> de{' '}
                        <span className="font-medium">{messages.length}</span> resultados
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            page === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Anterior</span>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === i + 1
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setPage(Math.min(totalPages, page + 1))}
                          disabled={page === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            page === totalPages
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Siguiente</span>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingCenter;
