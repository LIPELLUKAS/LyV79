import axios from 'axios';

// Crear una instancia de axios con la configuración base
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación a las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 (No autorizado) y no hemos intentado refrescar el token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Intentar refrescar el token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post('/api/auth/token/refresh/', {
          refresh: refreshToken
        });
        
        // Guardar el nuevo token
        localStorage.setItem('token', response.data.access);
        
        // Actualizar el header y reintentar la solicitud original
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si no se puede refrescar el token, redirigir al login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/token/', { username, password });
    localStorage.setItem('token', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },
  
  register: async (userData) => {
    return await api.post('/auth/register/', userData);
  },
  
  forgotPassword: async (email) => {
    return await api.post('/auth/password-reset/', { email });
  },
  
  resetPassword: async (token, password) => {
    return await api.post('/auth/password-reset/confirm/', { token, password });
  },
  
  getCurrentUser: async () => {
    return await api.get('/auth/user/');
  },
  
  updateProfile: async (userData) => {
    return await api.put('/auth/user/', userData);
  },
  
  setup2FA: async () => {
    return await api.post('/auth/2fa/setup/');
  },
  
  verify2FA: async (code) => {
    return await api.post('/auth/2fa/verify/', { code });
  },
  
  disable2FA: async () => {
    return await api.post('/auth/2fa/disable/');
  }
};

