import React from 'react';
import PropTypes from 'prop-types';

/**
 * Button component with various styles and states
 * 
 * @param {Object} props - Component props
 * @param {string} [props.variant='primary'] - Button style variant (primary, secondary, outline, danger)
 * @param {string} [props.size='md'] - Button size (sm, md, lg)
 * @param {boolean} [props.isLoading=false] - Whether the button is in loading state
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {string} [props.type='button'] - Button type attribute
 * @param {Function} [props.onClick] - Click handler function
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} The Button component
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  children,
  className = '',
  ...props
}) => {
  // Base classes for all buttons
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'border border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-300',
    secondary: 'border border-transparent text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500 disabled:bg-indigo-50',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500 disabled:bg-gray-100',
    danger: 'border border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300'
  };
  
  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size] || sizeClasses.md}
    ${variantClasses[variant] || variantClasses.primary}
    ${disabled ? 'cursor-not-allowed' : ''}
    ${className}
  `;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default Button;
