import axios from 'axios';
import { getToken, refreshToken } from './tokenService';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación a las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

// Servicios para autenticación
export const authService = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/'),
  forgotPassword: (email) => api.post('/auth/password-reset/', { email }),
  resetPassword: (data) => api.post('/auth/password-reset/confirm/', data),
  verifyToken: (token) => api.post('/auth/token/verify/', { token }),
  getCurrentUser: () => api.get('/auth/user/'),
  updateProfile: (userData) => api.put('/auth/user/', userData),
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
};

// Servicios para tesorería
export const treasuryService = {
  // Transacciones (ingresos y gastos)
  getTransactions: (params) => api.get('/treasury/transactions/', { params }),
  getTransaction: (id) => api.get(`/treasury/transactions/${id}/`),
  createTransaction: (data) => api.post('/treasury/transactions/', data),
  updateTransaction: (id, data) => api.put(`/treasury/transactions/${id}/`, data),
  deleteTransaction: (id) => api.delete(`/treasury/transactions/${id}/`),
  downloadReceipt: (id) => api.get(`/treasury/transactions/${id}/receipt/`, { responseType: 'blob' }),
  
  // Categorías de transacciones
  getTransactionCategories: (type) => api.get(`/treasury/categories/?type=${type}`),
  getAllTransactionCategories: () => api.get('/treasury/categories/'),
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
