import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';
import { useNotification } from '../../contexts/NotificationContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuth();
  const { config } = useConfig();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Detectar preferencia de modo oscuro
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Redirigir si ya está autenticado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validar campos
      if (!username.trim()) {
        throw new Error('El nombre de usuario es obligatorio');
      }
      
      if (!password.trim()) {
        throw new Error('La contraseña es obligatoria');
      }
      
      // Si está marcado "Recordarme", guardar el nombre de usuario en localStorage
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }
      
      const result = await login(username, password);
      
      if (result.requires_2fa) {
        // Redirigir a la página de verificación 2        navigate('/verify-2fa');       showNotification('Se requiere verificación de dos factores', 'info');
      } else if (result.success) {
        // Redirigir al dashboard
        showNotification('Inicio de sesión exitoso', 'success');
        navigate('/dashboard');
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor');
      console.error('Error de login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar nombre de usuario recordado al iniciar
  useEffect(() => {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }
  }, []);

  return (
    <div 
      className={`min-h-screen flex items-center justify-center ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900' 
          : 'bg-gradient-to-br from-indigo-100 via-blue-50 to-indigo-100'
      } relative overflow-hidden`}
      role="main"
      aria-labelledby="login-heading"
    >
      <h1 id="login-heading" className="sr-only">Iniciar sesión en Luz y Verdad</h1>
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 border-2 border-white rounded-full"></div>
        <div className="absolute top-1/4 right-1/4 w-20 h-20 border-2 border-white rotate-45"></div>
        <div className="absolute bottom-1/4 left-1/4 w-20 h-20 border-2 border-white rotate-45"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-2 border-white rotate-45"></div>
      </div>
      
      {/* Contenido del login */}
      <div 
        className={`max-w-md w-full space-y-8 p-10 rounded-xl shadow-2xl z-10 transform transition-all duration-300 hover:scale-[1.01] ${
          darkMode 
            ? 'bg-gray-800 bg-opacity-95 text-white' 
            : 'bg-white bg-opacity-95 text-gray-900'
        }`}
      >
        {/* Enlace a la página principal */}
        <div className="mb-6 text-center">
          <a 
            href="/" 
            className={`inline-flex items-center text-sm font-medium ${
              darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'
            }`}
          >
            <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver a la página principal
          </a>
        </div>
        
        <div className="text-center">
          {config?.logo ? (
            <div className={`relative mx-auto h-28 w-28 rounded-full ${
              darkMode ? 'bg-gray-700' : 'bg-indigo-100'
            } p-2 shadow-inner flex items-center justify-center`}>
              <img 
                className="h-20 w-auto object-contain" 
                src={config.logo} 
                alt="Logo de la Logia" 
              />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className={`relative h-28 w-28 rounded-full ${
                darkMode ? 'bg-gray-700' : 'bg-indigo-100'
              } p-2 shadow-inner flex items-center justify-center`}>
                <svg className={`h-16 w-16 ${
                  darkMode ? 'text-indigo-400' : 'text-indigo-900'
                }`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
            </div>
          )}
          <h2 className={`mt-6 text-3xl font-extrabold tracking-tight ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {config?.lodge_name || 'Luz y Verdad'}
          </h2>
          <p className={`mt-2 text-sm ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          } font-medium`}>
            Sistema de Gestión Masónica
          </p>
          <div className="mt-3 flex justify-center">
            <div className={`h-1 w-16 ${
              darkMode ? 'bg-indigo-400' : 'bg-indigo-600'
            } rounded`}></div>
          </div>
        </div>
        
        <div className="mt-4">
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Ingrese sus credenciales para acceder al sistema
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div 
              className={`${
                darkMode ? 'bg-red-900 bg-opacity-30 border-red-700' : 'bg-red-50 border-red-500'
              } border-l-4 p-4 rounded-md shadow-sm animate-fadeIn`} 
              role="alert"
              aria-live="assertive"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${
                    darkMode ? 'text-red-300' : 'text-red-700'
                  }`}>{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              } mb-1`}>Nombre de usuario</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className={`pl-10 appearance-none block w-full px-3 py-3 border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm`}
                  placeholder="Ingrese su nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              } mb-1`}>Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`pl-10 appearance-none block w-full px-3 py-3 border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm`}
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={`h-4 w-4 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-indigo-500' 
                    : 'text-indigo-600 border-gray-300'
                } rounded focus:ring-indigo-500`}
              />
              <label htmlFor="remember-me" className={`ml-2 block text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-900'
              }`}>
                Recordarme
              </label>
            </div>

            <div className="text-sm">
              <a href="/auth/forgot-password" className={`font-medium ${
                darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'
              }`}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-200 ${
                isLoading 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : `${darkMode ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'} shadow-lg hover:shadow-xl`
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
                  <svg className={`h-5 w-5 ${
                    darkMode ? 'text-indigo-300 group-hover:text-indigo-200' : 'text-indigo-300 group-hover:text-indigo-200'
                  } transition-colors duration-200`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              <span className="text-base">{isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}</span>
            </button>
          </div>
        </form>
        
        {/* Elementos masónicos decorativos */}
        <div className={`mt-8 pt-6 border-t ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <div className="flex justify-center">
                <svg className={`h-6 w-6 ${
                  darkMode ? 'text-indigo-400' : 'text-indigo-500'
                }`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                </svg>
              </div>
              <p className={`mt-1 text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Sabiduría</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <svg className={`h-6 w-6 ${
                  darkMode ? 'text-indigo-400' : 'text-indigo-500'
                }`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 6l9 4 9-4-9-4-9 4z"></path>
                </svg>
              </div>
              <p className={`mt-1 text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Fuerza</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <svg className={`h-6 w-6 ${
                  darkMode ? 'text-indigo-400' : 'text-indigo-500'
                }`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 22l-10-5v-5l10 5 10-5v5l-10 5z"></path>
                </svg>
              </div>
              <p className={`mt-1 text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Belleza</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
