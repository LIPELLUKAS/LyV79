import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Componentes
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';
import Tabs from '../../components/Tabs';

const LibraryList = () => {
  const [activeTab, setActiveTab] = useState('books');
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const endpoint = `/api/library/${activeTab}/?search=${searchTerm}${selectedCategory ? `&category=${selectedCategory}` : ''}`;
        const response = await axios.get(endpoint);
        setItems(response.data);
        setError(null);
      } catch (err) {
        setError(`Error al cargar los ${activeTab === 'books' ? 'libros' : 'documentos'}. Por favor, intente nuevamente.`);
        console.error('Error fetching library items:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`/api/library/categories/?type=${activeTab}`);
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchItems();
    fetchCategories();
  }, [activeTab, searchTerm, selectedCategory]);

  const tabs = [
    { id: 'books', label: 'Libros' },
    { id: 'documents', label: 'Documentos' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // La búsqueda se realiza automáticamente por el efecto
  };

  const renderBooksList = () => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No se encontraron libros</p>
          <Button
            label="Añadir Libro"
            variant="primary"
            className="mt-4"
            as={Link}
            to="/library/books/new"
          />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(book => (
          <div key={book.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            {book.cover_image && (
              <div className="h-48 overflow-hidden">
                <img 
                  src={book.cover_image} 
                  alt={book.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold">{book.title}</h3>
              <p className="text-sm text-gray-500">
                {book.author}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {book.categories && book.categories.map(category => (
                  <span key={category} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {category}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-gray-700 line-clamp-2">{book.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <Link 
                  to={`/library/books/${book.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Ver detalles
                </Link>
                <span className={`px-2 py-1 text-xs rounded ${
                  book.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {book.available ? 'Disponible' : 'Prestado'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDocumentsList = () => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No se encontraron documentos</p>
          <Button
            label="Añadir Documento"
            variant="primary"
            className="mt-4"
            as={Link}
            to="/library/documents/new"
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map(document => (
          <div key={document.id} className="bg-white shadow-md rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{document.title}</h3>
                <p className="text-sm text-gray-500">
                  Subido el {new Date(document.upload_date).toLocaleDateString()} por {document.uploaded_by}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {document.categories && document.categories.map(category => (
                    <span key={category} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <Link 
                  to={`/library/documents/${document.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Ver
                </Link>
                <a 
                  href={document.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800"
                >
                  Descargar
                </a>
              </div>
            </div>
            <p className="mt-2 text-gray-700 line-clamp-2">{document.description}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      <PageHeader title="Biblioteca" />
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
        <h2 className="text-xl font-semibold">
          {activeTab === 'books' ? 'Libros' : 'Documentos'}
        </h2>
        
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <Button
              type="submit"
              label="Buscar"
              variant="secondary"
            />
          </form>
          
          <Button
            label={activeTab === 'books' ? 'Añadir Libro' : 'Añadir Documento'}
            icon="plus"
            variant="primary"
            as={Link}
            to={activeTab === 'books' ? '/library/books/new' : '/library/documents/new'}
          />
        </div>
      </div>
      
      {loading ? (
        <Loading />
      ) : (
        activeTab === 'books' ? renderBooksList() : renderDocumentsList()
      )}
    </div>
  );
};

export default LibraryList;
