import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({
    user: null,
    token: null,
    login: async () => { },
    register: async () => { },
    logout: async () => { },
    loading: true,
    updateUser: () => { }
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Validate token and fetch user
            api.defaults.headers.Authorization = `Bearer ${token}`; // Ensure axios has token
            api.get('/user')
                .then(res => {
                    setUser(res.data.data);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        const res = await api.post('/login', { email, password });
        if (res.data.success) {
            localStorage.setItem('token', res.data.data.token);
            setToken(res.data.data.token);
            setUser(res.data.data.user);
            return res.data;
        }
    };

    const register = async (data) => {
        const res = await api.post('/register', data);
        if (res.data.success) {
            localStorage.setItem('token', res.data.data.token);
            setToken(res.data.data.token);
            setUser(res.data.data.user);
            return res.data;
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            console.error(e);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading, updateUser: setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
