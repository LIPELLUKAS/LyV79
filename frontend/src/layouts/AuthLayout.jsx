import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthLayout = () => {
  const { error } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary mb-2">Luz y Verdad</h1>
            <p className="text-gray-600">Sistema de Gestión Masónica</p>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        <Outlet />
        
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Luz y Verdad. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
