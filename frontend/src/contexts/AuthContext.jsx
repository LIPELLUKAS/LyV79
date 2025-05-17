import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Crear el contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // Verificar si hay un token almacenado al cargar la aplicación
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Verificar que el token tenga el formato correcto antes de decodificarlo
          if (!token.includes('.') || token.split('.').length !== 3) {
            console.error('Token malformado, realizando logout');
            logout();
            return;
          }
          
          try {
            // Verificar si el token ha expirado
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            
            if (decodedToken.exp < currentTime) {
              // Token expirado, intentar refrescar
              try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                  const response = await authService.refreshToken(refreshToken);
                  localStorage.setItem('token', response.data.access);
                  
                  // Obtener información del usuario actual
                  const userResponse = await authService.getCurrentUser();
                  setCurrentUser(userResponse.data);
                  setIsAuthenticated(true);
                  
                  // Establecer el rol principal del usuario
                  if (userResponse.data.roles && userResponse.data.roles.length > 0) {
                    setUserRole(userResponse.data.roles[0]);
                  }
                } else {
                  // No hay refresh token, logout
                  logout();
                }
              } catch (refreshError) {
                // Error al refrescar el token, logout
                console.error('Error al refrescar token:', refreshError);
                logout();
              }
            } else {
              // Token válido, obtener información del usuario
              try {
                const response = await authService.getCurrentUser();
                setCurrentUser(response.data);
                setIsAuthenticated(true);
                
                // Establecer el rol principal del usuario
                if (response.data.roles && response.data.roles.length > 0) {
                  setUserRole(response.data.roles[0]);
                }
              } catch (userError) {
                // Error al obtener información del usuario, logout
                console.error('Error al obtener información del usuario:', userError);
                logout();
              }
            }
          } catch (decodeError) {
            // Error al decodificar el token, logout
            console.error('Error al decodificar token:', decodeError);
            logout();
          }
        }
      } catch (e) {
        console.error('Error en checkLoggedIn:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, [navigate]);

  // Función para iniciar sesión
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login({ username, password });
      
      // Verificar si se requiere 2FA
      if (response.data.requires_2fa) {
        // Guardar el token temporal para la verificación 2FA
        localStorage.setItem('temp_token', response.data.temp_token);
        
        // Redirigir a la página de verificación 2FA
        navigate('/auth/verify-2fa');
        return { requires_2fa: true };
      }
      
      // No se requiere 2FA, guardar tokens y obtener usuario
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      
      const userResponse = await authService.getCurrentUser();
      setCurrentUser(userResponse.data);
      setIsAuthenticated(true);
      
      // Establecer el rol principal del usuario
      if (userResponse.data.roles && userResponse.data.roles.length > 0) {
        setUserRole(userResponse.data.roles[0]);
      }
      
      return { success: true };
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al iniciar sesión');
      return { success: false, error: e.response?.data?.detail || 'Error al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar código 2FA
  const verify2FA = async (code) => {
    try {
      setLoading(true);
      setError(null);
      
      const tempToken = localStorage.getItem('temp_token');
      if (!tempToken) {
        throw new Error('No hay token temporal para verificación 2FA');
      }
      
      const response = await authService.verify2FA(code);
      
      // Guardar tokens y obtener usuario
      localStorage.removeItem('temp_token');
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      
      const userResponse = await authService.getCurrentUser();
      setCurrentUser(userResponse.data);
      setIsAuthenticated(true);
      
      // Establecer el rol principal del usuario
      if (userResponse.data.roles && userResponse.data.roles.length > 0) {
        setUserRole(userResponse.data.roles[0]);
      }
      
      return { success: true };
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al verificar código 2FA');
      return { success: false, error: e.response?.data?.detail || 'Error al verificar código 2FA' };
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/login');
  };

  // Función para registrar un nuevo usuario
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      return { success: true, data: response.data };
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al registrar usuario');
      return { success: false, error: e.response?.data?.detail || 'Error al registrar usuario' };
    } finally {
      setLoading(false);
    }
  };

  // Función para solicitar restablecimiento de contraseña
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.forgotPassword(email);
      return { success: true, data: response.data };
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al solicitar restablecimiento de contraseña');
      return { success: false, error: e.response?.data?.detail || 'Error al solicitar restablecimiento de contraseña' };
    } finally {
      setLoading(false);
    }
  };

  // Función para restablecer contraseña
  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.resetPassword(token, password);
      return { success: true, data: response.data };
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al restablecer contraseña');
      return { success: false, error: e.response?.data?.detail || 'Error al restablecer contraseña' };
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar perfil de usuario
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.updateProfile(userData);
      setCurrentUser(response.data);
      
      // Actualizar el rol principal si ha cambiado
      if (response.data.roles && response.data.roles.length > 0) {
        setUserRole(response.data.roles[0]);
      }
      
      return { success: true, data: response.data };
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al actualizar perfil');
      return { success: false, error: e.response?.data?.detail || 'Error al actualizar perfil' };
    } finally {
      setLoading(false);
    }
  };

  // Función para configurar 2FA
  const setup2FA = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.setup2FA();
      return { success: true, data: response.data };
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al configurar 2FA');
      return { success: false, error: e.response?.data?.detail || 'Error al configurar 2FA' };
    } finally {
      setLoading(false);
    }
  };

  // Función para deshabilitar 2FA
  const disable2FA = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.disable2FA();
      
      // Actualizar información del usuario
      const userResponse = await authService.getCurrentUser();
      setCurrentUser(userResponse.data);
      
      return { success: true, data: response.data };
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al deshabilitar 2FA');
      return { success: false, error: e.response?.data?.detail || 'Error al deshabilitar 2FA' };
    } finally {
      setLoading(false);
    }
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    if (!currentUser || !currentUser.roles) return false;
    return currentUser.roles.includes(role);
  };

  // Verificar si el usuario tiene un grado masónico mínimo
  const hasDegree = (degree) => {
    if (!currentUser || !currentUser.degree) return false;
    return currentUser.degree >= degree;
  };

  // Verificar si el usuario tiene un cargo oficial específico
  const hasOffice = (office) => {
    if (!currentUser || !currentUser.office) return false;
    return currentUser.office === office;
  };

  // Valor del contexto
  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    userRole,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    updateProfile,
    setup2FA,
    verify2FA,
    disable2FA,
    hasRole,
    hasDegree,
    hasOffice
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Cargando...</div>}
    </AuthContext.Provider>
  );
};

export default AuthContext;
