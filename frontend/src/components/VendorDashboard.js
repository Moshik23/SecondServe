import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Package, DollarSign, TrendingUp, LogOut, Plus, RefreshCw } from 'lucide-react';
import VendorProducts from './VendorProducts';
import VendorOrders from './VendorOrders';
import VendorAnalytics from './VendorAnalytics';

function VendorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [isRealtime, setIsRealtime] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (isRealtime) {
        fetchAnalytics();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isRealtime]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/vendor/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-xl font-bold text-gray-800">FoodHawk Vendor</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full realtime-indicator ${isRealtime ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {isRealtime ? 'Live' : 'Paused'}
              </span>
              <button
                onClick={() => setIsRealtime(!isRealtime)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <Link to="/vendor/products" className="py-4 px-2 border-b-2 border-green-500 text-green-600 font-medium">
              Products
            </Link>
            <Link to="/vendor/orders" className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-gray-800 font-medium">
              Orders
            </Link>
            <Link to="/vendor/analytics" className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-gray-800 font-medium">
              Analytics
            </Link>
          </div>
        </div>
      </nav>

      {/* Analytics Cards */}
      {analytics && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">${analytics.total_revenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.total_sales}</p>
                </div>
                <Package className="w-10 h-10 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Products</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.active_products}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Waste Prevented</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.waste_prevented} items</p>
                </div>
                <span className="text-3xl">♻️</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<VendorProducts />} />
          <Route path="products" element={<VendorProducts />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="analytics" element={<VendorAnalytics />} />
        </Routes>
      </div>
    </div>
  );
}

export default VendorDashboard;
