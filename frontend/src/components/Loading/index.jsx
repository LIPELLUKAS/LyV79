import React from 'react';
import PropTypes from 'prop-types';

/**
 * Loading component for displaying loading states
 * 
 * @param {Object} props - Component props
 * @param {string} [props.size='md'] - Size of the loading spinner (sm, md, lg)
 * @param {string} [props.color='indigo'] - Color of the spinner (indigo, gray, red, green, blue)
 * @param {string} [props.text] - Optional loading text to display
 * @param {boolean} [props.fullScreen=false] - Whether to display as a full-screen overlay
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} The Loading component
 */
const Loading = ({
  size = 'md',
  color = 'indigo',
  text,
  fullScreen = false,
  className = ''
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  // Color classes
  const colorClasses = {
    indigo: 'text-indigo-500',
    gray: 'text-gray-500',
    red: 'text-red-500',
    green: 'text-green-500',
    blue: 'text-blue-500'
  };
  
  // Spinner component
  const Spinner = () => (
    <svg 
      className={`animate-spin ${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.indigo} ${className}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
  
  // If fullScreen, render as overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
          <Spinner />
          {text && <p className="mt-4 text-gray-700">{text}</p>}
        </div>
      </div>
    );
  }
  
  // Regular loading spinner
  return (
    <div className="flex items-center justify-center">
      <Spinner />
      {text && <p className="ml-3 text-gray-700">{text}</p>}
    </div>
  );
};

Loading.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.oneOf(['indigo', 'gray', 'red', 'green', 'blue']),
  text: PropTypes.string,
  fullScreen: PropTypes.bool,
  className: PropTypes.string
};

export default Loading;
