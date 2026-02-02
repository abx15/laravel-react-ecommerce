import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            // Validate token and fetch user
            api.defaults.headers.Authorization = `Bearer ${token}`;
            api.get('/user')
                .then(res => {
                    const userData = res.data.data;
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                    // Auto-redirect based on role
                    const userRole = userData.roles?.[0]?.name;
                    if (userRole) {
                        switch (userRole) {
                            case 'super_admin':
                                navigate('/super-admin');
                                break;
                            case 'admin':
                                navigate('/admin');
                                break;
                            case 'seller':
                                navigate('/seller/dashboard');
                                break;
                            case 'user':
                                navigate('/dashboard');
                                break;
                            default:
                                navigate('/');
                        }
                    }
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token, navigate]);

    const login = async (email, password) => {
        const res = await api.post('/login', { email, password });
        if (res.data.success) {
            localStorage.setItem('token', res.data.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.data.user));
            setToken(res.data.data.token);
            setUser(res.data.data.user);
            
            // Redirect based on role
            const userRole = res.data.data.user.roles?.[0]?.name;
            if (userRole) {
                switch (userRole) {
                    case 'super_admin':
                        navigate('/super-admin');
                        break;
                    case 'admin':
                        navigate('/admin');
                        break;
                    case 'seller':
                        navigate('/seller/dashboard');
                        break;
                    case 'user':
                        navigate('/dashboard');
                        break;
                    default:
                        navigate('/');
                }
            }
            
            return res.data;
        }
    };

    const register = async (data) => {
        const res = await api.post('/register', data);
        if (res.data.success) {
            localStorage.setItem('token', res.data.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.data.user));
            setToken(res.data.data.token);
            setUser(res.data.data.user);
            navigate('/dashboard');
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
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            navigate('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading, updateUser: setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
