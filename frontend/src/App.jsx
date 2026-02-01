import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './layouts/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import BecomeSeller from './pages/auth/BecomeSeller';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';

import SellerDashboard from './pages/seller/SellerDashboard';
import ProductForm from './pages/seller/ProductForm';

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
    <AuthProvider>
      <Router>
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
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/order-success" element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin', 'super_admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Seller Routes */}
            <Route path="/seller/dashboard" element={
              <ProtectedRoute roles={['seller']}>
                <SellerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/seller/products/create" element={
              <ProtectedRoute roles={['seller']}>
                <ProductForm />
              </ProtectedRoute>
            } />
            <Route path="/seller/products/:id/edit" element={
              <ProtectedRoute roles={['seller']}>
                <ProductForm />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
