import axios from 'axios';

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

// Interceptor para adicionar token de autenticação às requisições
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Se o erro é 401 (não autorizado) e não tentamos atualizar o token ainda
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Tentar atualizar o token
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await publicApi.post('/authentication/token/refresh/', { refresh: refreshToken });
        
        // Atualizar tokens no localStorage
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        // Atualizar o token na requisição original
        originalRequest.headers.Authorization = `Token ${response.data.access}`;
        
        // Tentar novamente a requisição original
        return api(originalRequest);
      } catch (refreshError) {
        // Se não conseguir atualizar o token, redirecionar para login
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Serviços para autenticação
export const authService = {
  login: (credentials) => publicApi.post('/authentication/token/', credentials),
  refreshToken: (refreshToken) => publicApi.post('/authentication/token/refresh/', { refresh: refreshToken }),
  register: (userData) => publicApi.post('/authentication/users/', userData),
  getProfile: () => api.get('/authentication/users/me/'),
  updateProfile: (data) => api.put('/authentication/users/me/', data),
  changePassword: (data) => api.post('/authentication/users/change-password/', data),
  resetPassword: (email) => publicApi.post('/authentication/password-reset/', { email }),
  verify2FA: (code, userId) => publicApi.post('/authentication/two-factor/verify/', { code, user_id: userId }),
};

// Serviços para secretaria
export const secretariaService = {
  // Membros
  getMembers: (params) => api.get('/secretaria/members/', { params }),
  getMember: (id) => api.get(`/secretaria/members/${id}/`),
  createMember: (data) => api.post('/secretaria/members/', data),
  updateMember: (id, data) => api.put(`/secretaria/members/${id}/`, data),
  deleteMember: (id) => api.delete(`/secretaria/members/${id}/`),
  
  // Cargos
  getOffices: () => api.get('/secretaria/offices/'),
  assignOffice: (memberId, data) => api.post(`/secretaria/members/${memberId}/assign-office/`, data),
  removeOffice: (memberId, officeId) => api.delete(`/secretaria/members/${memberId}/offices/${officeId}/`),
  
  // Presença
  getAttendance: (params) => api.get('/secretaria/attendance/', { params }),
  registerAttendance: (data) => api.post('/secretaria/attendance/', data),
  getAttendanceReport: (params) => api.get('/secretaria/attendance/report/', { params }),
  
  // Documentos
  getDocuments: (params) => api.get('/secretaria/documents/', { params }),
  getDocument: (id) => api.get(`/secretaria/documents/${id}/`),
  createDocument: (data) => api.post('/secretaria/documents/', data),
  updateDocument: (id, data) => api.put(`/secretaria/documents/${id}/`, data),
  deleteDocument: (id) => api.delete(`/secretaria/documents/${id}/`),
};

// Serviços para tesouraria
export const tesourariaService = {
  // Pagamentos
  getPayments: (params) => api.get('/tesouraria/payments/', { params }),
  getPayment: (id) => api.get(`/tesouraria/payments/${id}/`),
  createPayment: (data) => api.post('/tesouraria/payments/', data),
  updatePayment: (id, data) => api.put(`/tesouraria/payments/${id}/`, data),
  deletePayment: (id) => api.delete(`/tesouraria/payments/${id}/`),
  
  // Categorias
  getCategories: () => api.get('/tesouraria/categories/'),
  getCategory: (id) => api.get(`/tesouraria/categories/${id}/`),
  createCategory: (data) => api.post('/tesouraria/categories/', data),
  updateCategory: (id, data) => api.put(`/tesouraria/categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`/tesouraria/categories/${id}/`),
  
  // Relatórios
  getFinancialSummary: () => api.get('/tesouraria/summary/'),
  getFinancialReport: (params) => api.get('/tesouraria/reports/', { params }),
  exportFinancialReport: (params) => api.get('/tesouraria/reports/export/', { params, responseType: 'blob' }),
};

// Serviços para dashboard
export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary/'),
  getRecentActivity: () => api.get('/dashboard/activity/'),
  getMembershipStats: () => api.get('/dashboard/membership-stats/'),
  getFinancialStats: () => api.get('/dashboard/financial-stats/'),
  getAttendanceStats: () => api.get('/dashboard/attendance-stats/'),
};

export default api;
