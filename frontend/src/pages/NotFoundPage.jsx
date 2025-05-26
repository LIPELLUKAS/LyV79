import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-error">
          <div className="not-found-code">404</div>
          <div className="not-found-divider"></div>
          <div className="not-found-message">
            <h1>Página não encontrada</h1>
            <p>Por favor, verifique o URL e tente novamente.</p>
          </div>
        </div>
        
        <div className="not-found-illustration">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="var(--primary-light)" d="M47.7,-57.2C59.5,-45.8,65.9,-29.1,68.8,-12.1C71.7,4.9,71.2,22.2,63.3,35.1C55.4,48.1,40.2,56.8,24.4,62.4C8.6,68,-7.8,70.5,-22.9,66.2C-38,61.9,-51.8,50.7,-60.1,36.5C-68.4,22.3,-71.2,5,-67.4,-10.2C-63.6,-25.3,-53.2,-38.3,-40.7,-49.5C-28.2,-60.7,-14.1,-70.1,1.8,-72.2C17.7,-74.3,35.9,-68.7,47.7,-57.2Z" transform="translate(100 100)" />
          </svg>
        </div>
        
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            Voltar para a página inicial
          </Link>
          <Link to="/dashboard" className="btn btn-outline">
            Ir para o Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
