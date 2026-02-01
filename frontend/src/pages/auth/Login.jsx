import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        login: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(formData.login, formData.password);
            navigate('/dashboard'); // or home '/'
        } catch (err) {
            console.error('Login error:', err);
            // Handle error from context/api response if possible, 
            // but AuthContext.login currently doesn't throw specific error payload easily unless we modify it.
            // Let's assume login throws on error.
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-text-heading">Welcome Back</h1>
                    <p className="text-text-muted mt-2">Login to access your orders and profile</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-status-error text-sm p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <Input
                        id="login"
                        label="Email or Mobile Number"
                        placeholder="john@example.com"
                        value={formData.login}
                        onChange={handleChange}
                        disabled={loading}
                    />

                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                    />

                    <div className="text-right">
                        <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        className="w-full mt-2"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-text-muted">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary font-semibold hover:underline">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
