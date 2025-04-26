import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { libraryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const CategoryList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [parentCategory, setParentCategory] = useState(null);
  const [searchParams, setSearchParams] = useState({
    parent_id: new URLSearchParams(location.search).get('parent_id') || 'null',
    search: '',
    required_degree: ''
  });
  
  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Si hay un parent_id, cargar los detalles de la categoría padre
        if (searchParams.parent_id && searchParams.parent_id !== 'null') {
          const parentResponse = await libraryService.getCategoryById(searchParams.parent_id);
          setParentCategory(parentResponse.data);
        } else {
          setParentCategory(null);
        }
        
        // Cargar las categorías según los filtros
        const response = await libraryService.getCategories(searchParams);
        setCategories(response.data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        showNotification('Error al cargar categorías', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [searchParams, showNotification]);
  
  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    // La búsqueda ya se maneja en el useEffect
  };
  
  // Manejar eliminación de categoría
  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.')) {
      try {
        await libraryService.deleteCategory(categoryId);
        showNotification('Categoría eliminada correctamente', 'success');
        
        // Actualizar la lista de categorías
        setCategories(categories.filter(category => category.id !== categoryId));
      } catch (error) {
        console.error('Error al eliminar la categoría:', error);
        showNotification('Error al eliminar la categoría', 'error');
      }
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
  
  if (loading) {
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
            <h1 className="text-2xl font-bold text-gray-900">
              {parentCategory ? `Subcategorías de ${parentCategory.name}` : 'Categorías de la Biblioteca'}
            </h1>
          </div>
          {parentCategory && (
            <p className="mt-2 text-sm text-gray-500">
              <button 
                onClick={() => setSearchParams(prev => ({ ...prev, parent_id: 'null' }))}
                className="text-indigo-600 hover:text-indigo-500"
              >
                Categorías principales
              </button>
              {' > '}
              {parentCategory.name}
            </p>
          )}
        </div>
        <div className="mt-4 md:mt-0">
          {currentUser.degree === 3 && (
            <Link
              to={parentCategory ? `/library/categories/new?parent_id=${parentCategory.id}` : '/library/categories/new'}
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {parentCategory ? 'Añadir subcategoría' : 'Añadir categoría'}
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
              Utiliza estos filtros para encontrar categorías específicas.
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
                      placeholder="Nombre o descripción"
                    />
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
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSearchParams({
                    parent_id: searchParams.parent_id,
                    search: '',
                    required_degree: ''
                  })}
                  className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Limpiar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Lista de categorías */}
      {categories.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-md flex items-center justify-center">
                        <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                          <div className="ml-2">
                            {renderRequiredDegreeBadge(category.required_degree)}
                          </div>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {category.description || 'Sin descripción'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {category.documents_count} documentos
                      </span>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {category.subcategories_count} subcategorías
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div className="text-sm text-gray-500">
                      Creada por {category.created_by_name || 'Usuario desconocido'} el {new Date(category.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/library/categories/${category.id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver detalles
                      </button>
                      <button
                        onClick={() => navigate(`/library/categories?parent_id=${category.id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver subcategorías
                      </button>
                      {currentUser.degree === 3 && (
                        <>
                          <button
                            onClick={() => navigate(`/library/categories/${category.id}/edit`)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12 bg-white shadow sm:rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay categorías</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchParams.search || searchParams.required_degree
              ? 'No se encontraron categorías con los filtros aplicados.'
              : parentCategory
                ? 'Esta categoría no tiene subcategorías.'
                : 'No hay categorías en la biblioteca.'}
          </p>
          {currentUser.degree === 3 && (
            <div className="mt-6">
              <Link
                to={parentCategory ? `/library/categories/new?parent_id=${parentCategory.id}` : '/library/categories/new'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {parentCategory ? 'Añadir subcategoría' : 'Añadir categoría'}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryList;
