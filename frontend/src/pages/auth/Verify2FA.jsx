import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';

const Verify2FA = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const { verify2FA } = useAuth();
  const { lodgeConfig } = useConfig();
  const navigate = useNavigate();

  // Verificar si hay token temporal
  useEffect(() => {
    const tempToken = localStorage.getItem('temp_token');
    if (!tempToken) {
      navigate('/auth/login');
    }
  }, [navigate]);

  // Contador regresivo para el código
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validar código
      if (!code.trim()) {
        throw new Error('El código es obligatorio');
      }
      
      if (!/^\d{6}$/.test(code)) {
        throw new Error('El código debe tener 6 dígitos');
      }
      
      const result = await verify2FA(code);
      
      if (result.success) {
        // Redirigir al dashboard
        navigate('/');
      } else {
        setError(result.error || 'Código inválido');
      }
    } catch (err) {
      setError(err.message || 'Error al verificar el código');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    // Aquí se implementaría la lógica para reenviar el código
    // Por ahora solo reiniciamos el contador
    setCountdown(30);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          {lodgeConfig?.logo ? (
            <img 
              className="mx-auto h-24 w-auto" 
              src={lodgeConfig.logo} 
              alt="Logo de la Logia" 
            />
          ) : (
            <div className="flex justify-center">
              <svg className="h-24 w-24 text-indigo-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
          )}
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Verificación de dos factores
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa el código de verificación de tu aplicación de autenticación
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Código de verificación
            </label>
            <div className="mt-1">
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                autoComplete="one-time-code"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center tracking-widest"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
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
                  <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              {isLoading ? 'Verificando...' : 'Verificar código'}
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              disabled={countdown > 0}
              onClick={handleResendCode}
              className="font-medium text-indigo-600 hover:text-indigo-500 disabled:text-gray-400"
            >
              {countdown > 0 ? `Reenviar código (${countdown}s)` : 'Reenviar código'}
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="font-medium text-gray-600 hover:text-gray-500"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Verify2FA;