// Servicios de miembros
export const memberService = {
  getAllMembers: async (params) => {
    return await api.get('/members/', { params });
  },
  
  getMember: async (id) => {
    return await api.get(`/members/${id}/`);
  },
  
  createMember: async (memberData) => {
    return await api.post('/members/', memberData);
  },
  
  updateMember: async (id, memberData) => {
    return await api.put(`/members/${id}/`, memberData);
  },
  
  deleteMember: async (id) => {
    return await api.delete(`/members/${id}/`);
  },
  
  getMemberDocuments: async (id) => {
    return await api.get(`/members/${id}/documents/`);
  },
  
  uploadMemberDocument: async (id, documentData) => {
    const formData = new FormData();
    for (const key in documentData) {
      formData.append(key, documentData[key]);
    }
    return await api.post(`/members/${id}/documents/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getMemberProgress: async (id) => {
    return await api.get(`/members/${id}/progress/`);
  },
  
  updateMemberProgress: async (id, progressData) => {
    return await api.post(`/members/${id}/progress/`, progressData);
  },
  
  getMemberAttendance: async (id, params) => {
    return await api.get(`/members/${id}/attendance/`, { params });
  }
};

// Servicios de tesorería
export const treasuryService = {
  getAllFees: async (params) => {
    return await api.get('/treasury/fees/', { params });
  },
  
  getFee: async (id) => {
    return await api.get(`/treasury/fees/${id}/`);
  },
  
  createFee: async (feeData) => {
    return await api.post('/treasury/fees/', feeData);
  },
  
  updateFee: async (id, feeData) => {
    return await api.put(`/treasury/fees/${id}/`, feeData);
  },
  
  deleteFee: async (id) => {
    return await api.delete(`/treasury/fees/${id}/`);
  },
  
  getAllPayments: async (params) => {
    return await api.get('/treasury/payments/', { params });
  },
  
  getPayment: async (id) => {
    return await api.get(`/treasury/payments/${id}/`);
  },
  
  createPayment: async (paymentData) => {
    return await api.post('/treasury/payments/', paymentData);
  },
  
  updatePayment: async (id, paymentData) => {
    return await api.put(`/treasury/payments/${id}/`, paymentData);
  },
  
  markPaymentAsCompleted: async (id) => {
    return await api.post(`/treasury/payments/${id}/complete/`);
  },
  
  getAllInvoices: async (params) => {
    return await api.get('/treasury/invoices/', { params });
  },
  
  getInvoice: async (id) => {
    return await api.get(`/treasury/invoices/${id}/`);
  },
  
  createInvoice: async (invoiceData) => {
    return await api.post('/treasury/invoices/', invoiceData);
  },
  
  getFinancialReports: async (params) => {
    return await api.get('/treasury/reports/', { params });
  },
  
  generateFinancialReport: async (reportData) => {
    return await api.post('/treasury/reports/generate/', reportData);
  }
};

// Servicios de comunicaciones
export const communicationsService = {
  getAllEvents: async (params) => {
    return await api.get('/communications/events/', { params });
  },
  
  getEvent: async (id) => {
    return await api.get(`/communications/events/${id}/`);
  },
  
  createEvent: async (eventData) => {
    return await api.post('/communications/events/', eventData);
  },
  
  updateEvent: async (id, eventData) => {
    return await api.put(`/communications/events/${id}/`, eventData);
  },
  
  deleteEvent: async (id) => {
    return await api.delete(`/communications/events/${id}/`);
  },
  
  markEventAsCompleted: async (id) => {
    return await api.post(`/communications/events/${id}/mark_as_completed/`);
  },
  
  cancelEvent: async (id) => {
    return await api.post(`/communications/events/${id}/cancel/`);
  },
  
  getEventAttendees: async (id) => {
    return await api.get(`/communications/events/${id}/attendees/`);
  },
  
  getAllNotifications: async (params) => {
    return await api.get('/communications/notifications/', { params });
  },
  
  getNotification: async (id) => {
    return await api.get(`/communications/notifications/${id}/`);
  },
  
  createNotification: async (notificationData) => {
    return await api.post('/communications/notifications/', notificationData);
  },
  
  markNotificationAsRead: async (id) => {
    return await api.post(`/communications/notifications/${id}/mark_as_read/`);
  },
  
  getAllMessages: async (params) => {
    return await api.get('/communications/messages/', { params });
  },
  
  getMessage: async (id) => {
    return await api.get(`/communications/messages/${id}/`);
  },
  
  sendMessage: async (messageData) => {
    return await api.post('/communications/messages/', messageData);
  },
  
  starMessage: async (id) => {
    return await api.post(`/communications/messages/${id}/star/`);
  },
  
  unstarMessage: async (id) => {
    return await api.post(`/communications/messages/${id}/unstar/`);
  },
  
  archiveMessage: async (id) => {
    return await api.post(`/communications/messages/${id}/archive/`);
  },
  
  unarchiveMessage: async (id) => {
    return await api.post(`/communications/messages/${id}/unarchive/`);
  },
  
  getAllCalendars: async (params) => {
    return await api.get('/communications/calendars/', { params });
  },
  
  getCalendar: async (id) => {
    return await api.get(`/communications/calendars/${id}/`);
  },
  
  createCalendar: async (calendarData) => {
    return await api.post('/communications/calendars/', calendarData);
  },
  
  addEventToCalendar: async (id, eventData) => {
    return await api.post(`/communications/calendars/${id}/add_event/`, eventData);
  }
};

// Servicios de planificación ritual
export const ritualsService = {
  getAllRitualPlans: async (params) => {
    return await api.get('/rituals/plans/', { params });
  },
  
  getRitualPlan: async (id) => {
    return await api.get(`/rituals/plans/${id}/`);
  },
  
  createRitualPlan: async (planData) => {
    return await api.post('/rituals/plans/', planData);
  },
  
  updateRitualPlan: async (id, planData) => {
    return await api.put(`/rituals/plans/${id}/`, planData);
  },
  
  approveRitualPlan: async (id) => {
    return await api.post(`/rituals/plans/${id}/approve/`);
  },
  
  markRitualPlanAsCompleted: async (id) => {
    return await api.post(`/rituals/plans/${id}/mark_as_completed/`);
  },
  
  cancelRitualPlan: async (id) => {
    return await api.post(`/rituals/plans/${id}/cancel/`);
  },
  
  getRitualRoles: async (planId) => {
    return await api.get(`/rituals/plans/${planId}/roles/`);
  },
  
  addRitualRole: async (planId, roleData) => {
    return await api.post(`/rituals/plans/${planId}/add_role/`, roleData);
  },
  
  assignRitualRole: async (roleId, userId) => {
    return await api.post(`/rituals/roles/${roleId}/assign/`, { user_id: userId });
  },
  
  confirmRitualRole: async (roleId) => {
    return await api.post(`/rituals/roles/${roleId}/confirm/`);
  },
  
  getRitualWorks: async (planId) => {
    return await api.get(`/rituals/plans/${planId}/works/`);
  },
  
  addRitualWork: async (planId, workData) => {
    return await api.post(`/rituals/plans/${planId}/add_work/`, workData);
  },
  
  updateRitualWorkStatus: async (workId, status) => {
    return await api.post(`/rituals/works/${workId}/update_status/`, { status });
  },
  
  getRitualAttachments: async (planId) => {
    return await api.get(`/rituals/plans/${planId}/attachments/`);
  },
  
  addRitualAttachment: async (planId, attachmentData) => {
    const formData = new FormData();
    for (const key in attachmentData) {
      formData.append(key, attachmentData[key]);
    }
    return await api.post(`/rituals/plans/${planId}/add_attachment/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

// Servicios de biblioteca digital
export const libraryService = {
  getAllCategories: async (params) => {
    return await api.get('/library/categories/', { params });
  },
  
  getCategory: async (id) => {
    return await api.get(`/library/categories/${id}/`);
  },
  
  createCategory: async (categoryData) => {
    return await api.post('/library/categories/', categoryData);
  },
  
  updateCategory: async (id, categoryData) => {
    return await api.put(`/library/categories/${id}/`, categoryData);
  },
  
  deleteCategory: async (id) => {
    return await api.delete(`/library/categories/${id}/`);
  },
  
  getCategoryDocuments: async (id) => {
    return await api.get(`/library/categories/${id}/documents/`);
  },
  
  getAllDocuments: async (params) => {
    return await api.get('/library/documents/', { params });
  },
  
  getDocument: async (id) => {
    return await api.get(`/library/documents/${id}/`);
  },
  
  uploadDocument: async (documentData) => {
    const formData = new FormData();
    for (const key in documentData) {
      formData.append(key, documentData[key]);
    }
    return await api.post('/library/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  updateDocument: async (id, documentData) => {
    const formData = new FormData();
    for (const key in documentData) {
      formData.append(key, documentData[key]);
    }
    return await api.put(`/library/documents/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deleteDocument: async (id) => {
    return await api.delete(`/library/documents/${id}/`);
  },
  
  downloadDocument: async (id) => {
    return await api.post(`/library/documents/${id}/download/`);
  },
  
  addDocumentComment: async (id, commentData) => {
    return await api.post(`/library/documents/${id}/add_comment/`, commentData);
  },
  
  rateDocument: async (id, rating) => {
    return await api.post(`/library/documents/${id}/rate/`, { rating });
  },
  
  toggleFeaturedDocument: async (id) => {
    return await api.post(`/library/documents/${id}/toggle_featured/`);
  }
};

// Servicios de administración
export const adminService = {
  getLodgeConfiguration: async () => {
    return await api.get('/core/configuration/current/');
  },
  
  updateLodgeConfiguration: async (configData) => {
    const formData = new FormData();
    for (const key in configData) {
      formData.append(key, configData[key]);
    }
    return await api.put('/core/configuration/1/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getSystemLogs: async (params) => {
    return await api.get('/core/logs/', { params });
  },
  
  addSystemLog: async (logData) => {
    return await api.post('/core/logs/add_log/', logData);
  },
  
  getBackupConfiguration: async () => {
    return await api.get('/core/backup-configuration/current/');
  },
  
  updateBackupConfiguration: async (configData) => {
    return await api.put('/core/backup-configuration/1/', configData);
  },
  
  getAllBackups: async (params) => {
    return await api.get('/core/backups/', { params });
  },
  
  createBackup: async () => {
    return await api.post('/core/backups/create_backup/');
  },
  
  restoreBackup: async (id) => {
    return await api.post(`/core/backups/${id}/restore/`);
  },
  
  getSystemHealth: async () => {
    return await api.get('/core/health/current/');
  },
  
  getSystemHealthSummary: async () => {
    return await api.get('/core/health/summary/');
  }
};

export default api;
