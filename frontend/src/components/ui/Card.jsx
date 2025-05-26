import React from 'react';

// Componente de card reutilizável
const Card = ({ 
  children, 
  title,
  subtitle,
  icon,
  footer,
  className = '',
  padding = 'normal',
  hover = false,
  onClick = null
}) => {
  // Classes de padding
  const paddingClasses = {
    none: '',
    small: 'p-3',
    normal: 'p-5',
    large: 'p-6'
  };

  // Classes base
  const baseClasses = 'bg-white rounded-lg shadow-md overflow-hidden';
  
  // Classes de hover
  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-300' : '';
  
  // Classes de clique
  const clickClasses = onClick ? 'cursor-pointer' : '';
  
  // Combinar todas as classes
  const cardClasses = `${baseClasses} ${paddingClasses[padding]} ${hoverClasses} ${clickClasses} ${className}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      {/* Cabeçalho do card, se houver título */}
      {(title || icon) && (
        <div className="flex items-center mb-4">
          {icon && (
            <div className="flex-shrink-0 mr-3">
              {icon}
            </div>
          )}
          <div>
            {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
      )}
      
      {/* Conteúdo do card */}
      <div className={!title && !icon ? '' : 'mt-2'}>
        {children}
      </div>
      
      {/* Rodapé do card, se houver */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
