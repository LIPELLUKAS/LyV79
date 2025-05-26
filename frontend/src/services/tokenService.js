// Obter token do localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Obter refresh token do localStorage ou sessionStorage
export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
};

// Salvar tokens
export const saveTokens = (token, refreshToken, rememberMe = false) => {
  localStorage.setItem('token', token);
  
  if (rememberMe) {
    localStorage.setItem('refresh_token', refreshToken);
  } else {
    sessionStorage.setItem('refresh_token', refreshToken);
  }
};

// Limpar tokens
export const clearTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  sessionStorage.removeItem('refresh_token');
};

// Refresh token
export const refreshToken = async () => {
  try {
    const refresh = getRefreshToken();
    
    if (!refresh) {
      throw new Error('No refresh token available');
    }
    
    // Importar axios diretamente aqui para evitar dependência circular
    const axios = require('axios');
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/authentication/token/refresh/`,
      { refresh }
    );
    
    const { access, refresh: newRefresh } = response.data;
    
    // Determinar se o usuário optou por "lembrar-me"
    const rememberMe = !!localStorage.getItem('refresh_token');
    
    // Salvar novos tokens
    saveTokens(access, newRefresh, rememberMe);
    
    return access;
  } catch (error) {
    clearTokens();
    throw error;
  }
};
