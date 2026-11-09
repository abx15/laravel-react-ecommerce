import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext({
    user: null,
    token: null,
    login: async () => {},
    register: async () => {},
    logout: async () => {},
    loading: true,
    updateUser: () => {},
});

const getDashboardPath = (user) => {
    const roles = user?.roles || [];
    const roleNames = roles.map((role) => typeof role === 'string' ? role : role.name);
    if (roleNames.includes('super_admin')) return '/super-admin';
    if (roleNames.includes('admin')) return '/admin';
    if (roleNames.includes('seller')) return '/seller/dashboard';
    return '/dashboard';
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const clearSession = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    }, []);

    useEffect(() => {
        let active = true;

        const handleUnauthorized = () => {
            if (!active) return;
            clearSession();
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);

        const restoreSession = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                if (active) setLoading(false);
                return;
            }

            try {
                const response = await api.get('/user');
                if (!active) return;
                const userData = response.data?.data;
                if (!userData) throw new Error('Invalid user response');
                setUser(userData);
                setToken(storedToken);
                localStorage.setItem('user', JSON.stringify(userData));
            } catch {
                if (active) clearSession();
            } finally {
                if (active) setLoading(false);
            }
        };

        restoreSession();

        return () => {
            active = false;
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
    }, [clearSession]);

    const login = async (email, password) => {
        const response = await api.post('/login', { email, password });
        if (!response.data?.success || !response.data?.data?.token || !response.data?.data?.user) {
            throw new Error(response.data?.message || 'Unable to sign in.');
        }

        const { token: accessToken, user: userData } = response.data.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(accessToken);
        setUser(userData);
        navigate(getDashboardPath(userData), { replace: true });
        return response.data;
    };

    const register = async (data) => {
        const response = await api.post('/register', data);
        if (!response.data?.success || !response.data?.data?.token || !response.data?.data?.user) {
            throw new Error(response.data?.message || 'Unable to create your account.');
        }

        const { token: accessToken, user: userData } = response.data.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(accessToken);
        setUser(userData);
        navigate(getDashboardPath(userData), { replace: true });
        return response.data;
    };

    const logout = async () => {
        try {
            if (localStorage.getItem('token')) await api.post('/logout');
        } finally {
            clearSession();
            navigate('/login', { replace: true });
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading, updateUser: setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
