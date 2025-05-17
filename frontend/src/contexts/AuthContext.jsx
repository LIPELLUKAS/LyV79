import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);
  const navigate = useNavigate();

  // Verificar si hay un token almacenado al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Obtener perfil del usuario
          const response = await authService.getProfile();
          setCurrentUser(response.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        // Si hay error, limpiar token
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Función para iniciar sesión
  const login = async (credentials, rememberMe = false) => {
    setAuthError(null);
    try {
      const response = await authService.login(credentials);
      
      // Si requiere 2FA
      if (response.data.requires_2fa) {
        setRequires2FA(true);
        setTempUserId(response.data.user_id);
        return { requires2FA: true, userId: response.data.user_id };
      }
      
      // Si no requiere 2FA, guardar token y datos de usuario
      const { token, refresh_token, user } = response.data;
      
      // Guardar tokens
      localStorage.setItem('token', token);
      if (rememberMe) {
        localStorage.setItem('refresh_token', refresh_token);
      } else {
        sessionStorage.setItem('refresh_token', refresh_token);
      }
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      
      let errorMessage = 'Error al iniciar sesión. Por favor, intente nuevamente.';
      
      if (error.response) {
        // Error específico del servidor
        if (error.response.data && error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data && error.response.data.non_field_errors) {
          errorMessage = error.response.data.non_field_errors[0];
        } else if (error.response.status === 401) {
          errorMessage = 'Credenciales inválidas. Por favor, verifique su nombre de usuario y contraseña.';
        } else if (error.response.status === 403) {
          errorMessage = 'Su cuenta está desactivada. Por favor, contacte al administrador.';
        }
      }
      
      setAuthError(errorMessage);
      return { error: errorMessage };
    }
  };

  // Función para verificar código 2FA
  const verify2FA = async (code) => {
    setAuthError(null);
    try {
      const response = await authService.verify2FA(code, tempUserId);
      
      const { token, refresh_token, user } = response.data;
      
      // Guardar tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refresh_token', refresh_token);
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      setRequires2FA(false);
      setTempUserId(null);
      
      return { success: true };
    } catch (error) {
      console.error('Error al verificar 2FA:', error);
      
      let errorMessage = 'Código inválido. Por favor, intente nuevamente.';
      
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setAuthError(errorMessage);
      return { error: errorMessage };
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('refresh_token');
    setCurrentUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Función para registrar un nuevo usuario
  const register = async (userData) => {
    setAuthError(null);
    try {
      await authService.register(userData);
      return { success: true };
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      
      let errorMessage = 'Error al registrar usuario. Por favor, intente nuevamente.';
      
      if (error.response && error.response.data) {
        // Procesar errores específicos
        const errors = error.response.data;
        if (errors.username) {
          errorMessage = `Error en nombre de usuario: ${errors.username.join(', ')}`;
        } else if (errors.email) {
          errorMessage = `Error en correo electrónico: ${errors.email.join(', ')}`;
        } else if (errors.password) {
          errorMessage = `Error en contraseña: ${errors.password.join(', ')}`;
        } else if (errors.non_field_errors) {
          errorMessage = errors.non_field_errors.join(', ');
        }
      }
      
      setAuthError(errorMessage);
      return { error: errorMessage };
    }
  };

  // Función para solicitar restablecimiento de contraseña
  const resetPassword = async (email) => {
    setAuthError(null);
    try {
      await authService.resetPassword(email);
      return { success: true };
    } catch (error) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      
      let errorMessage = 'Error al solicitar restablecimiento de contraseña. Por favor, intente nuevamente.';
      
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setAuthError(errorMessage);
      return { error: errorMessage };
    }
  };

  // Función para confirmar restablecimiento de contraseña
  const confirmResetPassword = async (data) => {
    setAuthError(null);
    try {
      await authService.confirmResetPassword(data);
      return { success: true };
    } catch (error) {
      console.error('Error al confirmar restablecimiento de contraseña:', error);
      
      let errorMessage = 'Error al confirmar restablecimiento de contraseña. Por favor, intente nuevamente.';
      
      if (error.response && error.response.data) {
        if (error.response.data.token) {
          errorMessage = 'El enlace de restablecimiento es inválido o ha expirado.';
        } else if (error.response.data.password) {
          errorMessage = `Error en contraseña: ${error.response.data.password.join(', ')}`;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      }
      
      setAuthError(errorMessage);
      return { error: errorMessage };
    }
  };

  // Función para cambiar contraseña
  const changePassword = async (data) => {
    setAuthError(null);
    try {
      await authService.changePassword(data);
      return { success: true };
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      
      let errorMessage = 'Error al cambiar contraseña. Por favor, intente nuevamente.';
      
      if (error.response && error.response.data) {
        if (error.response.data.old_password) {
          errorMessage = 'La contraseña actual es incorrecta.';
        } else if (error.response.data.new_password) {
          errorMessage = `Error en nueva contraseña: ${error.response.data.new_password.join(', ')}`;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      }
      
      setAuthError(errorMessage);
      return { error: errorMessage };
    }
  };

  // Función para actualizar perfil
  const updateProfile = async (data) => {
    setAuthError(null);
    try {
      const response = await authService.updateProfile(data);
      setCurrentUser(response.data);
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      
      let errorMessage = 'Error al actualizar perfil. Por favor, intente nuevamente.';
      
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setAuthError(errorMessage);
      return { error: errorMessage };
    }
  };

  // Función para configurar 2FA
  const setup2FA = async () => {
    setAuthError(null);
    try {
      const response = await authService.setup2FA();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error al configurar 2FA:', error);
      
      let errorMessage = 'Error al configurar autenticación de dos factores. Por favor, intente nuevamente.';
      
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setAuthError(errorMessage);
      return { error: errorMessage };
    }
  };

  // Función para desactivar 2FA
  const disable2FA = async () => {
    setAuthError(null);
    try {
      await authService.disable2FA();
      
      // Actualizar perfil de usuario
      const response = await authService.getProfile();
      setCurrentUser(response.data);
      
      return { success: true };
    } catch (error) {
      console.error('Error al desactivar 2FA:', error);
      
      let errorMessage = 'Error al desactivar autenticación de dos factores. Por favor, intente nuevamente.';
      
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setAuthError(errorMessage);
      return { error: errorMessage };
    }
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    if (!currentUser) return false;
    return currentUser.role === role;
  };

  // Verificar si el usuario tiene un grado específico o superior
  const hasDegree = (degree) => {
    if (!currentUser) return false;
    return currentUser.degree >= degree;
  };

  // Verificar si el usuario tiene un cargo específico
  const hasOffice = (office) => {
    if (!currentUser || !currentUser.offices) return false;
    return currentUser.offices.includes(office);
  };

  const value = {
    currentUser,
    loading,
    authError,
    isAuthenticated,
    requires2FA,
    login,
    logout,
    register,
    verify2FA,
    resetPassword,
    confirmResetPassword,
    changePassword,
    updateProfile,
    setup2FA,
    disable2FA,
    hasRole,
    hasDegree,
    hasOffice
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
