import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  React.useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getSidebarItems = () => {
    if (!user) return [];

    const userRole = user.roles?.[0]?.name || 'user';

    switch (userRole) {
      case 'super_admin':
        return [
          { name: 'Dashboard', href: '/super-admin', icon: '📊' },
          { name: 'Users', href: '/super-admin/users', icon: '👥' },
          { name: 'Admins', href: '/super-admin/admins', icon: '👔' },
          { name: 'Sellers', href: '/super-admin/sellers', icon: '🏪' },
          { name: 'All Orders', href: '/super-admin/orders', icon: '📦' },
          { name: 'System Settings', href: '/super-admin/settings', icon: '⚙️' },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', href: '/admin', icon: '📊' },
          { name: 'Seller Requests', href: '/admin/seller-requests', icon: '⏳' },
          { name: 'Orders', href: '/admin/orders', icon: '📦' },
          { name: 'Products', href: '/admin/products', icon: '📦' },
          { name: 'Categories', href: '/admin/categories', icon: '📂' },
        ];
      case 'seller':
        return [
          { name: 'Dashboard', href: '/seller/dashboard', icon: '📊' },
          { name: 'My Products', href: '/seller/products', icon: '📦' },
          { name: 'Add Product', href: '/seller/products/create', icon: '➕' },
          { name: 'Orders', href: '/seller/orders', icon: '🛒' },
          { name: 'Analytics', href: '/seller/analytics', icon: '📈' },
        ];
      case 'user':
        return [
          { name: 'Dashboard', href: '/dashboard', icon: '📊' },
          { name: 'My Orders', href: '/user/orders', icon: '📦' },
          { name: 'Profile', href: '/profile', icon: '👤' },
          { name: 'Addresses', href: '/user/addresses', icon: '📍' },
        ];
      default:
        return [
          { name: 'Dashboard', href: '/dashboard', icon: '📊' },
          { name: 'Profile', href: '/profile', icon: '👤' },
        ];
    }
  };

  const sidebarItems = getSidebarItems();

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">E-Commerce</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <nav className="mt-6">
          <div className="px-4">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <p className="text-xs text-blue-600 capitalize">{user.roles?.[0]?.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              ☰
            </button>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                🔔
              </button>
              <div className="relative">
                <button className="flex items-center text-sm text-gray-700 hover:text-gray-900">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
