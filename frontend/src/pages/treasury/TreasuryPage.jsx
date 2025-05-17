import React from 'react';

const TreasuryPage = () => {
  // Datos simulados para la página de tesorería
  const transactions = [
    { id: 1, type: 'Ingreso', concept: 'Cuota mensual', member: 'Juan Pérez', amount: 50.00, date: '05/05/2025' },
    { id: 2, type: 'Ingreso', concept: 'Cuota mensual', member: 'Carlos Rodríguez', amount: 50.00, date: '03/05/2025' },
    { id: 3, type: 'Gasto', concept: 'Material de oficina', member: 'Tesorero', amount: -75.50, date: '01/05/2025' },
    { id: 4, type: 'Ingreso', concept: 'Donación', member: 'Fernando López', amount: 100.00, date: '28/04/2025' },
    { id: 5, type: 'Gasto', concept: 'Mantenimiento', member: 'Tesorero', amount: -120.00, date: '25/04/2025' },
  ];

  const stats = [
    { id: 1, name: 'Balance Actual', value: '$1,245.50' },
    { id: 2, name: 'Ingresos del Mes', value: '$450.00' },
    { id: 3, name: 'Gastos del Mes', value: '$195.50' },
    { id: 4, name: 'Cuotas Pendientes', value: '$400.00' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Tesorería</h1>
        <div className="flex space-x-2">
          <button className="btn btn-primary">
            Registrar Ingreso
          </button>
          <button className="btn btn-secondary">
            Registrar Gasto
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.id} className="dashboard-stat">
            <dt className="dashboard-stat-label">{stat.name}</dt>
            <dd className="dashboard-stat-value">{stat.value}</dd>
          </div>
        ))}
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
              placeholder="Concepto, miembro, etc."
            />
          </div>
          <div>
            <label htmlFor="type" className="label">Tipo</label>
            <select id="type" className="input">
              <option value="">Todos</option>
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
            </select>
          </div>
          <div>
            <label htmlFor="date" className="label">Fecha</label>
            <input
              type="date"
              id="date"
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button className="btn btn-secondary w-full">
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Transacciones */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Concepto
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Miembro
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    transaction.type === 'Ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{transaction.concept}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{transaction.member}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className={`text-sm font-medium ${
                    transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-masonic-blue hover:text-blue-900 mr-3">Ver</button>
                  <button className="text-masonic-blue hover:text-blue-900">Editar</button>
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

export default TreasuryPage;
