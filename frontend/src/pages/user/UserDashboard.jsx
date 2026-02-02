import React, { useState, useEffect } from 'react';
import { FiPackage, FiClock, FiCheckCircle, FiShoppingBag, FiUser, FiMapPin, FiCreditCard, FiLogOut, FiTrendingUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import api from '../../services/api';
import './UserDashboard.css';

import { useLocation } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/orders')) setActiveTab('orders');
    else if (path.includes('/addresses')) setActiveTab('addresses');
    else setActiveTab('overview');
  }, [location]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashboardRes, ordersRes] = await Promise.all([
        api.get('/user/dashboard'), // Assuming this exists or falls back
        api.get('/user/orders')
      ]);
      setData(dashboardRes.data);
      setOrders(ordersRes.data.data || []);
    } catch (error) {
      console.error("User Data Error", error);
    } finally {
      setLoading(false);
    }
  };

  // Components
  const StatCard = ({ title, value, icon, gradient, delay }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`relative overflow-hidden rounded-2xl p-6 shadow-lg ${gradient} text-white`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20 blur-xl"></div>
      <div className="relative z-10 flex justify-between items-center">
        <div>
          <p className="text-white/80 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-3xl bg-white/20 p-3 rounded-xl backdrop-blur-sm">{icon}</div>
      </div>
    </motion.div>
  );

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>;

  const user = data?.user || { name: 'User' };
  const stats = data?.stats || { total_orders: 0, pending_orders: 0, completed_orders: 0, total_spent: 0 };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-30 px-8 py-4 flex justify-between items-center shadow-sm border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">My Dashboard</h1>
          <p className="text-xs text-gray-500">Welcome back, {user.name}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-md">
          {user.name[0]}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Orders" value={stats.total_orders} icon={<FiPackage />} gradient="bg-gradient-to-br from-indigo-500 to-blue-600" delay={0.1} />
          <StatCard title="Pending" value={stats.pending_orders} icon={<FiClock />} gradient="bg-gradient-to-br from-orange-400 to-pink-500" delay={0.2} />
          <StatCard title="Completed" value={stats.completed_orders} icon={<FiCheckCircle />} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" delay={0.3} />
          <StatCard title="Total Spent" value={`$${stats.total_spent}`} icon={<FiShoppingBag />} gradient="bg-gradient-to-br from-violet-500 to-purple-600" delay={0.4} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content (Orders) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
                <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
              </div>

              <div className="space-y-4">
                {orders.length > 0 ? orders.slice(0, 5).map(order => (
                  <motion.div
                    whileHover={{ y: -2 }}
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">
                        <FiPackage />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Order #{order.id}</p>
                        <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()} • {order.order_items?.length || 0} items</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${order.total_amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {order.status}
                      </span>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-10 text-gray-400">No orders found.</div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Profile</h2>

              <div className="flex flex-col items-center mb-8">
                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-1 mb-4">
                  <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800">{user.name[0]}</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 text-gray-700 font-medium">
                    <FiUser /> Edit Profile
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 text-gray-700 font-medium">
                    <FiMapPin /> Addresses
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
