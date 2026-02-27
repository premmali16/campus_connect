import axios from 'axios';

/**
 * Axios instance configured for the Campus Connect API
 * Automatically attaches JWT token and handles auth errors
 */
const API = axios.create({
    baseURL: 'https://campus-connect-fktx.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - attach token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if not already on auth pages
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;
