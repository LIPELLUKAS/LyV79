import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay un token en localStorage
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getCurrentUser();
      setCurrentUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al obtener perfil de usuario:', err);
      setError('Error al obtener perfil de usuario');
      // Si hay un error al obtener el perfil, limpiar tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await authService.login({ username, password });
      
      // Guardar tokens
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      
      // Verificar si se requiere 2FA
      if (response.data.requires_2fa) {
        return { requires_2fa: true };
      }
      
      // Obtener perfil de usuario
      await fetchUserProfile();
      
      return { success: true };
    } catch (err) {
      console.error('Error de login:', err);
      setError(err.response?.data?.detail || 'Error al iniciar sesión');
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Error al iniciar sesión' 
      };
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (code) => {
    try {
      setLoading(true);
      const response = await authService.verify2FA(code);
      
      // Actualizar token si es necesario
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
      }
      
      // Obtener perfil de usuario
      await fetchUserProfile();
      
      return { success: true };
    } catch (err) {
      console.error('Error de verificación 2FA:', err);
      setError(err.response?.data?.detail || 'Código de verificación inválido');
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Código de verificación inválido' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/auth/login');
  };

  const updateUserProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await authService.updateProfile(profileData);
      setCurrentUser(response.data);
      return { success: true };
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      setError(err.response?.data?.detail || 'Error al actualizar perfil');
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Error al actualizar perfil' 
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    verify2FA,
    updateUserProfile,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
