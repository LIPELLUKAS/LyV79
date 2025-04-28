import React from 'react';
import PropTypes from 'prop-types';

/**
 * PageHeader component for displaying page titles and optional actions
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The main title of the page
 * @param {string} [props.subtitle] - Optional subtitle or description
 * @param {React.ReactNode} [props.actions] - Optional actions (buttons, links, etc.)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} The PageHeader component
 */
const PageHeader = ({ title, subtitle, actions, className = '' }) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center md:justify-between mb-6 ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
      
      {actions && (
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  className: PropTypes.string
};

export default PageHeader;
