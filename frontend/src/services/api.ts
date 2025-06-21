import axios from 'axios';

const backendRoot = process.env.REACT_APP_API_URL || '';

console.log('API Base URL:', `${backendRoot}/api`); // For debugging

const api = axios.create({
  baseURL: `${backendRoot}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear localStorage and redirect to login
      localStorage.removeItem('jwt');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api; 