import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useNotification } from './NotificationContext';
import { jwtDecode } from 'jwt-decode';

// Criando o contexto de autenticação
const AuthContext = createContext();

// Hook personalizado para usar o contexto
export const useAuth = () => useContext(AuthContext);

// Provider do contexto
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);
  
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  // Verificar se há um token válido ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verificar se o token expirou
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            // Token expirado, tentar refresh
            const refreshed = await refreshToken();
            if (!refreshed) {
              throw new Error('Sessão expirada');
            }
          }
          
              // Obter perfil do usuário
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await axios.get(`${apiBaseUrl}/authentication/users/me/`, {
        headers: { Authorization: `Bearer ${token}` }
      });     });
          
          setCurrentUser(response.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Limpar dados de autenticação
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Função para fazer login
  const login = async (username, password) => {
    try {
      setLoading(true);
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await axios.post(`${apiBaseUrl}/authentication/token/`, { username, password });
      
      // Se requer 2FA
      if (response.data.requires_2fa) {
        setRequires2FA(true);
        setTempUserId(response.data.user_id);
        return { requires_2fa: true, user_id: response.data.user_id };
      }
      
      // Se não requer 2FA, guardar token e dados do usuário
      const { token, refresh_token, user } = response.data;
      
      // Guardar tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refresh_token', refresh_token);
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      showSuccess('Login realizado com sucesso!');
      
      return { success: true };
    } catch (error) {
      console.error('Erro de login:', error);
      
      let errorMessage = 'Erro ao fazer login. Por favor, tente novamente.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Credenciais inválidas. Verifique seu nome de usuário e senha.';
        } else if (error.response.data && error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      }
      
      showError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar código 2FA
  const verify2FA = async (code) => {
    try {
      setLoading(true);
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await axios.post(`${apiBaseUrl}/authentication/two-factor/verify/`, {
        code,
        user_id: tempUserId
      });
      
      const { token, refresh_token, user } = response.data;
      
      // Guardar tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refresh_token', refresh_token);
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      setRequires2FA(false);
      setTempUserId(null);
      
      showSuccess('Verificação de dois fatores concluída com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('Erro ao verificar 2FA:', error);
      
      let errorMessage = 'Código inválido. Por favor, tente novamente.';
      
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
      
      showError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar token
  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) return false;
      
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await axios.post(`${apiBaseUrl}/authentication/token/refresh/`, {
        refresh
      });
      
      // Verificar se a resposta contém os tokens esperados
      if (!response.data.access) {
        throw new Error('Formato de resposta inválido');
      }
      
      const { access, refresh: newRefresh } = response.data;
      
      localStorage.setItem('token', access);
      localStorage.setItem('refresh_token', newRefresh);
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar token:', error);
      logout();
      return false;
    }
  };

  // Função para fazer logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setCurrentUser(null);
    setIsAuthenticated(false);
    navigate('/');
  };

  // Função para registrar novo usuário
  const register = async (userData) => {
    try {
      setLoading(true);
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      await axios.post(`${apiBaseUrl}/authentication/users/`, userData);
      showSuccess('Registro realizado com sucesso! Faça login para continuar.');
      return { success: true };
    } catch (error) {
      console.error('Erro ao registrar:', error);
      
      let errorMessage = 'Erro ao registrar. Por favor, tente novamente.';
      
      if (error.response && error.response.data) {
        // Processar erros específicos
        const errors = error.response.data;
        if (errors.username) {
          errorMessage = `Erro no nome de usuário: ${errors.username.join(', ')}`;
        } else if (errors.email) {
          errorMessage = `Erro no email: ${errors.email.join(', ')}`;
        } else if (errors.password) {
          errorMessage = `Erro na senha: ${errors.password.join(', ')}`;
        }
      }
      
      showError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Função para solicitar redefinição de senha
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      await axios.post(`${apiBaseUrl}/authentication/password-reset/`, { email });
      showSuccess('Instruções para redefinição de senha foram enviadas para seu email.');
      return { success: true };
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      showError('Não foi possível enviar o email de redefinição de senha.');
      return { error: 'Não foi possível enviar o email de redefinição de senha.' };
    } finally {
      setLoading(false);
    }
  };

  // Verificar se o usuário tem um cargo específico
  const hasRole = (role) => {
    if (!currentUser) return false;
    return currentUser.role === role;
  };

  // Verificar se o usuário tem um cargo específico
  const hasOffice = (office) => {
    if (!currentUser || !currentUser.offices) return false;
    return currentUser.offices.some(o => o === office);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser,
        loading,
        isAuthenticated,
        requires2FA,
        login,
        logout,
        register,
        verify2FA,
        resetPassword,
        hasRole,
        hasOffice
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
