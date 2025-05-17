import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { libraryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const DocumentsList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Cargar documentos y categorías
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar categorías
        const categoriesResponse = await libraryService.getCategories();
        setCategories(categoriesResponse.data || []);
        
        // Cargar documentos con paginación
        const params = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage
        };
        
        const documentsResponse = await libraryService.getDocuments(params);
        setDocuments(documentsResponse.data.results || []);
        setFilteredDocuments(documentsResponse.data.results || []);
        
        // Actualizar información de paginación
        setPagination({
          ...pagination,
          totalPages: Math.ceil(documentsResponse.data.count / pagination.itemsPerPage),
          totalItems: documentsResponse.data.count
        });
      } catch (err) {
        console.error('Error al cargar datos:', err);
        showNotification('Error al cargar la biblioteca de documentos', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [pagination.currentPage, pagination.itemsPerPage, showNotification]);

  // Filtrar documentos
  useEffect(() => {
    const applyFilters = async () => {
      try {
        setLoading(true);
        
        // Construir parámetros de filtro
        const params = {
          page: 1, // Resetear a primera página al filtrar
          limit: pagination.itemsPerPage,
          search: searchTerm || undefined,
          category_id: selectedCategory || undefined,
          min_degree: selectedDegree || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined
        };
        
        // Filtrar desde el servidor
        const response = await libraryService.getDocuments(params);
        
        setFilteredDocuments(response.data.results || []);
        
        // Actualizar información de paginación
        setPagination({
          ...pagination,
          currentPage: 1,
          totalPages: Math.ceil(response.data.count / pagination.itemsPerPage),
          totalItems: response.data.count
        });
      } catch (err) {
        console.error('Error al filtrar documentos:', err);
        showNotification('Error al filtrar documentos', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    // Solo aplicar filtros si hay algún filtro activo
    if (searchTerm || selectedCategory || selectedDegree || dateFrom || dateTo) {
      applyFilters();
    } else if (documents.length > 0) {
      // Si no hay filtros, mostrar todos los documentos cargados
      setFilteredDocuments(documents);
    }
  }, [searchTerm, selectedCategory, selectedDegree, dateFrom, dateTo, pagination.itemsPerPage, showNotification]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleDegreeFilter = (e) => {
    setSelectedDegree(e.target.value);
  };

  const handleDateFromChange = (e) => {
    setDateFrom(e.target.value);
  };

  const handleDateToChange = (e) => {
    setDateTo(e.target.value);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDegree('');
    setDateFrom('');
    setDateTo('');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({
        ...pagination,
        currentPage: newPage
      });
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setPagination({
      ...pagination,
      itemsPerPage: newItemsPerPage,
      currentPage: 1 // Resetear a primera página
    });
  };

  const handleViewDocument = (documentId) => {
    navigate(`/library/documents/detail/${documentId}`);
  };

  const handleEditDocument = (documentId) => {
    navigate(`/library/documents/edit/${documentId}`);
  };

  const handleAddDocument = () => {
    navigate('/library/documents/new');
  };

  const handleDownloadDocument = async (documentId) => {
    try {
      setLoading(true);
      const response = await libraryService.downloadDocument(documentId);
      
      // Crear URL para el blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener nombre del documento
      const document = documents.find(doc => doc.id === documentId);
      const fileName = document ? document.file_name : `document-${documentId}.pdf`;
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showNotification('Documento descargado correctamente', 'success');
    } catch (err) {
      console.error('Error al descargar documento:', err);
      showNotification('Error al descargar el documento', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este documento? Esta acción no se puede deshacer.')) {
      try {
        await libraryService.deleteDocument(documentId);
        
        // Actualizar lista de documentos
        setDocuments(documents.filter(doc => doc.id !== documentId));
        setFilteredDocuments(filteredDocuments.filter(doc => doc.id !== documentId));
        
        showNotification('Documento eliminado correctamente', 'success');
      } catch (err) {
        console.error('Error al eliminar documento:', err);
        showNotification('Error al eliminar el documento', 'error');
      }
    }
  };

  // Función para obtener el nombre de la categoría
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Sin categoría';
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Función para obtener el nombre del grado
  const getDegreeName = (degree) => {
    switch (degree) {
      case 1:
        return 'Aprendiz';
      case 2:
        return 'Compañero';
      case 3:
        return 'Maestro';
      case 0:
        return 'Todos';
      default:
        return 'Desconocido';
    }
  };

  // Función para obtener el icono según el tipo de archivo
  const getFileIcon = (fileName) => {
    if (!fileName) return 'document';
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'word';
      case 'xls':
      case 'xlsx':
        return 'excel';
      case 'ppt':
      case 'pptx':
        return 'powerpoint';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'zip':
      case 'rar':
        return 'archive';
      default:
        return 'document';
    }
  };

  // Renderizar icono de archivo
  const renderFileIcon = (fileName) => {
    const iconType = getFileIcon(fileName);
    
    switch (iconType) {
      case 'pdf':
        return (
          <svg className="h-10 w-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'word':
        return (
          <svg className="h-10 w-10 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'excel':
        return (
          <svg className="h-10 w-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'powerpoint':
        return (
          <svg className="h-10 w-10 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'image':
        return (
          <svg className="h-10 w-10 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      case 'archive':
        return (
          <svg className="h-10 w-10 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
            <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="h-10 w-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (loading && documents.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Biblioteca de Documentos</h1>
        <button
          onClick={handleAddDocument}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Documento
        </button>
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Título, descripción, autor..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={handleCategoryFilter}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">
              Grado Mínimo
            </label>
            <select
              id="degree"
              value={selectedDegree}
              onChange={handleDegreeFilter}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Todos los grados</option>
              <option value="0">Público</option>
              <option value="1">Aprendiz</option>
              <option value="2">Compañero</option>
              <option value="3">Maestro</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              id="dateFrom"
              value={dateFrom}
              onChange={handleDateFromChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              id="dateTo"
              value={dateTo}
              onChange={handleDateToChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>
      
      {/* Lista de documentos */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredDocuments.map(document => (
              <div key={document.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {renderFileIcon(document.file_name)}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900 truncate" title={document.title}>
                        {document.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 truncate" title={document.description}>
                        {document.description || 'Sin descripción'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getCategoryName(document.category_id)}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {getDegreeName(document.min_degree)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>Subido: {formatDate(document.upload_date)}</span>
                      <span>Por: {document.uploaded_by || 'Desconocido'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDocument(document.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(document.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Descargar
                      </button>
                    </div>
                    
                    {(currentUser.is_admin || currentUser.office === 'Secretario' || currentUser.office === 'Venerable Maestro') && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditDocument(document.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-blue-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(document.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron documentos</h3>
            <p className="mt-1 text-sm text-gray-500">
              {loading ? 'Cargando documentos...' : 'No hay documentos que coincidan con los filtros seleccionados.'}
            </p>
            {!loading && (
              <div className="mt-6">
                <button
                  onClick={handleAddDocument}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Subir Nuevo Documento
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Paginación */}
        {filteredDocuments.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-2">
                  Mostrar
                </span>
                <select
                  value={pagination.itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="mr-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-sm text-gray-700">
                  de {pagination.totalItems} resultados
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    pagination.currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  &laquo;
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    pagination.currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  &lsaquo;
                </button>
                
                <span className="text-sm text-gray-700">
                  Página {pagination.currentPage} de {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-3 py-1 rounded-md ${
                    pagination.currentPage === pagination.totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  &rsaquo;
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-3 py-1 rounded-md ${
                    pagination.currentPage === pagination.totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  &raquo;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsList;
