import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'customer',
    location: '{"lat": 1.3521, "lng": 103.8198}'
  });
  const [error, setError] = useState('');
  const { login, register, user } = useAuth();

  if (user) {
    return <Navigate to={user.role === 'vendor' ? '/vendor' : '/customer'} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        setError(result.error);
      }
    } else {
      const result = await register(formData);
      if (result.success) {
        setIsLogin(true);
        setError('Registration successful! Please login.');
      } else {
        setError(result.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-2">🍽️ FoodHawk</h1>
          <p className="text-gray-600">Reduce food waste, save money</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="customer">Customer</option>
                <option value="vendor">Vendor (Food Hawker)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center mb-4">Demo Accounts:</p>
          <div className="space-y-2 text-sm">
            <button
              onClick={() => setFormData({ ...formData, email: 'vendor@demo.com', password: 'demo123', role: 'vendor', name: 'Demo Vendor' })}
              className="w-full text-left px-3 py-2 bg-gray-50 rounded hover:bg-gray-100"
            >
              🏪 Vendor: vendor@demo.com / demo123
            </button>
            <button
              onClick={() => setFormData({ ...formData, email: 'customer@demo.com', password: 'demo123', role: 'customer', name: 'Demo Customer' })}
              className="w-full text-left px-3 py-2 bg-gray-50 rounded hover:bg-gray-100"
            >
              👤 Customer: customer@demo.com / demo123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
