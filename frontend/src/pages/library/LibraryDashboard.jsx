import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { libraryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const LibraryDashboard = () => {
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalCategories: 0,
    featuredDocuments: [],
    recentDocuments: [],
    popularDocuments: [],
    topCategories: []
  });
  
  useEffect(() => {
    const fetchLibraryStats = async () => {
      try {
        setLoading(true);
        
        // Obtener documentos destacados
        const featuredResponse = await libraryService.getDocuments({ is_featured: true, limit: 5 });
        
        // Obtener documentos recientes
        const recentResponse = await libraryService.getDocuments({ order_by: '-created_at', limit: 5 });
        
        // Obtener documentos populares (más vistos)
        const popularResponse = await libraryService.getDocuments({ order_by: '-view_count', limit: 5 });
        
        // Obtener categorías principales
        const categoriesResponse = await libraryService.getCategories({ parent_id: 'null' });
        
        // Obtener estadísticas generales
        const statsResponse = await libraryService.getLibraryStats();
        
        setStats({
          totalDocuments: statsResponse.data.total_documents || 0,
          totalCategories: statsResponse.data.total_categories || 0,
          featuredDocuments: featuredResponse.data.results || [],
          recentDocuments: recentResponse.data.results || [],
          popularDocuments: popularResponse.data.results || [],
          topCategories: categoriesResponse.data || []
        });
      } catch (error) {
        console.error('Error al cargar estadísticas de la biblioteca:', error);
        showNotification('Error al cargar estadísticas de la biblioteca', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLibraryStats();
  }, [showNotification]);
  
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
  
  // Renderizar documento en tarjeta
  const renderDocumentCard = (document) => (
    <div key={document.id} className="flex flex-col rounded-lg shadow-lg overflow-hidden">
      <div className="flex-shrink-0 h-48 bg-gray-200 flex items-center justify-center">
        {document.document_type === 'book' && (
          <svg className="h-24 w-24 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )}
        {document.document_type === 'article' && (
          <svg className="h-24 w-24 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        )}
        {document.document_type === 'lecture' && (
          <svg className="h-24 w-24 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        {document.document_type === 'ritual' && (
          <svg className="h-24 w-24 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        )}
        {!['book', 'article', 'lecture', 'ritual'].includes(document.document_type) && (
          <svg className="h-24 w-24 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm font-medium text-indigo-600">
                {document.category_name}
              </p>
              <Link to={`/library/documents/${document.id}`} className="block mt-2">
                <p className="text-xl font-semibold text-gray-900">{document.title}</p>
              </Link>
            </div>
            {document.is_featured && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Destacado
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center space-x-2">
            {renderDocumentTypeBadge(document.document_type)}
            {renderRequiredDegreeBadge(document.required_degree)}
          </div>
          <p className="mt-3 text-base text-gray-500 line-clamp-2">{document.description}</p>
        </div>
        <div className="mt-6 flex items-center">
          <div className="flex-shrink-0">
            <span className="sr-only">{document.uploaded_by_name}</span>
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              {document.uploaded_by_name ? document.uploaded_by_name.charAt(0).toUpperCase() : '?'}
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {document.uploaded_by_name || 'Usuario desconocido'}
            </p>
            <div className="flex space-x-1 text-sm text-gray-500">
              <time dateTime={document.created_at}>
                {new Date(document.created_at).toLocaleDateString()}
              </time>
              <span aria-hidden="true">&middot;</span>
              <span>{document.view_count} vistas</span>
            </div>
          </div>
          <div className="ml-auto">
            {renderRatingStars(document.average_rating)}
          </div>
        </div>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Biblioteca Digital</h1>
          <p className="mt-2 text-lg text-gray-600">
            Explora nuestra colección de documentos masónicos
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Link
            to="/library/categories"
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Ver categorías
          </Link>
          <Link
            to="/library/documents"
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Explorar documentos
          </Link>
          {currentUser.degree === 3 && (
            <Link
              to="/library/documents/new"
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Subir documento
            </Link>
          )}
        </div>
      </div>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de documentos
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.totalDocuments}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de categorías
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.totalCategories}
      
(Content truncated due to size limit. Use line ranges to read in chunks)