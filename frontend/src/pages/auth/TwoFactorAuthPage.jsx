import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const TwoFactorAuthPage = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { verifyTwoFactor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validar campos
      if (!code.trim()) {
        throw new Error('El código de verificación es obligatorio');
      }
      
      const result = await verifyTwoFactor(username, code);
      
      if (result.success) {
        // Redirigir al dashboard
        navigate('/dashboard');
      } else {
        setError(result.error || 'Código de verificación inválido');
      }
    } catch (err) {
      setError(err.message || 'Error al verificar el código');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-indigo-900 dark:to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 border-2 border-white rounded-full"></div>
        <div className="absolute top-1/4 right-1/4 w-20 h-20 border-2 border-white rotate-45"></div>
        <div className="absolute bottom-1/4 left-1/4 w-20 h-20 border-2 border-white rotate-45"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-2 border-white rotate-45"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 p-10 rounded-xl shadow-2xl z-10 transform transition-all duration-300 hover:scale-[1.01] bg-white bg-opacity-95 text-gray-900 dark:bg-gray-800 dark:bg-opacity-95 dark:text-white">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="relative h-28 w-28 rounded-full bg-indigo-100 dark:bg-gray-700 p-2 shadow-inner flex items-center justify-center">
              <svg className="h-16 w-16 text-indigo-900 dark:text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight">
            Verificación de dos factores
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
            Ingrese el código de verificación
          </p>
          <div className="mt-3 flex justify-center">
            <div className="h-1 w-16 bg-indigo-600 dark:bg-indigo-400 rounded"></div>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Se ha enviado un código de verificación a su dispositivo. Por favor, ingréselo a continuación.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-30 border-l-4 border-red-500 dark:border-red-700 p-4 rounded-md shadow-sm animate-fadeIn" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código de verificación</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="code"
                  name="code"
                  type="text"
                  autoComplete="one-time-code"
                  required
                  className="pl-10 appearance-none block w-full px-3 py-3 border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm"
                  placeholder="Ingrese el código de 6 dígitos"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-200 ${
                isLoading 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-lg hover:shadow-xl'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isLoading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              <span className="text-base">{isLoading ? 'Verificando...' : 'Verificar'}</span>
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <button 
            onClick={() => navigate('/login')} 
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthPage;
