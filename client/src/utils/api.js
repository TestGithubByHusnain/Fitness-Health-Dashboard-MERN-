import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any request headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

export const workoutAPI = {
  getAll: (params) => api.get('/workouts', { params }),
  create: (workoutData) => api.post('/workouts', workoutData),
  update: (id, workoutData) => api.put(`/workouts/${id}`, workoutData),
  delete: (id) => api.delete(`/workouts/${id}`),
  getStats: (params) => api.get('/workouts/stats', { params }),
};

export const nutritionAPI = {
  getAll: (params) => api.get('/nutrition', { params }),
  create: (nutritionData) => api.post('/nutrition', nutritionData),
  update: (id, nutritionData) => api.put(`/nutrition/${id}`, nutritionData),
  delete: (id) => api.delete(`/nutrition/${id}`),
  getStats: (params) => api.get('/nutrition/stats', { params }),
};

export const waterAPI = {
  getAll: (params) => api.get('/water', { params }),
  create: (waterData) => api.post('/water', waterData),
  update: (id, waterData) => api.put(`/water/${id}`, waterData),
  delete: (id) => api.delete(`/water/${id}`),
  getToday: () => api.get('/water/today'),
  getStats: (params) => api.get('/water/stats', { params }),
};

export const profileAPI = {
  update: (profileData) => api.put('/profile', profileData),
  updatePassword: (passwordData) => api.put('/profile/password', passwordData),
  getStats: () => api.get('/profile/stats'),
};

export default api; 