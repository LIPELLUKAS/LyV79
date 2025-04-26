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
        setCategories(response.data);
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
  
  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    // La búsqueda ya se maneja en el useEffect
  };
  
  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    setSearchParams(prev => ({
      ...prev,
      page: newPage
    }));
  };
  
  // Manejar eliminación de documento
  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.')) {
      try {
        await libraryService.deleteDocument(documentId);
        showNotification('Documento eliminado correctamente', 'success');
        
        // Actualizar la lista de documentos
        setDocuments(documents.filter(doc => doc.id !== documentId));
        setTotalDocuments(prev => prev - 1);
      } catch (error) {
        console.error('Error al eliminar el documento:', error);
        showNotification('Error al eliminar el documento', 'error');
      }
    }
  };
  
  // Renderizar badge de tipo de documento
  const renderDocumentTypeBadge = (type) => {
    switch (type) {
      case 'book':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Libro
          </span>
        );
      case 'article':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Artículo
          </span>
        );
      case 'lecture':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Plancha
          </span>
        );
      case 'ritual':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Ritual
          </span>
        );
      case 'constitution':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Constitución
          </span>
        );
      case 'regulation':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            Reglamento
          </span>
        );
      case 'history':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
            Historia
          </span>
        );
      case 'symbolism':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
            Simbolismo
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Otro
          </span>
        );
    }
  };
  
  // Renderizar badge de grado requerido
  const renderRequiredDegreeBadge = (degree) => {
    switch (degree) {
      case 1:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Aprendiz
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Compañero
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Maestro
          </span>
        );
      default:
        return null;
    }
  };
  
  // Renderizar estrellas para calificación
  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        
        {hasHalfStar && (
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half-star-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path fill="url(#half-star-gradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        
        <span className="ml-1 text-sm text-gray-500">({rating.toFixed(1)})</span>
      </div>
    );
  };
  
  // Calcular número total de páginas
  const totalPages = Math.ceil(totalDocuments / searchParams.limit);
  
  if (loading && documents.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center">
            <button
              onClick={() => navigate('/library')}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Documentos de la Biblioteca</h1>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {totalDocuments} documentos encontrados
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          {currentUser.degree === 3 && (
            <Link
              to="/library/documents/new"
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Subir documento
            </Link>
          )}
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Filtros</h3>
            <p className="mt-1 text-sm text-gray-500">
              Utiliza estos filtros para encontrar documentos específicos.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-1">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                    Buscar
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="search"
                      id="search"
                      value={searchParams.search}
                      onChange={handleFilterChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Título, descripción, autor o etiquetas"
                    />
                  </div>
                </div>
                <div className="col-span-1">
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
                      <option value="">Todas</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-span-1">
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
                      <option value="">Todos</option>
                      <option value="book">Libro</option>
                      <option value="article">Artículo</option>
                      <option value="lecture">Plancha</option>
                      <option value="ritual">Ritual</option>
                      <option value="constitution">Constitución</option>
                      <option value="regulation">Reglamento</option>
                      <option value="history">Historia</option>
                      <option value="symbolism">Simbolismo</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                </div>
                <div className="col-span-1">
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
                      <option value="1">Aprendiz (1°)</option>
                      <option value="2">Compañero (2°)</option>
                      <option value="3">Maestro (3°)</option>
                    </select>
                  </div>
                </div>
                <div className="col-span-1">
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
                      id="order_by
(Content truncated due to size limit. Use line ranges to read in chunks)