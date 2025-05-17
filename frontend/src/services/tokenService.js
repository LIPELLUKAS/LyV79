/**
 * Servicio para gestionar tokens de autenticación
 */

/**
 * Obtiene el token de acceso almacenado
 * @returns {string|null} - Token de acceso o null si no existe
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Guarda el token de acceso y el token de actualización
 * @param {string} token - Token de acceso
 * @param {string} refreshToken - Token de actualización
 */
export const saveTokens = (token, refreshToken) => {
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
};

/**
 * Elimina los tokens almacenados
 */
export const clearTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

/**
 * Obtiene el token de actualización almacenado
 * @returns {string|null} - Token de actualización o null si no existe
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

/**
 * Actualiza el token de acceso usando el token de actualización
 * @returns {Promise} - Promise con el resultado de la operación
 */
export const refreshToken = async (api) => {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await api.post('/authentication/token/refresh/', { refresh });
    if (response.data && response.data.access) {
      localStorage.setItem('token', response.data.access);
      return response.data;
    }
    throw new Error('Failed to refresh token');
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};

export default {
  getToken,
  saveTokens,
  clearTokens,
  getRefreshToken,
  refreshToken
};
