import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiEye, FiFilter, FiDownload, FiUpload, FiPackage, FiShoppingCart, FiTrendingUp, FiDollarSign, FiAlertCircle, FiCheckCircle, FiXCircle, FiClock, FiStar, FiMessageSquare, FiBarChart2, FiUsers, FiGrid, FiList, FiImage, FiSettings, FiLogOut } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-cards';

import api from '../../services/api';
import { useLocation } from 'react-router-dom';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/products')) setActiveTab('products');
    else if (path.includes('/orders')) setActiveTab('orders');
    else if (path.includes('/analytics')) setActiveTab('analytics');
    else setActiveTab('overview');
  }, [location]);

  // Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock: '',
    status: 'active',
    images: []
  });

  useEffect(() => {
    fetchDashboardData();
    fetchCategories();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Parallel fetching for performance
      const [dashboardRes, productsRes, ordersRes] = await Promise.allSettled([
        api.get('/seller/dashboard'),
        api.get('/seller/products-list'),
        api.get('/seller/orders')
      ]);

      if (dashboardRes.status === 'fulfilled') {
        setStats(dashboardRes.value.data);
      }

      if (productsRes.status === 'fulfilled') {
        setProducts(productsRes.value.data.data || []);
      }

      if (ordersRes.status === 'fulfilled') {
        setOrders(ordersRes.value.data.data || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  }

  // --- CRUD Handlers ---



  const handleSubmitProduct = async (e, isEdit = false) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('category_id', formData.category_id);
    data.append('description', formData.description);

    if (formData.images && formData.images.length > 0) {
      for (let i = 0; i < formData.images.length; i++) {
        data.append(`images[${i}]`, formData.images[i]);
      }
    }

    try {
      if (isEdit) {
        // Laravel requires _method=PUT or usage of POST for FormData sometimes, but let's try direct PUT if no files or handle file update differently
        // React axios put with files is tricky. Standard is POST with _method=PUT
        data.append('_method', 'PUT');
        await api.post(`/seller/products/${selectedProduct.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/seller/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      setShowAddProductModal(false);
      setShowEditProductModal(false);
      setFormData({ name: '', price: '', stock: '', category_id: '', description: '', images: null });
      fetchDashboardData();
    } catch (error) {
      console.error('Operation failed', error);
      alert('Failed to save product. Check inputs.');
    }
  };


  const handleDeleteProduct = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await api.delete(`/seller/products/${id}`);
        fetchDashboardData();
      } catch (err) {
        console.error(err);
      }
    }
  };


  // --- Helper Components ---

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
              <FiTrendingUp className={`mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50/50 pb-12"
    >
      {/* Header */}
      <div className="bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100 px-8 py-5 flex justify-between items-center backdrop-blur-xl bg-white/80">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
            Seller Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your shop and products</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all text-sm font-medium shadow-md" onClick={() => setShowAddProductModal(true)}>
            <FiPlus className="mr-2" /> Add Product
          </button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-8">

        {/* Swiper Mobile */}
        <div className="block lg:hidden">
          <Swiper
            effect={'cards'}
            grabCursor={true}
            modules={[EffectCards]}
            className="mySwiper w-full max-w-sm"
          >
            <SwiperSlide>
              <StatCard title="Total Sales" value={`$${stats?.my_revenue || 0}`} icon={<FiDollarSign />} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" trend={12.5} />
            </SwiperSlide>
            <SwiperSlide>
              <StatCard title="My Products" value={stats?.my_products_count || 0} icon={<FiPackage />} gradient="bg-gradient-to-br from-blue-500 to-indigo-600" trend={5.2} />
            </SwiperSlide>
            <SwiperSlide>
              <StatCard title="Orders" value={stats?.my_orders || 0} icon={<FiShoppingCart />} gradient="bg-gradient-to-br from-orange-400 to-pink-500" trend={-2.4} />
            </SwiperSlide>
          </Swiper>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-4 gap-6">
          <StatCard title="Total Revenue" value={`$${stats?.my_revenue || 0}`} icon={<FiDollarSign />} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" trend={12.5} />
          <StatCard title="Products" value={stats?.my_products_count || 0} icon={<FiPackage />} gradient="bg-gradient-to-br from-blue-500 to-indigo-600" trend={8.1} />
          <StatCard title="Orders" value={stats?.my_orders || 0} icon={<FiShoppingCart />} gradient="bg-gradient-to-br from-orange-400 to-pink-500" trend={15.4} />
          <StatCard title="Avg Rating" value="4.8" icon={<FiStar />} gradient="bg-gradient-to-br from-purple-500 to-violet-600" trend={0.0} />
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 bg-white/60 p-1.5 rounded-2xl w-fit backdrop-blur-md border border-gray-200/50 shadow-sm mx-auto lg:mx-0">
          {['overview', 'products', 'orders', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 capitalize ${activeTab === tab
                ? 'bg-white text-emerald-700 shadow-md transform scale-105'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-[400px]">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Sales Overview</h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <AreaChart data={stats?.charts?.sales_over_time || []}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-[400px] overflow-hidden">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Orders</h3>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">#{order.id}</div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{order.user?.name || 'Customer'}</p>
                            <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">${order.total}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Products */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">My Listings</h3>
                  <input type="text" placeholder="Search..." className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={product.image || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.category?.name || 'No Category'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">${product.price}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{product.stock}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {product.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => { setSelectedProduct(product); setFormData(product); setShowEditProductModal(true) }} className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"><FiEdit2 /></button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><FiTrash2 /></button>
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

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {(showAddProductModal || showEditProductModal) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button onClick={() => { setShowAddProductModal(false); setShowEditProductModal(false) }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <FiXCircle size={24} />
              </button>

              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{showEditProductModal ? 'Edit Product' : 'Add New Product'}</h2>
                <form className="space-y-6" onSubmit={(e) => handleSubmitProduct(e, showEditProductModal)}>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Product Name</label>
                      <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Price ($)</label>
                      <input type="number" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                        value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Stock</label>
                      <input type="number" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                        value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                        value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} required>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea rows="4" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                      value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors" onClick={() => { setShowAddProductModal(false); setShowEditProductModal(false) }}>Cancel</button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all">Save Product</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default SellerDashboard;
