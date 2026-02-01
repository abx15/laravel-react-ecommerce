import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        password_confirmation: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
        // Clear error when user types
        if (errors[e.target.id]) {
            setErrors({
                ...errors,
                [e.target.id]: null
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await register(formData);
            navigate('/');
        } catch (error) {
            console.error('Registration error:', error);
            // Handle specific errors based on API response structure if accessible
            // Assuming AuthContext or API throws with response data.
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert(error.response?.data?.message || 'Registration failed.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-text-heading">Create Account</h1>
                    <p className="text-text-muted mt-2">Sign up to start shopping for fresh groceries</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        id="name"
                        label="Full Name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name?.[0]}
                        disabled={loading}
                    />

                    <Input
                        id="email"
                        type="email"
                        label="Email Address"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email?.[0]}
                        disabled={loading}
                    />

                    <Input
                        id="mobile"
                        type="tel"
                        label="Mobile Number"
                        placeholder="9876543210"
                        value={formData.mobile}
                        onChange={handleChange}
                        error={errors.mobile?.[0]}
                        disabled={loading}
                    />

                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password?.[0]}
                        disabled={loading}
                    />

                    <Input
                        id="password_confirmation"
                        type="password"
                        label="Confirm Password"
                        placeholder="••••••••"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        disabled={loading}
                    />

                    <Button
                        type="submit"
                        className="w-full mt-6"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-text-muted">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary font-semibold hover:underline">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
