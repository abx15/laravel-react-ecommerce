import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [sellerRequests, setSellerRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock: '',
    status: 'active'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel with error handling for each call
      const results = await Promise.allSettled([
        api.get('/admin/dashboard'),
        api.get('/admin/products-list'),
        api.get('/admin/orders-list'),
        api.get('/admin/sellers'),
        api.get('/admin/seller-requests')
      ]);

      // Handle each result separately
      const dashboardResult = results[0];
      const productsResult = results[1];
      const ordersResult = results[2];
      const sellersResult = results[3];
      const sellerRequestsResult = results[4];

      // Set fallback data if API calls fail
      let dashboardData = { stats: { total_orders: 0, revenue: 0, total_products: 0, pending_sellers: 0 }, charts: [] };
      let productsData = { data: [] };
      let ordersData = { data: [] };
      let sellersData = [];
      let sellerRequestsData = [];

      if (dashboardResult.status === 'fulfilled') {
        dashboardData = dashboardResult.value.data;
      } else {
        console.error('Dashboard API failed:', dashboardResult.reason);
      }

      if (productsResult.status === 'fulfilled') {
        productsData = productsResult.value.data;
      } else {
        console.error('Products API failed:', productsResult.reason);
      }

      if (ordersResult.status === 'fulfilled') {
        ordersData = ordersResult.value.data;
      } else {
        console.error('Orders API failed:', ordersResult.reason);
      }

      if (sellersResult.status === 'fulfilled') {
        sellersData = sellersResult.value.data;
      } else {
        console.error('Sellers API failed:', sellersResult.reason);
      }

      if (sellerRequestsResult.status === 'fulfilled') {
        sellerRequestsData = sellerRequestsResult.value.data;
      } else {
        console.error('Seller requests API failed:', sellerRequestsResult.reason);
      }

      setStats(dashboardData);
      setProducts(productsData.data || []);
      setOrders(ordersData.data || []);
      setUsers([]); // Will be populated when needed
      setSellers(sellersData.data || sellersData || []);
      setSellerRequests(sellerRequestsData.data || sellerRequestsData || []);
      
      console.log('Admin Dashboard Data:', dashboardData);
      console.log('Products:', productsData);
      console.log('Orders:', ordersData);
      console.log('Sellers:', sellersData);
      console.log('Seller Requests:', sellerRequestsData);
      console.log('First seller:', (sellersData.data || sellersData || [])[0]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data to prevent blank screen
      setStats({
        stats: { total_orders: 0, revenue: 0, total_products: 0, pending_sellers: 0 },
        charts: { revenue_trend: [], daily_orders: [] }
      });
      setProducts([]);
      setOrders([]);
      setUsers([]);
      setSellers([]);
      setSellerRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/admin/products', formData);

      if (response.data.success) {
        setShowAddProductModal(false);
        setFormData({ name: '', description: '', price: '', category_id: '', stock: '', status: 'active' });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/admin/products/${selectedProduct.id}`, formData);

      if (response.data.success) {
        setShowEditProductModal(false);
        setSelectedProduct(null);
        setFormData({ name: '', description: '', price: '', category_id: '', stock: '', status: 'active' });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/admin/products/${productId}`);
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleApproveSeller = async (sellerId) => {
    try {
      await api.patch(`/admin/sellers/${sellerId}/approve`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error approving seller:', error);
    }
  };

  const handleRejectSeller = async (sellerId) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      try {
        await api.patch(`/admin/sellers/${sellerId}/reject`, { rejection_reason: reason });
        fetchDashboardData();
      } catch (error) {
        console.error('Error rejecting seller:', error);
      }
    }
  };

  const handleBlockSeller = async (userId) => {
    if (window.confirm('Are you sure you want to block this seller?')) {
      try {
        await api.patch(`/admin/sellers/${userId}/block`);
        fetchDashboardData();
      } catch (error) {
        console.error('Error blocking seller:', error);
      }
    }
  };

  const handleUnblockSeller = async (userId) => {
    try {
      await api.patch(`/admin/sellers/${userId}/unblock`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error unblocking seller:', error);
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category_id: product.category_id,
      stock: product.stock,
      status: product.status
    });
    setShowEditProductModal(true);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'all' || product.status === filterStatus)
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-b-3xl shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-blue-100">Complete platform management</p>
          </div>
          <div className="flex space-x-4">
            <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
              <FiDownload className="inline mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex space-x-8 px-8">
          {['overview', 'products', 'orders', 'users', 'sellers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
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
                title="Total Revenue" 
                value={`$${stats.stats?.revenue?.toLocaleString() || 0}`} 
                icon={<FiDollarSign />}
                color="bg-gradient-to-br from-green-500 to-emerald-600"
                trend={12.5}
              />
              <StatCard 
                title="Total Orders" 
                value={stats.stats?.total_orders?.toLocaleString() || 0} 
                icon={<FiShoppingCart />}
                color="bg-gradient-to-br from-blue-500 to-indigo-600"
                trend={8.2}
              />
              <StatCard 
                title="Total Products" 
                value={stats.stats?.total_products?.toLocaleString() || 0} 
                icon={<FiPackage />}
                color="bg-gradient-to-br from-purple-500 to-pink-600"
                trend={-2.4}
              />
              <StatCard 
                title="Pending Sellers" 
                value={stats.stats?.pending_sellers?.toLocaleString() || 0} 
                icon={<FiUsers />}
                color="bg-gradient-to-br from-orange-500 to-red-600"
                trend={15.7}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.charts?.revenue_trend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Daily Orders</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.charts?.daily_orders || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Product Management</h3>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FiPlus className="mr-2" />
                  Add Product
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex space-x-4 mb-6">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-full object-cover" src={product.image || '/placeholder.jpg'} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.category?.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.status === 'active' ? 'bg-green-100 text-green-800' :
                            product.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openEditModal(product)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
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

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-6">Order Management</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.user?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.roles?.[0]?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status || 'active'}
                        </span>
                      </td>
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
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold mb-6">Seller Management</h3>
              
              {/* Seller Requests */}
              {sellerRequests.length > 0 ? (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-4 text-orange-600">Pending Seller Requests ({sellerRequests.length})</h4>
                  <div className="space-y-4">
                    {sellerRequests.map((seller) => (
                      <div key={seller.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-semibold text-gray-900">{seller.shop_name || 'Shop Name'}</h5>
                            <p className="text-sm text-gray-600">{seller.user?.name || 'Name'} - {seller.user?.email || 'Email'}</p>
                            <p className="text-sm text-gray-500 mt-1">{seller.shop_address || 'Address'}, {seller.city || 'City'}</p>
                            <p className="text-sm text-gray-500">GST: {seller.gst_number || 'Not provided'}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveSeller(seller.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              <FiCheckCircle className="inline mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectSeller(seller.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              <FiXCircle className="inline mr-1" />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-4 text-green-600">No Pending Seller Requests</h4>
                  <div className="text-center py-4">
                    <p className="text-gray-500">All seller requests have been processed</p>
                  </div>
                </div>
              )}

              {/* All Sellers */}
              <div>
                <h4 className="text-lg font-semibold mb-4">All Sellers</h4>
                {sellers.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-lg">No sellers found</div>
                    <p className="text-gray-400 mt-2">Sellers will appear here once they register</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
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
                                    <span className="text-gray-600 font-medium">
                                      {seller.user?.name?.charAt(0) || seller.user?.email?.charAt(0) || 'S'}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{seller.user?.name || 'Unknown Seller'}</div>
                                  <div className="text-sm text-gray-500">{seller.user?.email || 'No email'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seller.shop_name || 'No shop name'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seller.products_count || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seller.total_sales || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${seller.total_revenue || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                seller.status === 'approved' ? 'bg-green-100 text-green-800' :
                                seller.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {seller.status === 'approved' ? 'Verified' : seller.status}
                              </span>
                              {seller.user?.is_blocked && (
                                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Blocked
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {seller.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveSeller(seller.id)}
                                      className="text-green-600 hover:text-green-900"
                                      title="Approve"
                                    >
                                      <FiCheckCircle />
                                    </button>
                                    <button
                                      onClick={() => handleRejectSeller(seller.id)}
                                      className="text-red-600 hover:text-red-900"
                                      title="Reject"
                                    >
                                      <FiXCircle />
                                    </button>
                                  </>
                                )}
                                {!seller.user?.is_blocked ? (
                                  <button
                                    onClick={() => handleBlockSeller(seller.user.id)}
                                    className="text-orange-600 hover:text-orange-900"
                                    title="Block"
                                  >
                                    <FiAlertCircle />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUnblockSeller(seller.user.id)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Unblock"
                                  >
                                    <FiCheckCircle />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Add New Product</h3>
            <form onSubmit={handleAddProduct}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Edit Product</h3>
            <form onSubmit={handleEditProduct}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditProductModal(false)}
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

export default AdminDashboard;
