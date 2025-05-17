import axios from 'axios';
import { getToken } from './tokenService';
import tokenService from './tokenService';

// Configuración base de axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  async (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores y refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 (Unauthorized) y no hemos intentado refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Intentar refresh token
        await tokenService.refreshToken(api);
        
        // Reintentar la solicitud original con el nuevo token
        const token = getToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh token, redirigir a login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Servicios de dashboard
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats/'),
  getRecentActivities: () => api.get('/dashboard/activities/'),
  getUpcomingEvents: () => api.get('/dashboard/events/upcoming/'),
  getPendingPayments: () => api.get('/dashboard/payments/pending/'),
  getActiveMembers: () => api.get('/dashboard/members/active/'),
  getSystemStatus: () => api.get('/dashboard/system/status/'),
};

// Servicios de autenticación
export const authService = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  verify2FA: (code, userId) => api.post('/auth/verify-2fa/', { code, user_id: userId }),
  resetPassword: (email) => api.post('/auth/reset-password/', { email }),
  confirmResetPassword: (data) => api.post('/auth/confirm-reset-password/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
  setup2FA: () => api.post('/auth/setup-2fa/'),
  disable2FA: () => api.post('/auth/disable-2fa/'),
};

// Servicios de miembros
export const memberService = {
  getMembers: (params) => api.get('/members/', { params }),
  getMember: (id) => api.get(`/members/${id}/`),
  createMember: (data) => api.post('/members/', data),
  updateMember: (id, data) => api.put(`/members/${id}/`, data),
  deleteMember: (id) => api.delete(`/members/${id}/`),
  getMemberDegrees: () => api.get('/members/degrees/'),
  getMemberOffices: () => api.get('/members/offices/'),
  assignOffice: (memberId, officeId) => api.post(`/members/${memberId}/assign-office/`, { office_id: officeId }),
  removeOffice: (memberId, officeId) => api.post(`/members/${memberId}/remove-office/`, { office_id: officeId }),
  changeDegree: (memberId, degree) => api.post(`/members/${memberId}/change-degree/`, { degree }),
  uploadDocument: (memberId, data) => api.post(`/members/${memberId}/documents/`, data),
  getDocuments: (memberId) => api.get(`/members/${memberId}/documents/`),
  deleteDocument: (memberId, documentId) => api.delete(`/members/${memberId}/documents/${documentId}/`),
};

// Servicios de tesorería
export const treasuryService = {
  getPayments: (params) => api.get('/treasury/payments/', { params }),
  getPayment: (id) => api.get(`/treasury/payments/${id}/`),
  createPayment: (data) => api.post('/treasury/payments/', data),
  updatePayment: (id, data) => api.put(`/treasury/payments/${id}/`, data),
  deletePayment: (id) => api.delete(`/treasury/payments/${id}/`),
  getFeeTypes: () => api.get('/treasury/fee-types/'),
  createFeeType: (data) => api.post('/treasury/fee-types/', data),
  updateFeeType: (id, data) => api.put(`/treasury/fee-types/${id}/`, data),
  deleteFeeType: (id) => api.delete(`/treasury/fee-types/${id}/`),
  getFinancialReport: (params) => api.get('/treasury/reports/financial/', { params }),
  getMemberPaymentsReport: (memberId, params) => api.get(`/treasury/reports/member/${memberId}/`, { params }),
  getOverduePayments: () => api.get('/treasury/payments/overdue/'),
  sendPaymentReminder: (paymentId) => api.post(`/treasury/payments/${paymentId}/send-reminder/`),
  getMembersList: () => api.get('/members/list/'),
};

// Servicios de comunicaciones
export const communicationService = {
  getEvents: (params) => api.get('/communications/events/', { params }),
  getEvent: (id) => api.get(`/communications/events/${id}/`),
  createEvent: (data) => api.post('/communications/events/', data),
  updateEvent: (id, data) => api.put(`/communications/events/${id}/`, data),
  deleteEvent: (id) => api.delete(`/communications/events/${id}/`),
  respondToEvent: (eventId, response) => api.post(`/communications/events/${eventId}/respond/`, { response }),
  getEventResponses: (eventId) => api.get(`/communications/events/${eventId}/responses/`),
  getMessages: (params) => api.get('/communications/messages/', { params }),
  getConversation: (userId) => api.get(`/communications/messages/conversation/${userId}/`),
  sendMessage: (data) => api.post('/communications/messages/', data),
  markMessageAsRead: (messageId) => api.put(`/communications/messages/${messageId}/read/`),
  getNotifications: () => api.get('/communications/notifications/'),
  markNotificationAsRead: (notificationId) => api.put(`/communications/notifications/${notificationId}/read/`),
  markAllNotificationsAsRead: () => api.put('/communications/notifications/read-all/'),
  getUnreadCount: () => api.get('/communications/notifications/unread-count/'),
};

// Servicios de biblioteca
export const libraryService = {
  getDocuments: (params) => api.get('/library/documents/', { params }),
  getDocument: (id) => api.get(`/library/documents/${id}/`),
  createDocument: (data) => api.post('/library/documents/', data),
  updateDocument: (id, data) => api.put(`/library/documents/${id}/`, data),
  deleteDocument: (id) => api.delete(`/library/documents/${id}/`),
  getCategories: () => api.get('/library/categories/'),
  createCategory: (data) => api.post('/library/categories/', data),
  updateCategory: (id, data) => api.put(`/library/categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`/library/categories/${id}/`),
  searchDocuments: (query) => api.get('/library/documents/search/', { params: { query } }),
  downloadDocument: (id) => api.get(`/library/documents/${id}/download/`, { responseType: 'blob' }),
  uploadDocument: (formData) => api.post('/library/documents/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Servicios de rituales
export const ritualService = {
  getRituals: (params) => api.get('/rituals/', { params }),
  getRitual: (id) => api.get(`/rituals/${id}/`),
  createRitual: (data) => api.post('/rituals/', data),
  updateRitual: (id, data) => api.put(`/rituals/${id}/`, data),
  deleteRitual: (id) => api.delete(`/rituals/${id}/`),
  getOfficerRoles: () => api.get('/rituals/officer-roles/'),
  getMembers: () => api.get('/members/list/'),
  getRitualDocuments: (ritualId) => api.get(`/rituals/${ritualId}/documents/`),
  uploadRitualDocument: (ritualId, data) => api.post(`/rituals/${ritualId}/documents/`, data),
  deleteRitualDocument: (ritualId, documentId) => api.delete(`/rituals/${ritualId}/documents/${documentId}/`),
  confirmAttendance: (ritualId, status) => api.post(`/rituals/${ritualId}/confirm-attendance/`, { status }),
  getAttendanceList: (ritualId) => api.get(`/rituals/${ritualId}/attendance/`),
};

// Servicios de administración
export const adminService = {
  getUsers: (params) => api.get('/admin/users/', { params }),
  getUser: (id) => api.get(`/admin/users/${id}/`),
  createUser: (data) => api.post('/admin/users/', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}/`),
  getSystemSettings: () => api.get('/admin/settings/'),
  updateSystemSettings: (data) => api.put('/admin/settings/', data),
  getAuditLogs: (params) => api.get('/admin/audit-logs/', { params }),
  getSystemStats: () => api.get('/admin/stats/'),
  backupDatabase: () => api.post('/admin/backup/'),
  restoreDatabase: (data) => api.post('/admin/restore/', data),
  sendTestEmail: (email) => api.post('/admin/send-test-email/', { email }),
};

export default api;
