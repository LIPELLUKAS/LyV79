import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-masonic-blue bg-opacity-90 z-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-masonic-gold"></div>
        <h2 className="mt-4 text-xl font-semibold text-white">Cargando...</h2>
        <p className="mt-2 text-white">Sistema de Gestión Masónica "Luz y Verdad"</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
