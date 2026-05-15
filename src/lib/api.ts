import axios from 'axios';

// NEXT_PUBLIC_API_URL must be set in Vercel environment variables.
// Uses production URL from environment
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
});


// Attach JWT from localStorage
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('crick_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('crick_token');
            localStorage.removeItem('crick_user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authAPI = {
    register: (data: object) => api.post('/auth/register', data),
    login: (data: object) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
};

// ─── Uploads ──────────────────────────────────────────────────────────────
export const uploadsAPI = {
    upload: (formData: FormData) =>
        api.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    list: () => api.get('/uploads'),
    getOne: (id: string) => api.get(`/uploads/${id}`),
    retryAnalysis: (id: string) => api.post(`/uploads/${id}/retry`),
};

// ─── Reports ──────────────────────────────────────────────────────────────
export const reportsAPI = {
    list: () => api.get('/reports'),
    getOne: (id: string) => api.get(`/reports/${id}`),
    byUpload: (uploadId: string) => api.get(`/reports/by-upload/${uploadId}`),
};

// ─── Progress ─────────────────────────────────────────────────────────────
export const progressAPI = {
    getAll: (type?: string) => api.get('/progress', { params: type ? { type } : {} }),
    getSummary: () => api.get('/progress/summary'),
    getMatchEntries: (limit = 20) => api.get('/progress/match-performance', { params: { limit } }),
    analyzeMatchGrowth: () => api.get('/progress/match-performance/analysis'),
    submitMatchPerformance: (data: object) => api.post('/progress/match-performance', data),
};

// ─── Live Matches & Tournaments ───────────────────────────────────────────
export const matchesAPI = {
    list: (params?: object) => api.get('/matches', { params }),
    getOne: (id: string) => api.get(`/matches/${id}`),
};

export const tournamentsAPI = {
    list: (params?: object) => api.get('/tournaments', { params }),
    discover: (params?: { location?: string; latitude?: number; longitude?: number; radiusKm?: number }) =>
        api.get('/tournaments/discover', { params: params || {} }),
};

// ─── Equipment ────────────────────────────────────────────────────────────
export const equipmentAPI = {
    get: (level?: string) => api.get('/equipment', { params: level ? { level } : {} }),
};

// ─── Academy ──────────────────────────────────────────────────────────────
export const academyAPI = {
    getPlayers: () => api.get('/academy/players'),
    getPlayer: (id: string) => api.get(`/academy/players/${id}`),
    getLeaderboard: () => api.get('/academy/leaderboard'),
};

// ─── Chatbot ──────────────────────────────────────────────────────────────
export const chatbotAPI = {
    send: (message: string, history: object[]) => api.post('/chatbot', { message, history }),
};

// ─── Users ────────────────────────────────────────────────────────────────
export const usersAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data: object) => api.put('/users/profile', data),
    changePassword: (data: object) => api.put('/users/change-password', data),
};

// ─── Admin ────────────────────────────────────────────────────────────────
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    // Users
    getUsers: (params?: object) => api.get('/admin/users', { params }),
    getUser: (id: string) => api.get(`/admin/users/${id}`),
    updateUser: (id: string, data: object) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
    // Uploads
    getUploads: (params?: object) => api.get('/admin/uploads', { params }),
    deleteUpload: (id: string) => api.delete(`/admin/uploads/${id}`),
    // Reports
    getReports: (params?: object) => api.get('/admin/reports', { params }),
    deleteReport: (id: string) => api.delete(`/admin/reports/${id}`),
    // DB
    getCollections: () => api.get('/admin/db/collections'),
};

export default api;
