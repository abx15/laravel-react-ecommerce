import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu, FiX, FiHome, FiUsers, FiShoppingBag, FiSettings,
  FiLogOut, FiChevronLeft, FiChevronRight, FiGrid, FiBox,
  FiBarChart2, FiGlobe, FiPackage, FiTruck, FiUserCheck
} from 'react-icons/fi';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (error) {
      console.error('Error parsing user data:', error);
      return {};
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getSidebarItems = () => {
    if (!user) return [];

    const userRole = user.roles?.[0]?.name || 'user';

    const items = {
      super_admin: [
        { name: 'Dashboard', href: '/super-admin', icon: <FiGrid /> },
        { name: 'Users', href: '/super-admin/users', icon: <FiUsers /> },
        { name: 'Admins', href: '/super-admin/admins', icon: <FiUserCheck /> },
        { name: 'Sellers', href: '/super-admin/sellers', icon: <FiGlobe /> },
        { name: 'All Orders', href: '/super-admin/orders', icon: <FiShoppingBag /> },
        { name: 'Products', href: '/super-admin/products', icon: <FiPackage /> },
        { name: 'Settings', href: '/super-admin/settings', icon: <FiSettings /> },
      ],
      admin: [
        { name: 'Dashboard', href: '/admin', icon: <FiGrid /> },
        { name: 'Seller Requests', href: '/admin/seller-requests', icon: <FiUserCheck /> },
        { name: 'Orders', href: '/admin/orders', icon: <FiShoppingBag /> },
        { name: 'Products', href: '/admin/products', icon: <FiBox /> },
        { name: 'Categories', href: '/admin/categories', icon: <FiBarChart2 /> },
      ],
      seller: [
        { name: 'Dashboard', href: '/seller/dashboard', icon: <FiGrid /> },
        { name: 'Products', href: '/seller/products', icon: <FiBox /> },
        { name: 'Orders', href: '/seller/orders', icon: <FiShoppingBag /> },
        { name: 'Analytics', href: '/seller/analytics', icon: <FiBarChart2 /> },
      ],
      user: [
        { name: 'Dashboard', href: '/dashboard', icon: <FiGrid /> },
        { name: 'My Orders', href: '/user/orders', icon: <FiShoppingBag /> },
        { name: 'Profile', href: '/profile', icon: <FiUsers /> },
        { name: 'Addresses', href: '/user/addresses', icon: <FiTruck /> },
      ],
    };

    return items[userRole] || [
      { name: 'Dashboard', href: '/dashboard', icon: <FiGrid /> },
      { name: 'Profile', href: '/profile', icon: <FiUsers /> },
    ];
  };

  const sidebarItems = getSidebarItems();

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 },
    mobileOpen: { x: 0, width: 280 },
    mobileClosed: { x: -280, width: 280 },
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial={isMobile ? 'mobileClosed' : 'expanded'}
        animate={
          isMobile
            ? (sidebarOpen ? 'mobileOpen' : 'mobileClosed')
            : (sidebarOpen ? 'expanded' : 'collapsed')
        }
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed z-50 h-full bg-white border-r border-gray-200 shadow-xl lg:static lg:shadow-none
                   ${isMobile ? 'top-0 left-0 bottom-0' : ''}`}
      >
        <div className="flex flex-col h-full bg-white/50 backdrop-blur-xl">
          {/* Logo Section */}
          <div className={`flex items-center h-20 px-6 border-b border-gray-100 ${!sidebarOpen && !isMobile ? 'justify-center' : 'justify-between'}`}>
            {(!isMobile && !sidebarOpen) ? (
              <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-xl">E</span>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                  E-Com
                </span>
              </motion.div>
            )}

            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <FiX size={24} />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-hide">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group relative
                  ${location.pathname === item.href
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200'
                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                  } ${!sidebarOpen && !isMobile ? 'justify-center' : ''}`}
                title={!sidebarOpen && !isMobile ? item.name : ''}
              >
                <span className={`text-xl transition-transform duration-200 ${!sidebarOpen && !isMobile ? '' : 'mr-4'} ${location.pathname === item.href ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>

                {/* Text Label */}
                {(sidebarOpen || isMobile) && (
                  <span className="font-medium tracking-wide truncate">
                    {item.name}
                  </span>
                )}

                {/* Active Indicator for Collapsed Mode */}
                {!sidebarOpen && !isMobile && location.pathname === item.href && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-600 rounded-r-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* User Profile & Logout Section */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className={`flex items-center ${!sidebarOpen && !isMobile ? 'justify-center flex-col space-y-4' : 'justify-between'}`}>
              <div className={`flex items-center ${!sidebarOpen && !isMobile ? 'justify-center' : 'space-x-3'}`}>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-md">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>

                {(sidebarOpen || isMobile) && (
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[120px] capitalize">
                      {user.roles?.[0]?.name || 'Role'}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className={`p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors tooltip ${!sidebarOpen && !isMobile ? 'mt-2' : ''}`}
                title="Logout"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 relative">
        {/* Top Navbar for Mobile/Desktop Toggle */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 px-6 py-4 flex items-center justify-between lg:hidden shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-purple-600 transition-colors"
          >
            <FiMenu size={24} />
          </button>
          <span className="font-bold text-gray-800 text-lg">E-Com Dashboard</span>
          <div className="w-8" /> {/* Spacer */}
        </header>

        {/* Desktop Toggle Button (Floating) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`hidden lg:flex absolute top-6 z-40 bg-white shadow-lg border border-gray-100 p-1.5 rounded-full text-gray-500 hover:text-purple-600 transition-all duration-300 items-center justify-center
            ${sidebarOpen ? 'left-[-12px]' : 'left-4'}`} // Adjust position based on parent container or layout
          style={{ left: sidebarOpen ? '10px' : '20px' }} // This needs to be relative to the content area usually, but here sidebar is siblings. 
        // In this flex layout, the button should probably be inside the main content area but positioned absolute to the left edge?
        // Let's put it in the header for cleanliness or just top-left of main content.
        >
          {/* Actually, let's put it inside the main area top-left */}
        </button>

        {/* Better Toggle Implementation inside Main Content */}
        <div className="hidden lg:block absolute top-[28px] left-4 z-40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-white p-2 rounded-lg shadow-md border border-gray-200 text-gray-600 hover:text-purple-600 hover:scale-105 transition-all duration-200"
          >
            {sidebarOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
          </button>
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
