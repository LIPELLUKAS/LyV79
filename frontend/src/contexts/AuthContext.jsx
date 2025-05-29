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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  // Função utilitária para extrair mensagens de erro da API
  const extractErrorMessage = (error) => {
    if (!error.response) {
      return 'Erro de conexão. Verifique sua internet.';
    }
    
    const { status, data } = error.response;
    
    if (status === 401) {
      return 'Credenciais inválidas. Verifique seu nome de usuário e senha.';
    }
    
    if (data) {
      if (data.detail) {
        return data.detail;
      }
      
      // Para erros de validação (geralmente em formato de objeto)
      if (typeof data === 'object' && !Array.isArray(data)) {
        const firstError = Object.values(data)[0];
        if (Array.isArray(firstError)) {
          return firstError[0];
        }
        return String(firstError);
      }
    }
    
    return 'Ocorreu um erro. Por favor, tente novamente.';
  };

  // Função para validar tokens
  const isValidToken = (token) => {
    if (!token || typeof token !== 'string') return false;
    
    try {
      const decoded = jwtDecode(token);
      return !!decoded.exp && !!decoded.user_id;
    } catch (error) {
      console.error('Token inválido:', error);
      return false;
    }
  };

  // Verificar se há um token válido ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar tanto no localStorage quanto no sessionStorage
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (token && isValidToken(token)) {
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
          });
          
          setCurrentUser(response.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Limpar dados de autenticação
        logout();
      } finally {
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };

    checkAuth();
  }, []);

  // Função para fazer login
  const login = async (username, password, rememberMe = false) => {
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
      
      // Validar token antes de armazenar
      if (!isValidToken(token)) {
        throw new Error('Token inválido recebido do servidor');
      }
      
      // Guardar tokens de acordo com a preferência de "lembrar-me"
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', token);
      storage.setItem('refresh_token', refresh_token);
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      showSuccess('Login realizado com sucesso!');
      
      return { success: true };
    } catch (error) {
      console.error('Erro de login:', error);
      
      // Usar a função utilitária para extrair mensagem de erro
      const errorMessage = extractErrorMessage(error);
      
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
      
      if (!code || !tempUserId) {
        throw new Error('Código ou identificação de usuário inválidos');
      }
      
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await axios.post(`${apiBaseUrl}/authentication/two-factor/verify/`, {
        code,
        user_id: tempUserId
      });
      
      const { token, refresh_token, user } = response.data;
      
      // Validar token antes de armazenar
      if (!isValidToken(token)) {
        throw new Error('Token inválido recebido do servidor');
      }
      
      // Verificar se há preferência de armazenamento (localStorage vs sessionStorage)
      // Usar o mesmo armazenamento que foi usado no login inicial
      const storage = localStorage.getItem('remember_preference') === 'true' ? 
        localStorage : sessionStorage;
      
      storage.setItem('token', token);
      storage.setItem('refresh_token', refresh_token);
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      setRequires2FA(false);
      setTempUserId(null);
      
      showSuccess('Verificação de dois fatores concluída com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('Erro ao verificar 2FA:', error);
      
      // Usar a função utilitária para extrair mensagem de erro
      const errorMessage = extractErrorMessage(error);
      
      showError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar token
  const refreshToken = async () => {
    try {
      // Verificar tanto no localStorage quanto no sessionStorage
      const refresh = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
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
      
      // Validar token antes de armazenar
      if (!isValidToken(access)) {
        throw new Error('Token inválido recebido do servidor');
      }
      
      // Determinar onde armazenar os tokens (mesmo local de onde veio o refresh token)
      const storage = localStorage.getItem('refresh_token') ? localStorage : sessionStorage;
      storage.setItem('token', access);
      storage.setItem('refresh_token', newRefresh);
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar token:', error);
      const errorMessage = extractErrorMessage(error);
      showError(`Sessão expirada: ${errorMessage}`);
      logout();
      return false;
    }
  };

  // Função para fazer logout
  const logout = () => {
    // Limpar tokens de ambos os storages
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('remember_preference');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refresh_token');
    
    setCurrentUser(null);
    setIsAuthenticated(false);
    navigate('/');
  };

  // Função para registrar novo usuário
  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Validação básica dos dados
      if (!userData.username || !userData.email || !userData.password) {
        throw new Error('Todos os campos obrigatórios devem ser preenchidos');
      }
      
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      await axios.post(`${apiBaseUrl}/authentication/users/`, userData);
      showSuccess('Registro realizado com sucesso! Faça login para continuar.');
      return { success: true };
    } catch (error) {
      console.error('Erro ao registrar:', error);
      
      // Usar a função utilitária para extrair mensagem de erro
      let errorMessage = extractErrorMessage(error);
      
      // Tratamento especial para erros de validação de registro
      if (error.response && error.response.data) {
        const errors = error.response.data;
        // Construir uma mensagem de erro mais detalhada
        const errorDetails = [];
        
        if (errors.username) {
          errorDetails.push(`Nome de usuário: ${errors.username.join(', ')}`);
        }
        if (errors.email) {
          errorDetails.push(`Email: ${errors.email.join(', ')}`);
        }
        if (errors.password) {
          errorDetails.push(`Senha: ${errors.password.join(', ')}`);
        }
        
        if (errorDetails.length > 0) {
          errorMessage = `Erro no registro: ${errorDetails.join('; ')}`;
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
      
      if (!email) {
        throw new Error('O endereço de email é obrigatório');
      }
      
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      await axios.post(`${apiBaseUrl}/authentication/password-reset/`, { email });
      showSuccess('Instruções para redefinição de senha foram enviadas para seu email.');
      return { success: true };
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      
      // Usar a função utilitária para extrair mensagem de erro
      const errorMessage = extractErrorMessage(error);
      
      showError(errorMessage);
      return { error: errorMessage };
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

  // Configurar interceptor para renovação automática de token
  useEffect(() => {
    // Configurar interceptor para respostas
    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        // Se receber 401 e não for uma tentativa de refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshed = await refreshToken();
            if (refreshed) {
              // Atualizar token no cabeçalho da requisição original
              const token = localStorage.getItem('token') || sessionStorage.getItem('token');
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Erro ao renovar token:', refreshError);
          }
          
          // Se chegou aqui, o refresh falhou
          logout();
        }
        
        return Promise.reject(error);
      }
    );
    
    // Limpar interceptor ao desmontar
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser,
        loading,
        isAuthenticated,
        requires2FA,
        initialLoadComplete,
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
