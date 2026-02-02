import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FiSearch, FiEdit2, FiTrash2, FiPlus, FiCheckCircle, FiXCircle,
  FiAlertCircle, FiUsers, FiPackage, FiShoppingCart, FiDollarSign,
  FiTrendingUp, FiBarChart2
} from 'react-icons/fi';
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Data States
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [users, setUsers] = useState([]);
  const [sellerRequests, setSellerRequests] = useState([]);
  const [categories, setCategories] = useState([]);

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', price: '', stock: '', category_id: '', description: '', image: null
  });

  // Sync Tab with URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/products')) setActiveTab('products');
    else if (path.includes('/orders')) setActiveTab('orders');
    else if (path.includes('/sellers') || path.includes('/seller-requests')) setActiveTab('sellers');
    else setActiveTab('overview');
  }, [location]);

  // Fetch Data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch Categories on products tab
  useEffect(() => {
    if (activeTab === 'products') {
      api.get('/categories').then(res => setCategories(res.data.data || [])).catch(console.error);
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, productsRes, ordersRes, sellersRes, requestsRes, usersRes] = await Promise.allSettled([
        api.get('/admin/dashboard'),
        api.get('/admin/products-list'),
        api.get('/admin/orders-list'),
        api.get('/admin/sellers'),
        api.get('/admin/seller-requests'),
        api.get('/admin/users')
      ]);

      if (dashboardRes.status === 'fulfilled') setStats(dashboardRes.value.data.data || {});
      if (productsRes.status === 'fulfilled') setProducts(productsRes.value.data.data || []);
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data.data || []);
      if (sellersRes.status === 'fulfilled') setSellers(sellersRes.value.data.data || []);
      if (requestsRes.status === 'fulfilled') setSellerRequests(requestsRes.value.data.data || []);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data.data.data || []); // Paginated response usually has .data

    } catch (error) {
      console.error("Dashboard Load Error", error);
    } finally {
      setLoading(false);
    }
  };

  // CRUD Handlers
  const resetForm = () => {
    setFormData({ name: '', price: '', stock: '', category_id: '', description: '', image: null });
    setSelectedProduct(null);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));

    try {
      await api.post('/admin/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowAddModal(false);
      resetForm();
      fetchDashboardData();
    } catch (error) {
      alert('Failed to create product');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/products/${selectedProduct.id}`, formData);
      setShowEditModal(false);
      resetForm();
      fetchDashboardData();
    } catch (error) {
      alert('Failed to update product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchDashboardData();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const initiateEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category_id: product.category_id,
      description: product.description,
      is_active: product.is_active
    });
    setShowEditModal(true);
  };

  const handleApproveSeller = async (id) => {
    if (!confirm('Approve this seller?')) return;
    try {
      await api.patch(`/admin/sellers/${id}/approve`);
      fetchDashboardData();
    } catch (err) { alert('Failed'); }
  };

  const handleRejectSeller = async (id) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;
    try {
      await api.patch(`/admin/sellers/${id}/reject`, { rejection_reason: reason });
      fetchDashboardData();
    } catch (err) { alert('Failed'); }
  };

  // Stat Component
  const StatCard = ({ title, value, icon, gradient }) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg ${gradient} text-white`}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20 blur-xl"></div>
      <div className="relative z-10 flex justify-between items-center">
        <div>
          <p className="text-white/80 font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        <div className="text-3xl bg-white/20 p-3 rounded-xl backdrop-blur-sm">{icon}</div>
      </div>
    </div>
  );

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-white/80 px-8 py-4 backdrop-blur-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Admin Portal</h1>
          <p className="text-xs text-gray-500">Platform Overview</p>
        </div>
        <div className="flex gap-4">
          <button className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition-colors">
            Notifications ({sellerRequests.length})
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Revenue" value={`$${stats?.stats?.revenue || 0}`} icon={<FiDollarSign />} gradient="bg-gradient-to-br from-blue-500 to-indigo-600" />
          <StatCard title="Orders" value={stats?.stats?.total_orders || 0} icon={<FiShoppingCart />} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
          <StatCard title="Users" value={stats?.stats?.total_users || 0} icon={<FiUsers />} gradient="bg-gradient-to-br from-violet-500 to-purple-600" />
          <StatCard title="Sellers" value={stats?.stats?.total_sellers || 0} icon={<FiUsers />} gradient="bg-gradient-to-br from-orange-400 to-pink-500" />
        </div>

        {/* Main Tabs */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
          <div className="border-b border-gray-100 px-6 py-4 flex gap-6 overflow-x-auto">
            {['overview', 'products', 'sellers', 'users', 'orders'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`capitalize text-sm font-semibold pb-4 pt-2 -mb-4 border-b-2 transition-colors ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="h-[400px]">
                <h4 className="text-lg font-bold text-gray-800 mb-6">Revenue Analytics</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.charts?.revenue_trend || []}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-bold text-gray-800">Platform Products</h4>
                  <div className="flex gap-4">
                    <input type="text" placeholder="Search..." className="bg-gray-50 px-4 py-2 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500 w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <button onClick={() => { resetForm(); setShowAddModal(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                      <FiPlus /> Add Product
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Seller</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={product.image || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-lg bg-gray-200 object-cover" alt="" />
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.category?.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{product.seller?.shop_name || 'Admin'}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">${product.price}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => initiateEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FiEdit2 /></button>
                              <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'sellers' && (
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-6">Registered Sellers</h4>
                <div className="overflow-x-auto">
                  {/* Pending Requests Section */}
                  {sellerRequests.length > 0 && (
                    <div className="mb-8">
                      <h5 className="text-sm font-bold text-orange-600 mb-4 flex items-center gap-2"><FiAlertCircle /> Pending Requests</h5>
                      <div className="space-y-4">
                        {sellerRequests.map(req => (
                          <div key={req.id} className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-gray-900">{req.shop_name}</p>
                              <p className="text-sm text-gray-600">{req.user?.name}</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleApproveSeller(req.id)} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-sm">Approve</button>
                              <button onClick={() => handleRejectSeller(req.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm">Reject</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <table className="w-full">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Shop</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Owner</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sellers.map(seller => (
                        <tr key={seller.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{seller.shop_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{seller.user?.name}</td>
                          <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${seller.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{seller.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-6">Recent Orders</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-bold text-blue-600">#{order.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{order.user?.name}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">${order.total_amount || order.total}</td>
                          <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 uppercase">{order.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">{showEditModal ? 'Edit Product' : 'Add Product'}</h3>
                <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="text-gray-400 hover:text-gray-600"><FiXCircle size={24} /></button>
              </div>
              <form onSubmit={showEditModal ? handleEditProduct : handleAddProduct} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3" className="w-full px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500" required></textarea>
                </div>
                {!showEditModal && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                    <input type="file" onChange={e => setFormData({ ...formData, images: e.target.files })} multiple className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200">Save Product</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
