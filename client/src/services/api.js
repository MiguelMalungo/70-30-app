import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Token helpers ──────────────────────────────────────────────
export const getAccessToken = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const setTokens = (access, refresh) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
};

export const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

// ── Request interceptor: attach Bearer token ───────────────────
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor: auto-refresh on 401 ──────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't try to refresh if this IS the refresh or login request
            if (originalRequest.url?.includes('/auth/login')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refresh = getRefreshToken();
            if (!refresh) {
                isRefreshing = false;
                clearTokens();
                // In dev mode with no token (e.g. devLogin bypass), don't hard-redirect
                if (!import.meta.env.DEV) {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post(`${API_BASE_URL}/auth/login/refresh/`, {
                    refresh,
                });
                setTokens(data.access, refresh);
                processQueue(null, data.access);
                originalRequest.headers.Authorization = `Bearer ${data.access}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearTokens();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// ── Auth API ───────────────────────────────────────────────────
export const authAPI = {
    register: (userData) => api.post('/auth/register/', userData),
    login: (credentials) => api.post('/auth/login/', credentials),
    logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),
    refreshToken: (refresh) => api.post('/auth/login/refresh/', { refresh }),
};

// ── Profile API ────────────────────────────────────────────────
export const profileAPI = {
    getMe: () => api.get('/auth/profile/me/'),
    updateMe: (data) => api.patch('/auth/profile/me/', data),
    updateLocation: (latitude, longitude) =>
        api.patch('/auth/profile/location/', { latitude, longitude }),
};

// ── Skills API ─────────────────────────────────────────────────
export const skillsAPI = {
    getCategories: () => api.get('/skills/categories/'),
    getSkills: () => api.get('/skills/skills/'),
    getUserSkills: () => api.get('/skills/user-skills/'),
    addUserSkill: (data) => api.post('/skills/user-skills/', data),
};

// ── Mentor Search API ─────────────────────────────────────────
export const mentorSearchAPI = {
    search: (params) => api.get('/mentors/search/', { params }),
    byCategory: (categorySlug) => api.get('/mentors/search/', { params: { category_slug: categorySlug } }),
    bySkill: (skillId) => api.get('/mentors/search/', { params: { skill_id: skillId } }),
};

// ── Bookings API ───────────────────────────────────────────────
export const bookingsAPI = {
    list: () => api.get('/bookings/'),
    create: (data) => api.post('/bookings/', data),
    get: (id) => api.get(`/bookings/${id}/`),
    update: (id, data) => api.patch(`/bookings/${id}/`, data),
    cancel: (id) => api.post(`/bookings/${id}/cancel/`),
    accept: (id) => api.post(`/bookings/${id}/accept/`),
    reject: (id) => api.post(`/bookings/${id}/reject/`),
};

// ── Reviews API ────────────────────────────────────────────────
export const reviewsAPI = {
    list: () => api.get('/reviews/'),
    create: (data) => api.post('/reviews/', data),
    get: (id) => api.get(`/reviews/${id}/`),
};

export default api;
