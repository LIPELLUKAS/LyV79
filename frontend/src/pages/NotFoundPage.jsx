import React from 'react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-masonic-blue flex items-center justify-center">
            <span className="text-masonic-gold text-3xl font-bold">404</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Página no encontrada
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          La página que está buscando no existe o ha sido movida.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="btn btn-primary inline-block"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
