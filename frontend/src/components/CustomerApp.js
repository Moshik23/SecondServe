import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { MapPin, ShoppingCart, LogOut, Search, Clock, Percent } from 'lucide-react';
import CustomerBrowse from './CustomerBrowse';
import CustomerOrders from './CustomerOrders';

function CustomerApp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/customer" className="flex items-center space-x-3">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-xl font-bold text-gray-800">FoodHawk</h1>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/customer/orders"
              className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">My Orders</span>
              {cart.length > 0 && (
                <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Save Food, Save Money</h2>
          <p className="text-xl mb-6 opacity-90">Discover delicious surplus food from nearby hawkers at huge discounts</p>
          <div className="max-w-2xl mx-auto flex items-center bg-white rounded-full shadow-lg">
            <Search className="w-6 h-6 text-gray-400 ml-4" />
            <input
              type="text"
              placeholder="Search for food near you..."
              className="flex-1 px-4 py-3 rounded-full text-gray-800 focus:outline-none"
            />
            <button className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<CustomerBrowse addToCart={addToCart} />} />
          <Route path="browse" element={<CustomerBrowse addToCart={addToCart} />} />
          <Route path="orders" element={<CustomerOrders />} />
        </Routes>
      </div>
    </div>
  );
}

export default CustomerApp;
