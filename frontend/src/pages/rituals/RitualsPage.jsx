import React from 'react';

const RitualsPage = () => {
  // Datos simulados para la página de rituales
  const upcomingRituals = [
    { id: 1, title: 'Tenida Regular', date: '20/05/2025', time: '19:00', grade: 'Maestro', status: 'Confirmado' },
    { id: 2, title: 'Iniciación', date: '27/05/2025', time: '18:00', grade: 'Aprendiz', status: 'Pendiente' },
    { id: 3, title: 'Aumento de Salario', date: '10/06/2025', time: '19:00', grade: 'Compañero', status: 'Planificado' },
  ];

  const ritualRoles = [
    { id: 1, ritual: 'Tenida Regular', date: '20/05/2025', role: 'Venerable Maestro', member: 'Juan Pérez', status: 'Confirmado' },
    { id: 2, ritual: 'Tenida Regular', date: '20/05/2025', role: 'Primer Vigilante', member: 'Carlos Rodríguez', status: 'Confirmado' },
    { id: 3, ritual: 'Tenida Regular', date: '20/05/2025', role: 'Segundo Vigilante', member: 'Miguel González', status: 'Pendiente' },
    { id: 4, ritual: 'Tenida Regular', date: '20/05/2025', role: 'Orador', member: 'Roberto Sánchez', status: 'Confirmado' },
    { id: 5, ritual: 'Tenida Regular', date: '20/05/2025', role: 'Secretario', member: 'Fernando López', status: 'Confirmado' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Planificación Ritual</h1>
        <button className="btn btn-primary">
          Programar Ritual
        </button>
      </div>

      {/* Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button className="border-masonic-blue text-masonic-blue whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            Próximos Rituales
          </button>
          <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            Asignación de Roles
          </button>
          <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            Calendario
          </button>
        </nav>
      </div>

      {/* Próximos Rituales */}
      <div className="space-y-4">
        {upcomingRituals.map((ritual) => (
          <div key={ritual.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">{ritual.title}</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {ritual.date} • {ritual.time} • Grado: {ritual.grade}
                </p>
              </div>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                ritual.status === 'Confirmado' ? 'bg-green-100 text-green-800' : 
                ritual.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-blue-100 text-blue-800'
              }`}>
                {ritual.status}
              </span>
            </div>
            <div className="px-4 py-4 sm:px-6 bg-gray-50 flex justify-end space-x-3">
              <button className="text-masonic-blue hover:text-blue-900 text-sm font-medium">
                Ver Detalles
              </button>
              <button className="text-masonic-blue hover:text-blue-900 text-sm font-medium">
                Editar
              </button>
              <button className="text-masonic-blue hover:text-blue-900 text-sm font-medium">
                Confirmar Asistencia
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Asignación de Roles (oculto por defecto) */}
      <div className="hidden">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ritual
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miembro
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ritualRoles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{role.ritual}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{role.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{role.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{role.member}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      role.status === 'Confirmado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {role.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-masonic-blue hover:text-blue-900 mr-3">Cambiar</button>
                    <button className="text-masonic-blue hover:text-blue-900">Confirmar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calendario (oculto por defecto) */}
      <div className="hidden">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Mayo 2025</h2>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            <div className="text-sm font-medium text-gray-500">Lun</div>
            <div className="text-sm font-medium text-gray-500">Mar</div>
            <div className="text-sm font-medium text-gray-500">Mié</div>
            <div className="text-sm font-medium text-gray-500">Jue</div>
            <div className="text-sm font-medium text-gray-500">Vie</div>
            <div className="text-sm font-medium text-gray-500">Sáb</div>
            <div className="text-sm font-medium text-gray-500">Dom</div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {/* Días del calendario (simplificado) */}
            {Array.from({ length: 31 }, (_, i) => (
              <div 
                key={i} 
                className={`py-2 ${
                  i + 1 === 20 ? 'bg-masonic-blue text-white rounded-md' : 'hover:bg-gray-100 rounded-md'
                }`}
              >
                {i + 1}
                {i + 1 === 20 && <div className="text-xs mt-1">Tenida</div>}
                {i + 1 === 27 && <div className="text-xs mt-1 text-masonic-blue">Iniciación</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RitualsPage;
