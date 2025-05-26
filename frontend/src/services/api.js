import axios from 'axios';
import { getToken, refreshToken } from './tokenService';

// Criar instância pública de axios para endpoints que não requerem autenticação
export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Criar instância de axios com configuração base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación a las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 (no autorizado) y no hemos intentado refrescar el token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Intentar refrescar el token
        await refreshToken();
        
        // Actualizar el token en la petición original
        const token = getToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        // Reintentar la petición original
        return api(originalRequest);
      } catch (refreshError) {
        // Si no se puede refrescar el token, redirigir al login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Servicios para configuración del sistema (accesibles sin autenticación)
export const configService = {
  getConfig: () => publicApi.get('/core/configuration/'),
  updateConfig: (data) => api.put('/core/configuration/', data),
};

// Servicios para autenticación
export const authService = {
  login: (credentials) => api.post('/authentication/token/', credentials),
  refreshToken: (refreshToken) => api.post('/authentication/token/refresh/', { refresh: refreshToken }),
  register: (userData) => api.post('/authentication/users/', userData),
  getProfile: () => api.get('/authentication/users/me/'),
  updateProfile: (data) => api.put('/authentication/users/me/', data),
  changePassword: (data) => api.post('/authentication/users/change-password/', data),
  resetPassword: (email) => api.post('/authentication/password-reset/', { email }),
  confirmResetPassword: (data) => api.post('/authentication/password-reset/confirm/', data),
  setup2FA: () => api.get('/authentication/two-factor/setup/'),
  verify2FA: (code, userId) => api.post('/authentication/two-factor/verify/', { code, user_id: userId }),
  disable2FA: () => api.post('/authentication/two-factor/disable/'),
};

// Servicios para miembros
export const memberService = {
  getMembers: (params) => api.get('/members/', { params }),
  getMember: (id) => api.get(`/members/${id}/`),
  createMember: (data) => api.post('/members/', data),
  updateMember: (id, data) => api.put(`/members/${id}/`, data),
  deleteMember: (id) => api.delete(`/members/${id}/`),
  getMemberDegrees: () => api.get('/members/degrees/'),
  getMemberOffices: () => api.get('/members/offices/'),
  assignOffice: (memberId, data) => api.post(`/members/${memberId}/assign-office/`, data),
  removeOffice: (memberId, officeId) => api.delete(`/members/${memberId}/remove-office/${officeId}/`),
  changeDegree: (memberId, data) => api.post(`/members/${memberId}/change-degree/`, data),
  getMemberAttendance: (memberId, params) => api.get(`/members/${memberId}/attendance/`, { params }),
  getMemberPayments: (memberId, params) => api.get(`/members/${memberId}/payments/`, { params }),
};

// Servicios para tesorería
export const treasuryService = {
  // Categorías
  getCategories: () => api.get('/treasury/categories/'),
  getCategory: (id) => api.get(`/treasury/categories/${id}/`),
  createCategory: (data) => api.post('/treasury/categories/', data),
  updateCategory: (id, data) => api.put(`/treasury/categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`/treasury/categories/${id}/`),
  
  // Pagos de cuotas
  getPayments: (params) => api.get('/treasury/payments/', { params }),
  getPayment: (id) => api.get(`/treasury/payments/${id}/`),
  createPayment: (data) => api.post('/treasury/payments/', data),
  updatePayment: (id, data) => api.put(`/treasury/payments/${id}/`, data),
  deletePayment: (id) => api.delete(`/treasury/payments/${id}/`),
  sendPaymentReminder: (id) => api.post(`/treasury/payments/${id}/send-reminder/`),
  
  // Tipos de cuotas
  getFeeTypes: () => api.get('/treasury/fee-types/'),
  createFeeType: (data) => api.post('/treasury/fee-types/', data),
  updateFeeType: (id, data) => api.put(`/treasury/fee-types/${id}/`, data),
  deleteFeeType: (id) => api.delete(`/treasury/fee-types/${id}/`),
  
  // Reportes financieros
  getFinancialSummary: () => api.get('/treasury/summary/'),
  getRecentTransactions: () => api.get('/treasury/transactions/recent/'),
  getFinancialReport: (params) => api.get('/treasury/reports/', { params }),
  exportFinancialReport: (params) => api.get('/treasury/reports/export/', { params, responseType: 'blob' }),
  
  // Utilidades
  getMembersList: () => api.get('/members/list/'), // Lista simplificada para selects
};

// Servicios para comunicaciones
export const communicationService = {
  getMessages: (params) => api.get('/communications/messages/', { params }),
  getMessage: (id) => api.get(`/communications/messages/${id}/`),
  sendMessage: (data) => api.post('/communications/messages/', data),
  deleteMessage: (id) => api.delete(`/communications/messages/${id}/`),
  markAsRead: (id) => api.put(`/communications/messages/${id}/read/`),
  getAnnouncements: (params) => api.get('/communications/announcements/', { params }),
  getAnnouncement: (id) => api.get(`/communications/announcements/${id}/`),
  createAnnouncement: (data) => api.post('/communications/announcements/', data),
  updateAnnouncement: (id, data) => api.put(`/communications/announcements/${id}/`, data),
  deleteAnnouncement: (id) => api.delete(`/communications/announcements/${id}/`),
};

// Servicios para rituales
export const ritualService = {
  getRituals: (params) => api.get('/rituals/', { params }),
  getRitual: (id) => api.get(`/rituals/${id}/`),
  createRitual: (data) => api.post('/rituals/', data),
  updateRitual: (id, data) => api.put(`/rituals/${id}/`, data),
  deleteRitual: (id) => api.delete(`/rituals/${id}/`),
  getRitualTypes: () => api.get('/rituals/types/'),
  getRitualRoles: () => api.get('/rituals/roles/'),
  assignRole: (ritualId, data) => api.post(`/rituals/${ritualId}/assign-role/`, data),
  removeRole: (ritualId, roleId) => api.delete(`/rituals/${ritualId}/remove-role/${roleId}/`),
};

// Servicios para biblioteca
export const libraryService = {
  getDocuments: (params) => api.get('/library/documents/', { params }),
  getDocument: (id) => api.get(`/library/documents/${id}/`),
  createDocument: (data) => api.post('/library/documents/', data),
  updateDocument: (id, data) => api.put(`/library/documents/${id}/`, data),
  deleteDocument: (id) => api.delete(`/library/documents/${id}/`),
  downloadDocument: (id) => api.get(`/library/documents/${id}/download/`, { responseType: 'blob' }),
  getCategories: () => api.get('/library/categories/'),
  createCategory: (data) => api.post('/library/categories/', data),
  updateCategory: (id, data) => api.put(`/library/categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`/library/categories/${id}/`),
};

// Servicios para dashboard
export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary/'),
  getRecentActivity: () => api.get('/dashboard/activity/'),
  getUpcomingEvents: () => api.get('/dashboard/events/'),
  getMembershipStats: () => api.get('/dashboard/membership-stats/'),
  getFinancialStats: () => api.get('/dashboard/financial-stats/'),
  getAttendanceStats: () => api.get('/dashboard/attendance-stats/'),
};

// Servicios para administración
export const adminService = {
  getSystemSettings: () => api.get('/admin/settings/'),
  updateSystemSettings: (data) => api.put('/admin/settings/', data),
  getLogs: (params) => api.get('/admin/logs/', { params }),
  getBackups: () => api.get('/admin/backups/'),
  createBackup: () => api.post('/admin/backups/'),
  restoreBackup: (id) => api.post(`/admin/backups/${id}/restore/`),
  deleteBackup: (id) => api.delete(`/admin/backups/${id}/`),
  getUsers: (params) => api.get('/admin/users/', { params }),
  getUser: (id) => api.get(`/admin/users/${id}/`),
  createUser: (data) => api.post('/admin/users/', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}/`),
  getRoles: () => api.get('/admin/roles/'),
  getPermissions: () => api.get('/admin/permissions/'),
};

export default api;
