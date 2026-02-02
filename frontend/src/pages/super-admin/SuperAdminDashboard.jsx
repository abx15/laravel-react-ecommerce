import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiEye, FiFilter, FiDownload, FiUpload, FiPackage, FiUsers, FiShoppingCart, FiTrendingUp, FiDollarSign, FiAlertCircle, FiCheckCircle, FiXCircle, FiClock, FiUserPlus, FiShield, FiSettings, FiRefreshCw, FiGrid, FiUser, FiUserCheck, FiActivity, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-cards';

import api from '../../services/api';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    status: 'active'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        window.location.href = '/login';
        return;
      }

      // Fetch all data in parallel with proper error handling
      const results = await Promise.allSettled([
        api.get('/super-admin/dashboard'),
        api.get('/super-admin/admins'),
        api.get('/super-admin/users'),
        api.get('/super-admin/sellers')
      ]);

      // Handle each result separately
      const dashboardResult = results[0];
      const adminsResult = results[1];
      const usersResult = results[2];
      const sellersResult = results[3];

      // Set fallback data if API calls fail
      let dashboardData = {
        stats: {
          total_users: 0,
          total_admins: 0,
          total_sellers: 0,
          total_revenue: 0,
          user_growth: 0,
          admin_growth: 0,
          seller_growth: 0,
          revenue_growth: 0
        },
        charts: []
      };
      let adminsData = [];
      let usersData = [];
      let sellersData = [];

      // Process dashboard data
      if (dashboardResult.status === 'fulfilled' && dashboardResult.value?.data?.data) {
        dashboardData = dashboardResult.value.data.data;
        console.log('Dashboard data loaded:', dashboardData);
      } else {
        console.warn('Dashboard API failed:', dashboardResult.status === 'rejected' ? dashboardResult.reason : 'Invalid data format');
      }

      // Process admins data
      if (adminsResult.status === 'fulfilled' && adminsResult.value?.data?.data) {
        adminsData = adminsResult.value.data.data;
        console.log('Admins data loaded:', adminsData.length, 'admins');
      } else {
        console.warn('Admins API failed:', adminsResult.status === 'rejected' ? adminsResult.reason : 'Invalid data format');
      }

      // Process users data
      if (usersResult.status === 'fulfilled' && usersResult.value?.data?.data) {
        usersData = usersResult.value.data.data;
        console.log('Users data loaded:', usersData.length, 'users');
      } else {
        console.warn('Users API failed:', usersResult.status === 'rejected' ? usersResult.reason : 'Invalid data format');
      }

      // Process sellers data
      if (sellersResult.status === 'fulfilled' && sellersResult.value?.data?.data) {
        sellersData = sellersResult.value.data.data;
        console.log('Sellers data loaded:', sellersData.length, 'sellers');
      } else {
        console.warn('Sellers API failed:', sellersResult.status === 'rejected' ? sellersResult.reason : 'Invalid data format');
      }

      setStats(dashboardData);
      setAdmins(adminsData || []);
      setUsers(usersData || []);
      setSellers(sellersData || []);

      console.log('Super Admin Dashboard Data:', dashboardData);
      console.log('Admins:', adminsData);
      console.log('Users:', usersData);
      console.log('Sellers:', sellersData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data to prevent blank screen
      setStats({
        stats: { total_users: 0, total_admins: 0, total_sellers: 0, total_revenue: 0 },
        charts: { user_growth: [], orders_revenue: [] }
      });
      setAdmins([]);
      setUsers([]);
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/super-admin/admins', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowAddAdminModal(false);
        setFormData({ name: '', email: '', password: '', role: 'admin', status: 'active' });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error adding admin:', error);
    }
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/super-admin/admins/${selectedAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowEditAdminModal(false);
        setSelectedAdmin(null);
        setFormData({ name: '', email: '', password: '', role: 'admin', status: 'active' });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating admin:', error);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`/api/super-admin/admins/${adminId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting admin:', error);
      }
    }
  };

  const handleVerifySeller = async (sellerId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/super-admin/sellers/${sellerId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error verifying seller:', error);
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.roles?.[0]?.name || 'admin',
      status: admin.status || 'active'
    });
    setShowEditAdminModal(true);
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'all' || admin.status === filterStatus)
  );

  const StatCard = ({ title, value, icon, trend, gradient }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-2xl p-6 shadow-xl ${gradient} text-white group`}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl transform group-hover:scale-150 transition-transform duration-500"></div>

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1 tracking-wide uppercase">{title}</p>
          <h3 className="text-3xl font-bold mb-2 tracking-tight">{value}</h3>

          {trend && (
            <div className="flex items-center text-sm font-medium bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
              {trend > 0 ? <FiArrowUp className="mr-1" /> : <FiArrowDown className="mr-1" />}
              <span>{Math.abs(trend)}% vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shadow-inner text-2xl">
          {icon}
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50/50 pb-12"
    >
      {/* Dynamic Header */}
      <div className="bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100 px-8 py-5 flex justify-between items-center backdrop-blur-xl bg-white/80">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, Super Admin 👋</p>
        </div>

        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
            <FiDownload className="mr-2" /> Export
          </button>
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all text-sm font-medium">
            <FiSettings className="mr-2" /> Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 max-w-7xl mx-auto space-y-8">

        {/* Swiper Stats Carousel (Mobile/Tablet) or Grid (Desktop) */}
        <div className="block lg:hidden">
          <Swiper
            effect={'cards'}
            grabCursor={true}
            modules={[EffectCards, Pagination]}
            className="mySwiper w-full max-w-sm"
          >
            {[
              { title: 'Total Revenue', value: `$${stats?.stats?.total_revenue?.toLocaleString() || 0}`, icon: <FiDollarSign />, gradient: 'bg-gradient-to-br from-purple-600 to-indigo-600', trend: 22.4 },
              { title: 'Total Users', value: stats?.stats?.total_users?.toLocaleString() || 0, icon: <FiUsers />, gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500', trend: 12.5 },
              { title: 'Total Orders', value: stats?.stats?.total_orders?.toLocaleString() || '1,240', icon: <FiShoppingCart />, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-500', trend: 8.2 }, // Mocked orders if not in API
              { title: 'Total Sellers', value: stats?.stats?.total_sellers?.toLocaleString() || 0, icon: <FiPackage />, gradient: 'bg-gradient-to-br from-orange-500 to-red-500', trend: -2.3 },
            ].map((stat, index) => (
              <SwiperSlide key={index}>
                <StatCard {...stat} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Desktop Stats Grid */}
        <div className="hidden lg:grid grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`$${stats?.stats?.total_revenue?.toLocaleString() || 0}`}
            icon={<FiDollarSign />}
            gradient="bg-gradient-to-br from-purple-600 to-indigo-600"
            trend={22.4}
          />
          <StatCard
            title="Total Users"
            value={stats?.stats?.total_users?.toLocaleString() || 0}
            icon={<FiUsers />}
            gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
            trend={12.5}
          />
          <StatCard
            title="Total Orders"
            value={stats?.stats?.total_orders?.toLocaleString() || '1,240'}
            icon={<FiShoppingCart />}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
            trend={8.2}
          />
          <StatCard
            title="Active Sellers"
            value={stats?.stats?.total_sellers?.toLocaleString() || 0}
            icon={<FiPackage />}
            gradient="bg-gradient-to-br from-orange-500 to-red-500"
            trend={4.5}
          />
        </div>

        {/* Navigation Tabs (Pill Shape) */}
        <div className="flex space-x-2 bg-white/60 p-1.5 rounded-2xl w-fit backdrop-blur-md border border-gray-200/50 shadow-sm mx-auto lg:mx-0">
          {['overview', 'admins', 'users', 'sellers', 'system'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 capitalize ${activeTab === tab
                ? 'bg-white text-purple-700 shadow-md transform scale-105'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >

              {/* Overview Content */}
              {activeTab === 'overview' && stats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-800">Revenue Analytics</h3>
                      <select className="bg-gray-50 border-none text-sm text-gray-500 rounded-lg p-2 focus:ring-0 cursor-pointer hover:bg-gray-100">
                        <option>This Year</option>
                        <option>Last Year</option>
                      </select>
                    </div>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.charts?.orders_revenue || []}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            cursor={{ stroke: '#8B5CF6', strokeWidth: 1, strokeDasharray: '4 4' }}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-800">User Growth</h3>
                      <button className="text-purple-600 text-sm font-medium hover:underline">View Report</button>
                    </div>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.charts?.user_growth || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                          <Tooltip
                            cursor={{ fill: '#F3F4F6' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                          />
                          <Bar dataKey="users" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40}>
                            {
                              (stats.charts?.user_growth || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8B5CF6' : '#A78BFA'} />
                              ))
                            }
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Tables (Reusable Structure for Admins, Users, Sellers) */}
              {['admins', 'users', 'sellers'].includes(activeTab) && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-gray-800 capitalize">{activeTab} Management</h3>

                    <div className="flex flex-wrap gap-3">
                      <div className="relative group">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <input
                          type="text"
                          placeholder={`Search ${activeTab}...`}
                          className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none w-64 transition-all"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      {activeTab === 'admins' && (
                        <button
                          onClick={() => setShowAddAdminModal(true)}
                          className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                        >
                          <FiPlus className="mr-2" /> Add Admin
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50/50">
                        <tr>
                          {activeTab === 'admins' && ['Admin', 'Email', 'Role', 'Status', 'Actions'].map(h => <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}
                          {activeTab === 'users' && ['User', 'Email', 'Orders', 'Spent', 'Joined'].map(h => <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}
                          {activeTab === 'sellers' && ['Seller', 'Products', 'Revenue', 'Status', 'Actions'].map(h => <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {/* Render rows based on activeTab */}
                        {activeTab === 'admins' && filteredAdmins.map((admin) => (
                          <tr key={admin.id} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                                  {admin.name?.charAt(0)}
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-semibold text-gray-900">{admin.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{admin.email}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium border border-purple-100">
                                {admin.roles?.[0]?.name}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${admin.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${admin.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {admin.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditModal(admin)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"><FiEdit2 /></button>
                                <button onClick={() => handleDeleteAdmin(admin.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 /></button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {activeTab === 'users' && users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{user.name?.charAt(0)}</div>
                                <span className="text-sm font-medium text-gray-900">{user.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-800 font-medium">{user.orders_count || 0}</td>
                            <td className="px-6 py-4 text-sm text-gray-800 font-medium">${user.total_spent || 0}</td>
                            <td className="px-6 py-4 text-xs text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}

                        {activeTab === 'sellers' && sellers.map((seller) => (
                          <tr key={seller.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 font-bold">{seller.name?.charAt(0)}</div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{seller.name}</div>
                                  <div className="text-xs text-gray-400">{seller.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{seller.products_count} Items</td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-800">${seller.total_revenue}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium border ${seller.is_verified ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                {seller.is_verified ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {!seller.is_verified && (
                                <button onClick={() => handleVerifySeller(seller.id)} className="text-sm text-green-600 hover:text-green-700 font-medium underline">Approve</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Retain Modals (Add Admin / Edit Admin) with minimal styling updates */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <button onClick={() => setShowAddAdminModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><FiXCircle size={24} /></button>
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Add New Admin</h3>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              {/* Reusing existing logic */}
              <input type="text" placeholder="Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              <input type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              <input type="password" placeholder="Password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all">
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowAddAdminModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">Save</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showEditAdminModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <button onClick={() => setShowEditAdminModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><FiXCircle size={24} /></button>
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Edit Admin</h3>
            <form onSubmit={handleEditAdmin} className="space-y-4">
              <input type="text" placeholder="Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              <input type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              <input type="password" placeholder="Password (leave empty)" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all">
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowEditAdminModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">Update</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default SuperAdminDashboard;
