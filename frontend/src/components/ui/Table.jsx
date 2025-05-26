import React from 'react';

// Componente de tabela reutilizável
const Table = ({ 
  columns,
  data,
  isLoading = false,
  emptyMessage = 'Nenhum dado encontrado.',
  onRowClick = null,
  className = '',
  striped = true,
  hoverable = true,
  compact = false
}) => {
  // Classes base
  const baseTableClasses = 'min-w-full divide-y divide-gray-200';
  
  // Classes de hover
  const hoverClasses = hoverable ? 'hover:bg-gray-50' : '';
  
  // Classes de tamanho
  const sizeClasses = compact ? 'text-xs' : 'text-sm';
  
  // Combinar todas as classes
  const tableClasses = `${baseTableClasses} ${className}`;

  return (
    <div className="overflow-x-auto">
      <table className={tableClasses}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index}
                scope="col" 
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                style={column.width ? { width: column.width } : {}}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex}
                className={`${onRowClick ? 'cursor-pointer' : ''} ${striped && rowIndex % 2 === 1 ? 'bg-gray-50' : ''} ${hoverClasses}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column, colIndex) => (
                  <td 
                    key={colIndex} 
                    className={`px-6 py-4 whitespace-nowrap ${sizeClasses} ${column.cellClassName || ''}`}
                  >
                    {column.render ? column.render(row) : row[column.field]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
