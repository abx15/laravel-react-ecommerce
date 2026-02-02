import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiDollarSign, FiPackage, FiShoppingCart, FiTrendingUp, FiStar, FiImage, FiUpload, FiXCircle } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';

import api from '../../services/api';
import { useLocation } from 'react-router-dom';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    discount_percentage: '',
    category_id: '',
    stock: '',
    status: 'active',
    images: []
  });

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/products')) setActiveTab('products');
    else if (path.includes('/orders')) setActiveTab('orders');
    else if (path.includes('/analytics')) setActiveTab('analytics');
    else setActiveTab('overview');
  }, [location]);

  useEffect(() => {
    fetchDashboardData();
    fetchCategories();
  }, []);

  // Calculation Effect: Auto-calculate Discount %
  useEffect(() => {
    if (formData.price && formData.original_price) {
      const price = parseFloat(formData.price);
      const original = parseFloat(formData.original_price);
      if (original > price && original > 0) {
        const discount = Math.round(((original - price) / original) * 100);
        setFormData(prev => ({ ...prev, discount_percentage: discount }));
      }
    }
  }, [formData.price, formData.original_price]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, productsRes, ordersRes] = await Promise.allSettled([
        api.get('/seller/dashboard'),
        api.get('/seller/products-list'),
        api.get('/seller/orders')
      ]);

      if (dashboardRes.status === 'fulfilled') setStats(dashboardRes.value.data);
      if (productsRes.status === 'fulfilled') setProducts(productsRes.value.data.data || []);
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data.data || []);
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

  const handleImageDelete = async (imageId) => {
    if (!confirm("Delete this image?")) return;
    try {
      await api.delete(`/product-images/${imageId}`);
      // Refresh product data to remove image from UI
      fetchDashboardData();
      // Also remove from selectedProduct if it's the one being edited
      if (selectedProduct) {
        setSelectedProduct(prev => ({
          ...prev,
          images: prev.images.filter(img => img.id !== imageId)
        }));
      }
    } catch (error) {
      console.error("Failed to delete image", error);
    }
  };

  const handleSubmitProduct = async (e, isEdit = false) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'images') data.append(key, formData[key] || '');
    });

    if (formData.images && formData.images.length > 0) {
      for (let i = 0; i < formData.images.length; i++) {
        data.append(`images[${i}]`, formData.images[i]);
      }
    }

    try {
      if (isEdit) {
        data.append('_method', 'PUT');
        await api.post(`/seller/products/${selectedProduct.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/seller/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      setShowAddProductModal(false);
      setShowEditProductModal(false);
      resetForm();
      fetchDashboardData();
    } catch (error) {
      console.error(error);
      alert('Operation failed. Check all fields.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Are you sure you want to remove this product?')) {
      try {
        await api.delete(`/seller/products/${id}`);
        fetchDashboardData();
      } catch (err) { console.error(err); }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', original_price: '', discount_percentage: '', category_id: '', stock: '', status: 'active', images: [] });
    setSelectedProduct(null);
  };

  const initiateEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      original_price: product.original_price,
      discount_percentage: product.discount_percentage,
      category_id: product.category_id,
      stock: product.stock,
      status: product.status,
      images: [] // Keep empty for new uploads
    });
    setShowEditProductModal(true);
  };

  // --- Helper Components ---
  const StatCard = ({ title, value, icon, trend, gradient }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`relative overflow-hidden rounded-2xl p-6 shadow-xl ${gradient} text-white group`}>
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
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shadow-inner text-2xl">{icon}</div>
      </div>
    </motion.div>
  );

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-50"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100 px-8 py-5 flex justify-between items-center backdrop-blur-xl bg-white/80">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">Seller Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage inventory, orders & performance</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium shadow-md" onClick={() => { resetForm(); setShowAddProductModal(true); }}>
          <FiPlus className="mr-2" /> Add Product
        </button>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-8">

        {/* Stats Grid (Hidden on mobile for brevity) */}
        <div className="hidden lg:grid grid-cols-4 gap-6">
          <StatCard title="Total Revenue" value={`$${stats?.my_revenue || 0}`} icon={<FiDollarSign />} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" trend={12.5} />
          <StatCard title="Products" value={stats?.my_products_count || 0} icon={<FiPackage />} gradient="bg-gradient-to-br from-blue-500 to-indigo-600" trend={8.1} />
          <StatCard title="Orders" value={stats?.my_orders || 0} icon={<FiShoppingCart />} gradient="bg-gradient-to-br from-orange-400 to-pink-500" trend={15.4} />
          <StatCard title="Avg Rating" value="4.8" icon={<FiStar />} gradient="bg-gradient-to-br from-purple-500 to-violet-600" trend={0.0} />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 bg-white/60 p-1.5 rounded-2xl w-fit backdrop-blur-md border border-gray-200/50 shadow-sm mx-auto lg:mx-0">
          {['overview', 'products', 'orders', 'analytics'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-white text-emerald-700 shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}>{tab}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

            {activeTab === 'overview' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                <img src="/placeholder_chart.svg" alt="Analytics" className="w-64 opacity-50 mb-4" />
                {/* Placeholder for now as users mainly want product tab functionality */}
                <p className="text-gray-500">Sales overview and recent activity will appear here.</p>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                  <h3 className="text-lg font-bold text-gray-800">Product Inventory</h3>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search products..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Product</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Pricing</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stock</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img src={product.images?.[0]?.image_path || 'https://via.placeholder.com/40'} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                              <div>
                                <p className="text-sm font-bold text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.category?.name || 'Uncategorized'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-emerald-600">${product.price}</span>
                              {product.original_price && <span className="text-xs text-gray-400 line-through">${product.original_price}</span>}
                              {product.discount_percentage > 0 && <span className="text-xs text-green-600 font-medium">{product.discount_percentage}% OFF</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-medium ${product.stock < 10 ? 'text-red-500' : 'text-gray-700'}`}>{product.stock} Units</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {product.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => initiateEdit(product)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"><FiEdit2 size={16} /></button>
                              <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><FiTrash2 size={16} /></button>
                            </div>
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

      {/* Modern Product Modal */}
      <AnimatePresence>
        {(showAddProductModal || showEditProductModal) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-8 py-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">{showEditProductModal ? 'Edit Product' : 'Add New Inventory'}</h2>
                <button onClick={() => { setShowAddProductModal(false); setShowEditProductModal(false) }} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><FiXCircle size={24} /></button>
              </div>

              <form className="p-8 space-y-8" onSubmit={(e) => handleSubmitProduct(e, showEditProductModal)}>

                {/* Section 1: Basic Details */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2"><FiPackage className="text-emerald-500" /> Product Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Product Name</label>
                      <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="e.g. Wireless Mouse" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Category</label>
                      <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} required>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Description</label>
                      <textarea rows="4" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="Detailed product description..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required></textarea>
                    </div>
                  </div>
                </div>

                {/* Section 2: Pricing & Inventory */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2"><FiDollarSign className="text-blue-500" /> Pricing & Stock</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">MRP (Original Price)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input type="number" className="w-full pl-8 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="100.00" value={formData.original_price} onChange={e => setFormData({ ...formData, original_price: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Selling Price</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input type="number" className="w-full pl-8 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="80.00" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Discount % (Auto)</label>
                      <input type="number" className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-500" value={formData.discount_percentage} readOnly placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Stock Quantity</label>
                      <input type="number" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="Available units" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required />
                    </div>
                  </div>
                </div>

                {/* Section 3: Images */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2"><FiImage className="text-purple-500" /> Product Images</h3>

                  {/* Existing Images */}
                  {selectedProduct?.images?.length > 0 && (
                    <div className="mb-4">
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Current Images</label>
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {selectedProduct.images.map(img => (
                          <div key={img.id} className="relative group shrink-0">
                            <img src={img.image_path} alt="Product" className="w-24 h-24 object-cover rounded-xl border border-gray-200" />
                            <button type="button" onClick={() => handleImageDelete(img.id)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md"><FiXCircle size={16} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer relative group">
                    <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => setFormData({ ...formData, images: e.target.files })} />
                    <div className="flex flex-col items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform"><FiUpload size={24} /></div>
                      <p className="text-sm font-semibold text-gray-700">Click to upload new images</p>
                      <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                      {formData.images?.length > 0 && (
                        <div className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold animate-pulse">
                          {formData.images.length} files selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 sticky bottom-0 bg-white z-10 pb-2">
                  <button type="button" className="px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors" onClick={() => { setShowAddProductModal(false); setShowEditProductModal(false) }}>Cancel</button>
                  <button type="submit" className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:shadow-lg hover:shadow-emerald-200 transform hover:-translate-y-0.5 transition-all">
                    {showEditProductModal ? 'Update Product' : 'Publish Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SellerDashboard;
