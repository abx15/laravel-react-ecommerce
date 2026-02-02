import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiEye, FiFilter, FiDownload, FiUpload, FiPackage, FiUsers, FiShoppingCart, FiTrendingUp, FiDollarSign, FiAlertCircle, FiCheckCircle, FiXCircle, FiClock, FiUserPlus, FiShield, FiSettings } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

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
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Fetch all data in parallel with error handling for each call
      const results = await Promise.allSettled([
        fetch('/api/super-admin/dashboard', { headers }),
        fetch('/api/super-admin/admins', { headers }),
        fetch('/api/super-admin/users', { headers }),
        fetch('/api/super-admin/sellers', { headers })
      ]);

      // Handle each result separately
      const dashboardResult = results[0];
      const adminsResult = results[1];
      const usersResult = results[2];
      const sellersResult = results[3];

      // Set fallback data if API calls fail
      let dashboardData = { stats: { total_users: 0, total_admins: 0, total_sellers: 0, total_revenue: 0 }, charts: [] };
      let adminsData = [];
      let usersData = [];
      let sellersData = [];

      if (dashboardResult.status === 'fulfilled') {
        dashboardData = await dashboardResult.value.json();
      } else {
        console.error('Dashboard API failed:', dashboardResult.reason);
      }

      if (adminsResult.status === 'fulfilled') {
        adminsData = await adminsResult.value.json();
      } else {
        console.error('Admins API failed:', adminsResult.reason);
      }

      if (usersResult.status === 'fulfilled') {
        usersData = await usersResult.value.json();
      } else {
        console.error('Users API failed:', usersResult.reason);
      }

      if (sellersResult.status === 'fulfilled') {
        sellersData = await sellersResult.value.json();
      } else {
        console.error('Sellers API failed:', sellersResult.reason);
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

  const StatCard = ({ title, value, icon, color, trend }) => (
    <div className={`${color} rounded-2xl p-6 text-white relative overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105`}>
      <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-20">
        <div className="text-6xl">{icon}</div>
      </div>
      <div className="relative z-10">
        <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold mb-2">{value}</p>
        {trend && (
          <div className="flex items-center text-sm">
            {trend > 0 ? <FiTrendingUp className="mr-1" /> : <FiTrendingUp className="mr-1 transform rotate-180" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-b-3xl shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Super Admin Dashboard</h1>
            <p className="text-purple-100">Complete system control and administration</p>
          </div>
          <div className="flex space-x-4">
            <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
              <FiDownload className="inline mr-2" />
              Export Report
            </button>
            <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
              <FiSettings className="inline mr-2" />
              System Settings
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex space-x-8 px-8">
          {['overview', 'admins', 'users', 'sellers', 'system'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Users" 
                value={stats.stats?.total_users?.toLocaleString() || 0} 
                icon={<FiUsers />}
                color="bg-gradient-to-br from-blue-500 to-indigo-600"
                trend={18.2}
              />
              <StatCard 
                title="Total Admins" 
                value={stats.stats?.total_admins?.toLocaleString() || 0} 
                icon={<FiShield />}
                color="bg-gradient-to-br from-green-500 to-emerald-600"
                trend={5.4}
              />
              <StatCard 
                title="Total Sellers" 
                value={stats.stats?.total_sellers?.toLocaleString() || 0} 
                icon={<FiPackage />}
                color="bg-gradient-to-br from-purple-500 to-pink-600"
                trend={12.7}
              />
              <StatCard 
                title="Total Revenue" 
                value={`$${stats.stats?.total_revenue?.toLocaleString() || 0}`} 
                icon={<FiDollarSign />}
                color="bg-gradient-to-br from-orange-500 to-red-600"
                trend={22.1}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">User Growth Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.charts?.user_growth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Orders vs Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.charts?.orders_revenue || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Admin Management</h3>
                <button
                  onClick={() => setShowAddAdminModal(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  <FiUserPlus className="mr-2" />
                  Add Admin
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex space-x-4 mb-6">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search admins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Admins Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAdmins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-purple-600 font-medium">{admin.name?.charAt(0) || admin.email?.charAt(0) || 'A'}</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{admin.name || 'Admin Name'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{admin.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{admin.roles?.[0]?.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {admin.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openEditModal(admin)}
                            className="text-purple-600 hover:text-purple-900 mr-3"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-6">User Management</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-600 font-medium">{user.name?.charAt(0) || user.email?.charAt(0) || 'U'}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name || 'User Name'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.orders_count || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.total_spent || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sellers Tab */}
        {activeTab === 'sellers' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-6">Seller Verification & Management</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-600 font-medium">{seller.name?.charAt(0) || seller.email?.charAt(0) || 'S'}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{seller.name || 'Seller Name'}</div>
                            <div className="text-sm text-gray-500">{seller.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seller.products_count || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seller.total_sales || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${seller.total_revenue || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          seller.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {seller.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!seller.is_verified && (
                          <button
                            onClick={() => handleVerifySeller(seller.id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            <FiCheckCircle />
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-900">
                          <FiEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold mb-6">System Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">System Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Platform Version:</span>
                      <span className="font-medium">v2.1.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Database Status:</span>
                      <span className="text-green-600 font-medium">Healthy</span>
                    </div>
                    <div className="flex justify-between">
                      <span>API Response Time:</span>
                      <span className="font-medium">120ms</span>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Security Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>2FA Authentication:</span>
                      <span className="text-green-600 font-medium">Enabled</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SSL Certificate:</span>
                      <span className="text-green-600 font-medium">Valid</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Security Audit:</span>
                      <span className="font-medium">2 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Add New Admin</h3>
            <form onSubmit={handleAddAdmin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Admin
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Edit Admin</h3>
            <form onSubmit={handleEditAdmin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Update Admin
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditAdminModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
