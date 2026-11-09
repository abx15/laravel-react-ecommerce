import axios from 'axios';

const trimTrailingSlashes = (value) => {
    let result = value;
    while (result.endsWith('/')) result = result.slice(0, -1);
    return result;
};

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = trimTrailingSlashes(configuredApiUrl || 'http://localhost:8000/api');
export const API_ORIGIN = API_BASE_URL.endsWith('/api')
    ? API_BASE_URL.slice(0, -4)
    : API_BASE_URL;

export const assetUrl = (path) => {
    if (!path) return '/placeholder.jpg';
    if (
        path.startsWith('https://')
        || path.startsWith('http://')
        || path.startsWith('//')
        || path.startsWith('data:')
        || path.startsWith('blob:')
    ) return path;

    let normalizedPath = String(path);
    while (normalizedPath.startsWith('/')) normalizedPath = normalizedPath.slice(1);
    return API_ORIGIN + '/' + normalizedPath;
};

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 20000,
    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use((response) => response, (error) => {
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
});

export default api;
