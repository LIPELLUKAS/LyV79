import api from './api';

/**
 * Serviço de autenticação para gerenciar login, logout e operações relacionadas
 */
export const authService = {
  /**
   * Realiza o login do usuário
   * @param {Object} credentials - Credenciais do usuário (username e password)
   * @returns {Promise} - Promise com o resultado da operação
   */
  login: async (credentials) => {
    return await api.post('/authentication/token/', credentials);
  },

  /**
   * Verifica o código de autenticação de dois fatores
   * @param {Object} data - Dados com o código de verificação
   * @returns {Promise} - Promise com o resultado da operação
   */
  verify2FA: async (code) => {
    return await api.post('/authentication/two-factor/verify/', { code });
  },

  /**
   * Configura a autenticação de dois fatores para o usuário
   * @returns {Promise} - Promise com o resultado da operação
   */
  setup2FA: async () => {
    return await api.get('/authentication/two-factor/setup/');
  },

  /**
   * Confirma a configuração da autenticação de dois fatores
   * @param {Object} data - Dados com o código de verificação
   * @returns {Promise} - Promise com o resultado da operação
   */
  confirmTwoFactor: async (code) => {
    return await api.post('/authentication/two-factor/setup/', { code });
  },

  /**
   * Desativa a autenticação de dois fatores
   * @returns {Promise} - Promise com o resultado da operação
   */
  disable2FA: async () => {
    return await api.post('/authentication/two-factor/disable/');
  },

  /**
   * Atualiza o token de acesso usando o token de atualização
   * @param {string} refreshToken - Token de atualização
   * @returns {Promise} - Promise com o resultado da operação
   */
  refreshToken: async (refreshToken) => {
    return await api.post('/authentication/token/refresh/', { refresh: refreshToken });
  },

  /**
   * Solicita redefinição de senha
   * @param {string} email - Email do usuário
   * @returns {Promise} - Promise com o resultado da operação
   */
  forgotPassword: async (email) => {
    return await api.post('/authentication/password-reset/', { email });
  },

  /**
   * Confirma a redefinição de senha
   * @param {string} token - Token de redefinição
   * @param {string} password - Nova senha
   * @returns {Promise} - Promise com o resultado da operação
   */
  resetPassword: async (token, password) => {
    return await api.post('/authentication/password-reset/confirm/', { token, password });
  },

  /**
   * Altera a senha do usuário logado
   * @param {Object} data - Dados com a senha atual e a nova senha
   * @returns {Promise} - Promise com o resultado da operação
   */
  changePassword: async (data) => {
    return await api.post('/authentication/users/change-password/', data);
  },

  /**
   * Obtém o perfil do usuário logado
   * @returns {Promise} - Promise com o resultado da operação
   */
  getCurrentUser: async () => {
    return await api.get('/authentication/users/me/');
  },

  /**
   * Atualiza o perfil do usuário logado
   * @param {Object} data - Dados do perfil a serem atualizados
   * @returns {Promise} - Promise com o resultado da operação
   */
  updateProfile: async (data) => {
    return await api.put('/authentication/users/me/', data);
  },

  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do novo usuário
   * @returns {Promise} - Promise com o resultado da operação
   */
  register: async (userData) => {
    return await api.post('/authentication/users/', userData);
  },

  /**
   * Realiza o logout do usuário
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
};

export default authService;
