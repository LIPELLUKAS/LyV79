import React from 'react';

const LibraryPage = () => {
  // Datos simulados para la página de biblioteca
  const documents = [
    { id: 1, title: 'Ritual del Primer Grado', category: 'Rituales', grade: 'Aprendiz', author: 'Gran Logia', date: '15/01/2025', downloads: 42 },
    { id: 2, title: 'Historia de la Masonería', category: 'Historia', grade: 'Todos', author: 'Carlos Rodríguez', date: '10/02/2025', downloads: 35 },
    { id: 3, title: 'Simbolismo del Templo', category: 'Simbolismo', grade: 'Maestro', author: 'Juan Pérez', date: '05/03/2025', downloads: 28 },
    { id: 4, title: 'Plancha sobre la Tolerancia', category: 'Trabajos', grade: 'Compañero', author: 'Miguel González', date: '20/04/2025', downloads: 15 },
    { id: 5, title: 'Reglamento Interno', category: 'Administrativo', grade: 'Todos', author: 'Secretaría', date: '01/05/2025', downloads: 50 },
  ];

  const categories = [
    { id: 1, name: 'Rituales', count: 12 },
    { id: 2, name: 'Historia', count: 8 },
    { id: 3, name: 'Simbolismo', count: 15 },
    { id: 4, name: 'Trabajos', count: 24 },
    { id: 5, name: 'Administrativo', count: 6 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Biblioteca Digital</h1>
        <button className="btn btn-primary">
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
              <button className="w-full px-4 py-4 text-left hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-masonic-blue">Todos</span>
                  <span className="text-sm text-gray-500">65</span>
                </div>
              </button>
              {categories.map((category) => (
                <button key={category.id} className="w-full px-4 py-4 text-left hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
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
                <select id="grade" className="input">
                  <option value="">Todos</option>
                  <option value="aprendiz">Aprendiz</option>
                  <option value="companero">Compañero</option>
                  <option value="maestro">Maestro</option>
                </select>
              </div>
              <div>
                <label htmlFor="date" className="label">Fecha</label>
                <select id="date" className="input">
                  <option value="">Cualquier fecha</option>
                  <option value="week">Última semana</option>
                  <option value="month">Último mes</option>
                  <option value="year">Último año</option>
                </select>
              </div>
              <button className="btn btn-secondary w-full">
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
              />
              <button className="btn btn-primary ml-2">
                Buscar
              </button>
            </div>
          </div>

          {/* Documentos */}
          {documents.map((document) => (
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
                  <button className="btn btn-secondary text-sm">
                    Ver
                  </button>
                  <button className="btn btn-primary text-sm">
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Paginación */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">1</span> a <span className="font-medium">5</span> de <span className="font-medium">65</span> resultados
            </div>
            <div className="flex space-x-2">
              <button className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                Anterior
              </button>
              <button className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
