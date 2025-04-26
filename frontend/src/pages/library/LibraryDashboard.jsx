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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
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
        
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link
            to="/library/documents/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Nuevo documento
          </Link>
          <Link
            to="/library/categories/new"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Nueva categoría
          </Link>
        </div>
      </div>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/library/documents" className="font-medium text-indigo-600 hover:text-indigo-500">
                Ver todos los documentos
              </Link>
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
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/library/categories" className="font-medium text-indigo-600 hover:text-indigo-500">
                Ver todas las categorías
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Documentos destacados
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.featuredDocuments.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/library/documents?is_featured=true" className="font-medium text-indigo-600 hover:text-indigo-500">
                Ver documentos destacados
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Documentos más vistos
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.popularDocuments.length > 0 ? stats.popularDocuments[0].view_count || 0 : 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/library/documents?order_by=-view_count" className="font-medium text-indigo-600 hover:text-indigo-500">
                Ver documentos populares
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Documentos destacados */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Documentos destacados</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Documentos seleccionados por su relevancia</p>
          </div>
          <Link to="/library/documents?is_featured=true" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Ver todos
          </Link>
        </div>
        <div className="border-t border-gray-200">
          {stats.featuredDocuments.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {stats.featuredDocuments.map((document) => (
                <li key={document.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <Link to={`/library/documents/${document.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                          {document.title}
                        </Link>
                        <p className="text-sm text-gray-500">{renderDocumentType(document.document_type)}</p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {document.view_count || 0} vistas
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">No hay documentos destacados</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Documentos recientes y populares */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
        {/* Documentos recientes */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Documentos recientes</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Últimos documentos añadidos</p>
            </div>
            <Link to="/library/documents?order_by=-created_at" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Ver todos
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {stats.recentDocuments.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {stats.recentDocuments.map((document) => (
                  <li key={document.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <Link to={`/library/documents/${document.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                            {document.title}
                          </Link>
                          <p className="text-sm text-gray-500">{new Date(document.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">No hay documentos recientes</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Documentos populares */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Documentos populares</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Los más vistos por los miembros</p>
            </div>
            <Link to="/library/documents?order_by=-view_count" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Ver todos
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {stats.popularDocuments.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {stats.popularDocuments.map((document) => (
                  <li key={document.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <Link to={`/library/documents/${document.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                            {document.title}
                          </Link>
                          <p className="text-sm text-gray-500">{renderDocumentType(document.document_type)}</p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {document.view_count || 0} vistas
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">No hay documentos populares</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Categorías principales */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Categorías principales</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Explora documentos por categoría</p>
          </div>
          <Link to="/library/categories" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Ver todas
          </Link>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {stats.topCategories.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stats.topCategories.map((category) => (
                <div
                  key={category.id}
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <div className="flex-shrink-0">
                    <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/library/categories/${category.id}`} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {category.document_count} documentos
                      </p>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">No hay categorías disponibles</p>
              <div className="mt-4">
                <Link
                  to="/library/categories/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Crear categoría
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryDashboard;
