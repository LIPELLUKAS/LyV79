import React from 'react';

const MembersPage = () => {
  // Datos simulados para la página de miembros
  const members = [
    { id: 1, name: 'Juan Pérez', grade: 'Maestro Masón', lodge: 'Luz y Verdad #79', status: 'Activo', lastPayment: '01/05/2025' },
    { id: 2, name: 'Carlos Rodríguez', grade: 'Compañero', lodge: 'Luz y Verdad #79', status: 'Activo', lastPayment: '01/05/2025' },
    { id: 3, name: 'Miguel González', grade: 'Aprendiz', lodge: 'Luz y Verdad #79', status: 'Activo', lastPayment: '01/05/2025' },
    { id: 4, name: 'Roberto Sánchez', grade: 'Maestro Masón', lodge: 'Luz y Verdad #79', status: 'Inactivo', lastPayment: '01/02/2025' },
    { id: 5, name: 'Fernando López', grade: 'Maestro Masón', lodge: 'Luz y Verdad #79', status: 'Activo', lastPayment: '01/05/2025' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Miembros</h1>
        <button className="btn btn-primary">
          Nuevo Miembro
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="search" className="label">Buscar</label>
            <input
              type="text"
              id="search"
              className="input"
              placeholder="Nombre, grado, etc."
            />
          </div>
          <div>
            <label htmlFor="grade" className="label">Grado</label>
            <select id="grade" className="input">
              <option value="">Todos</option>
              <option value="aprendiz">Aprendiz</option>
              <option value="companero">Compañero</option>
              <option value="maestro">Maestro Masón</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="label">Estado</label>
            <select id="status" className="input">
              <option value="">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="btn btn-secondary w-full">
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Miembros */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Logia
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Pago
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-masonic-blue flex items-center justify-center text-white">
                      {member.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{member.grade}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{member.lodge}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    member.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.lastPayment}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-masonic-blue hover:text-blue-900 mr-3">Ver</button>
                  <button className="text-masonic-blue hover:text-blue-900 mr-3">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Mostrando <span className="font-medium">1</span> a <span className="font-medium">5</span> de <span className="font-medium">5</span> resultados
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
  );
};

export default MembersPage;
