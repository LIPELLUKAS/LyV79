import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { libraryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
const DocumentList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [categories, setCategories] = useState([]);
  
  // Parámetros de búsqueda y paginación
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 12,
    search: '',
    category_id: new URLSearchParams(location.search).get('category_id') || '',
    document_type: '',
    required_degree: '',
    is_featured: '',
    order_by: '-created_at'
  });
  
  // Cargar documentos
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await libraryService.getDocuments(searchParams);
        setDocuments(response.data.results || []);
        setTotalDocuments(response.data.count || 0);
      } catch (error) {
        console.error('Error al cargar documentos:', error);
        showNotification('Error al cargar documentos', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [searchParams, showNotification]);
  
  // Cargar categorías para el filtro
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await libraryService.getCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Resetear a la primera página cuando cambian los filtros
    }));
  };
  
  // Manejar cambios en la búsqueda
  const handleSearchChange = (e) => {
    setSearchParams(prev => ({
      ...prev,
      search: e.target.value,
      page: 1
    }));
  };
  
  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    setSearchParams(prev => ({
      ...prev,
      page: newPage
    }));
  };
  
  // Calcular número total de páginas
  const totalPages = Math.ceil(totalDocuments / searchParams.limit);
  
  // Renderizar tipo de documento
  const renderDocumentType = (type) => {
    switch (type) {
      case 'article':
        return 'Artículo';
      case 'book':
        return 'Libro';
      case 'ritual':
        return 'Ritual';
      case 'lecture':
        return 'Conferencia';
      case 'research':
        return 'Investigación';
      default:
        return 'Otro';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biblioteca</h1>
          <p className="mt-1 text-sm text-gray-500">
            Explora y gestiona documentos masónicos
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Link
            to="/library/documents/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Nuevo documento
          </Link>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Buscar
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex items-stretch flex-grow focus-within:z-10">
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={searchParams.search}
                    onChange={handleSearchChange}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300"
                    placeholder="Título, autor, contenido..."
                  />
                </div>
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                Categoría
              </label>
              <div className="mt-1">
                <select
                  id="category_id"
                  name="category_id"
                  value={searchParams.category_id}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="document_type" className="block text-sm font-medium text-gray-700">
                Tipo de documento
              </label>
              <div className="mt-1">
                <select
                  id="document_type"
                  name="document_type"
                  value={searchParams.document_type}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Todos los tipos</option>
                  <option value="article">Artículo</option>
                  <option value="book">Libro</option>
                  <option value="ritual">Ritual</option>
                  <option value="lecture">Conferencia</option>
                  <option value="research">Investigación</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>
            
            <div className="sm:col-span-1">
              <label htmlFor="required_degree" className="block text-sm font-medium text-gray-700">
                Grado requerido
              </label>
              <div className="mt-1">
                <select
                  id="required_degree"
                  name="required_degree"
                  value={searchParams.required_degree}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Todos</option>
                  <option value="1">1° Aprendiz</option>
                  <option value="2">2° Compañero</option>
                  <option value="3">3° Maestro</option>
                </select>
              </div>
            </div>
            
            <div className="sm:col-span-1">
              <label htmlFor="is_featured" className="block text-sm font-medium text-gray-700">
                Destacados
              </label>
              <div className="mt-1">
                <select
                  id="is_featured"
                  name="is_featured"
                  value={searchParams.is_featured}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Todos</option>
                  <option value="true">Solo destacados</option>
                  <option value="false">No destacados</option>
                </select>
              </div>
            </div>
            <div className="col-span-1">
              <label htmlFor="order_by" className="block text-sm font-medium text-gray-700">
                Ordenar por
              </label>
              <div className="mt-1">
                <select
                  id="order_by"
                  name="order_by"
                  value={searchParams.order_by}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="-created_at">Más recientes</option>
                  <option value="created_at">Más antiguos</option>
                  <option value="title">Título (A-Z)</option>
                  <option value="-title">Título (Z-A)</option>
                  <option value="-view_count">Más vistos</option>
                  <option value="-download_count">Más descargados</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lista de documentos */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="bg-white overflow-hidden shadow rounded-lg flex flex-col"
            >
              <div className="px-4 py-5 sm:p-6 flex-grow">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {renderDocumentType(document.document_type)}
                  </span>
                  {document.is_featured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Destacado
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    <Link to={`/library/documents/${document.id}`} className="hover:underline">
                      {document.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                    {document.description || 'Sin descripción'}
                  </p>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{new Date(document.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                    </svg>
                    <span>{document.category_name || 'Sin categoría'}</span>
                  </div>
                  {document.required_degree > 0 && (
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>
                        Grado {document.required_degree}°
                        {document.required_degree === 1 && ' (Aprendiz)'}
                        {document.required_degree === 2 && ' (Compañero)'}
                        {document.required_degree === 3 && ' (Maestro)'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="flex justify-between">
                  <div className="text-sm">
                    <Link
                      to={`/library/documents/${document.id}`}
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Ver detalles
                    </Link>
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-gray-500">
                      {document.view_count || 0} vistas
                    </span>
                    <span className="text-gray-500">
                      {document.download_count || 0} descargas
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron documentos con los criterios de búsqueda actuales.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setSearchParams({
                page: 1,
                limit: 12,
                search: '',
                category_id: '',
                document_type: '',
                required_degree: '',
                is_featured: '',
                order_by: '-created_at'
              })}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(1, searchParams.page - 1))}
              disabled={searchParams.page === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                searchParams.page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, searchParams.page + 1))}
              disabled={searchParams.page === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                searchParams.page === totalPages
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
                Mostrando <span className="font-medium">{documents.length > 0 ? (searchParams.page - 1) * searchParams.limit + 1 : 0}</span> a{' '}
                <span className="font-medium">
                  {Math.min(searchParams.page * searchParams.limit, totalDocuments)}
                </span>{' '}
                de <span className="font-medium">{totalDocuments}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={searchParams.page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    searchParams.page === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Primera página</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => handlePageChange(searchParams.page - 1)}
                  disabled={searchParams.page === 1}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    searchParams.page === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Números de página */}
                {[...Array(totalPages).keys()].map((page) => {
                  const pageNumber = page + 1;
                  // Mostrar solo páginas cercanas a la actual
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= searchParams.page - 1 && pageNumber <= searchParams.page + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNumber === searchParams.page
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  
                  // Mostrar puntos suspensivos para páginas omitidas
                  if (
                    (pageNumber === 2 && searchParams.page > 3) ||
                    (pageNumber === totalPages - 1 && searchParams.page < totalPages - 2)
                  ) {
                    return (
                      <span
                        key={pageNumber}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }
                  
                  return null;
                })}
                
                <button
                  onClick={() => handlePageChange(searchParams.page + 1)}
                  disabled={searchParams.page === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    searchParams.page === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Siguiente</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={searchParams.page === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    searchParams.page === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Última página</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
