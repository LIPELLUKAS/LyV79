import React from 'react';

// Componente de input reutilizável
const Input = ({ 
  label,
  id,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  className = '',
  helpText,
  icon,
  iconPosition = 'left'
}) => {
  // Classes base
  const baseInputClasses = 'appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm';
  
  // Classes de erro
  const errorClasses = error ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 text-gray-900';
  
  // Classes de ícone
  const iconClasses = icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';
  
  // Classes de desabilitado
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : '';
  
  // Combinar todas as classes
  const inputClasses = `${baseInputClasses} ${errorClasses} ${iconClasses} ${disabledClasses} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-description` : undefined}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500" id={`${id}-description`}>
          {helpText}
        </p>
      )}
    </div>
  );
};

export default Input;
