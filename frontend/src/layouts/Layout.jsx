import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaShoppingCart, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold text-blue-600">OpenShop</Link>

                <div className="flex items-center space-x-6">
                    <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
                    <Link to="/products" className="text-gray-600 hover:text-blue-600">Products</Link>

                    {user ? (
                        <>
                            {user.roles && user.roles.some(r => r.name === 'admin' || r.name === 'super_admin') && (
                                <Link to="/admin" className="text-gray-600 hover:text-blue-600">Admin</Link>
                            )}
                            <Link to="/profile" className="text-gray-600 hover:text-blue-600">Profile</Link>
                            <Link to="/cart" className="text-gray-600 hover:text-blue-600 relative">
                                <FaShoppingCart className="text-xl" />
                                {/* Badge could go here */}
                            </Link>
                            <span className="text-gray-800 font-medium">Hello, {user.name}</span>
                            <button onClick={handleLogout} className="text-red-500 hover:text-red-700">
                                <FaSignOutAlt />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
                            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <Outlet />
            </main>
            <footer className="bg-gray-800 text-white py-6 text-center">
                <p>&copy; {new Date().getFullYear()} OpenShop. Open Source E-Commerce.</p>
            </footer>
        </div>
    );
};

export default Layout;
