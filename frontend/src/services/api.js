import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL;
const apiBaseURL = (configuredApiUrl || 'http://localhost:8000/api').replace(/\/+$/, '');
export const API_BASE_URL = apiBaseURL;
export const API_ORIGIN = apiBaseURL.replace(/\/api\/?$/, '');

export const assetUrl = (path) => {
    if (!path) return '/placeholder.jpg';
    if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
        return path;
    }

    const normalizedPath = String(path).replace(/^\/+/, '');
    return \`\${API_ORIGIN}/\${normalizedPath}\`;
};

const api = axios.create({
    baseURL: apiBaseURL,
    timeout: 20000,
    headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = \`Bearer \${token}\`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response?.status === 401
            && localStorage.getItem('token')
            && !['/login', '/register'].some((path) => error.config?.url?.includes(path))
        ) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        return Promise.reject(error);
    }
);

export default api;
