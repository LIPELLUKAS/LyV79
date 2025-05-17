import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { libraryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const LibraryPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  
  // Estados para datos
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  
  // Cargar categorías al iniciar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await libraryService.getCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Error al cargar categorías:', err);
        showNotification('Error al cargar categorías', 'error');
        
        // Cargar datos de respaldo en caso de error
        setCategories([
          { id: 1, name: 'Rituales', count: 12 },
          { id: 2, name: 'Historia', count: 8 },
          { id: 3, name: 'Simbolismo', count: 15 },
          { id: 4, name: 'Trabajos', count: 24 },
          { id: 5, name: 'Administrativo', count: 6 },
        ]);
      }
    };
    
    fetchCategories();
  }, [showNotification]);
  
  // Cargar documentos con filtros y paginación
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        
        // Construir parámetros de consulta
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm || undefined,
          category: selectedCategory || undefined,
          grade: selectedGrade || undefined,
          date_filter: selectedDate || undefined
        };
        
        const response = await libraryService.getDocuments(params);
        
        setDocuments(response.data.results || []);
        setTotalDocuments(response.data.count || 0);
        setTotalPages(Math.ceil((response.data.count || 0) / itemsPerPage));
      } catch (err) {
        console.error('Error al cargar documentos:', err);
        showNotification('Error al cargar documentos', 'error');
        
        // Cargar datos de respaldo en caso de error
        setDocuments([
          { id: 1, title: 'Ritual del Primer Grado', category: 'Rituales', grade: 'Aprendiz', author: 'Gran Logia', date: '15/01/2025', downloads: 42 },
          { id: 2, title: 'Historia de la Masonería', category: 'Historia', grade: 'Todos', author: 'Carlos Rodríguez', date: '10/02/2025', downloads: 35 },
          { id: 3, title: 'Simbolismo del Templo', category: 'Simbolismo', grade: 'Maestro', author: 'Juan Pérez', date: '05/03/2025', downloads: 28 },
          { id: 4, title: 'Plancha sobre la Tolerancia', category: 'Trabajos', grade: 'Compañero', author: 'Miguel González', date: '20/04/2025', downloads: 15 },
          { id: 5, title: 'Reglamento Interno', category: 'Administrativo', grade: 'Todos', author: 'Secretaría', date: '01/05/2025', downloads: 50 },
        ]);
        setTotalDocuments(65);
        setTotalPages(13);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [currentPage, itemsPerPage, searchTerm, selectedCategory, selectedGrade, selectedDate, showNotification]);
  
  // Manejadores de eventos
  const handleSearch = () => {
    setCurrentPage(1); // Resetear a primera página al buscar
  };
  
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId);
    setCurrentPage(1);
  };
  
  const handleGradeChange = (e) => {
    setSelectedGrade(e.target.value);
  };
  
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  
  const handleApplyFilters = () => {
    setCurrentPage(1);
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handleViewDocument = (documentId) => {
    navigate(`/library/document/${documentId}`);
  };
  
  const handleDownloadDocument = async (documentId) => {
    try {
      const response = await libraryService.downloadDocument(documentId);
      
      // Crear un enlace temporal para la descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener nombre del archivo de los headers o usar un nombre por defecto
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'documento.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Actualizar contador de descargas en la UI
      setDocuments(documents.map(doc => 
        doc.id === documentId 
          ? { ...doc, downloads: doc.downloads + 1 } 
          : doc
      ));
      
      showNotification('Documento descargado correctamente', 'success');
    } catch (err) {
      console.error('Error al descargar documento:', err);
      showNotification('Error al descargar el documento', 'error');
    }
  };
  
  const handleUploadDocument = () => {
    navigate('/library/upload');
  };
  
  // Calcular rango de documentos mostrados
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalDocuments);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Biblioteca Digital</h1>
        <button 
          className="btn btn-primary"
          onClick={handleUploadDocument}
        >
          Subir Documento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de categorías */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Categorías</h3>
            </div>
            <div className="divide-y divide-gray-200">
              <button 
                className={`w-full px-4 py-4 text-left hover:bg-gray-50 ${
                  !selectedCategory ? 'bg-indigo-50' : ''
                }`}
                onClick={() => handleCategorySelect('')}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${!selectedCategory ? 'text-masonic-blue' : 'text-gray-700'}`}>
                    Todos
                  </span>
                  <span className="text-sm text-gray-500">{totalDocuments}</span>
                </div>
              </button>
              {categories.map((category) => (
                <button 
                  key={category.id} 
                  className={`w-full px-4 py-4 text-left hover:bg-gray-50 ${
                    selectedCategory === category.id ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${
                      selectedCategory === category.id ? 'text-masonic-blue' : 'text-gray-700'
                    }`}>
                      {category.name}
                    </span>
                    <span className="text-sm text-gray-500">{category.count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filtros */}
          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Filtros</h3>
            </div>
            <div className="px-4 py-5 sm:p-6 space-y-4">
              <div>
                <label htmlFor="grade" className="label">Grado</label>
                <select 
                  id="grade" 
                  className="input"
                  value={selectedGrade}
                  onChange={handleGradeChange}
                >
                  <option value="">Todos</option>
                  <option value="aprendiz">Aprendiz</option>
                  <option value="companero">Compañero</option>
                  <option value="maestro">Maestro</option>
                </select>
              </div>
              <div>
                <label htmlFor="date" className="label">Fecha</label>
                <select 
                  id="date" 
                  className="input"
                  value={selectedDate}
                  onChange={handleDateChange}
                >
                  <option value="">Cualquier fecha</option>
                  <option value="week">Última semana</option>
                  <option value="month">Último mes</option>
                  <option value="year">Último año</option>
                </select>
              </div>
              <button 
                className="btn btn-secondary w-full"
                onClick={handleApplyFilters}
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de documentos */}
        <div className="lg:col-span-3 space-y-4">
          {/* Buscador */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex">
              <input
                type="text"
                className="input flex-grow"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                className="btn btn-primary ml-2"
                onClick={handleSearch}
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Estado de carga */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {/* Mensaje si no hay resultados */}
          {!loading && documents.length === 0 && (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">No se encontraron documentos que coincidan con los criterios de búsqueda.</p>
            </div>
          )}

          {/* Documentos */}
          {!loading && documents.map((document) => (
            <div key={document.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{document.title}</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {document.category} • Grado: {document.grade} • Subido el {document.date}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {document.downloads} descargas
                </div>
              </div>
              <div className="px-4 py-4 sm:px-6 bg-gray-50 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Autor: {document.author}
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="btn btn-secondary text-sm"
                    onClick={() => handleViewDocument(document.id)}
                  >
                    Ver
                  </button>
                  <button 
                    className="btn btn-primary text-sm"
                    onClick={() => handleDownloadDocument(document.id)}
                  >
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Paginación */}
          {!loading && documents.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{startIndex}</span> a <span className="font-medium">{endIndex}</span> de <span className="font-medium">{totalDocuments}</span> resultados
              </div>
              <div className="flex space-x-2">
                <button 
                  className={`btn bg-white border border-gray-300 text-gray-700 ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
                <button 
                  className={`btn bg-white border border-gray-300 text-gray-700 ${
                    currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
