import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './layouts/Layout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import BecomeSeller from './pages/auth/BecomeSeller';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Dashboard from './pages/Dashboard'; // Legacy user dashboard?
import AdminDashboard from './pages/AdminDashboard'; // Legacy?
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';

import SellerDashboard from './pages/seller/SellerDashboard';
import ProductForm from './pages/seller/ProductForm';
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import AdminDashboardNew from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // Check role if required
  if (roles.length > 0) {
    const hasRole = user.roles && user.roles.some(r => roles.includes(r.name));
    if (!hasRole) return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/become-seller" element={
              <ProtectedRoute>
                <BecomeSeller />
              </ProtectedRoute>
            } />

            {/* User Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute roles={['user']}>
                <DashboardLayout>
                  <UserDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/user/orders" element={
              <ProtectedRoute roles={['user']}>
                <DashboardLayout>
                  <UserDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/user/addresses" element={
              <ProtectedRoute roles={['user']}>
                <DashboardLayout>
                  <UserDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute>
                <Layout>
                  <Cart />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Layout>
                  <Checkout />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/order-success" element={
              <ProtectedRoute>
                <Layout>
                  <OrderSuccess />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <AdminDashboardNew />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <AdminDashboardNew />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <AdminDashboardNew />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/seller-requests" element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <AdminDashboardNew />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/sellers" element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <AdminDashboardNew />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/categories" element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <AdminDashboardNew />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Super Admin Dashboard Routes */}
            <Route path="/super-admin/*" element={
              <ProtectedRoute roles={['super_admin']}>
                <DashboardLayout>
                  <SuperAdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Seller Dashboard Routes */}
            <Route path="/seller/dashboard" element={
              <ProtectedRoute roles={['seller']}>
                <DashboardLayout>
                  <SellerDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller/products" element={
              <ProtectedRoute roles={['seller']}>
                <DashboardLayout>
                  <SellerDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller/orders" element={
              <ProtectedRoute roles={['seller']}>
                <DashboardLayout>
                  <SellerDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller/analytics" element={
              <ProtectedRoute roles={['seller']}>
                <DashboardLayout>
                  <SellerDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller/products/create" element={
              <ProtectedRoute roles={['seller']}>
                <DashboardLayout>
                  <ProductForm />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/seller/products/:id/edit" element={
              <ProtectedRoute roles={['seller']}>
                <DashboardLayout>
                  <ProductForm />
                </DashboardLayout>
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
