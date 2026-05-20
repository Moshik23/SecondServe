import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, Clock, Percent, Star } from 'lucide-react';

function CustomerBrowse({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const filteredProducts = filter === 'all' 
    ? products 
    : filter === 'discounted' 
      ? products.filter(p => p.discount_percentage > 0)
      : products.filter(p => p.stock > 5);

  const getTimeBadge = (expiryDate) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const hours = Math.floor((expiry - now) / (1000 * 60 * 60));
    
    if (hours < 0) return null;
    if (hours < 6) return { text: 'Expires Soon', color: 'bg-red-500' };
    if (hours < 24) return { text: 'Today', color: 'bg-orange-500' };
    return null;
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {['all', 'discounted', 'plenty'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full font-medium capitalize whitespace-nowrap ${
              filter === f 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {f === 'discounted' && <Percent className="w-4 h-4 inline mr-1" />}
            {f}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const timeBadge = getTimeBadge(product.expiry_date);
          return (
            <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <div className="h-48 bg-gray-200 flex items-center justify-center text-6xl">
                  🍜
                </div>
                {product.discount_percentage > 0 && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold discount-badge">
                    -{product.discount_percentage.toFixed(0)}%
                  </div>
                )}
                {timeBadge && (
                  <div className="absolute top-3 left-3 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{timeBadge.text}</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description || 'Delicious homemade food'}</p>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>0.5 km away</span>
                  <Star className="w-4 h-4 ml-3 mr-1 text-yellow-500" />
                  <span>4.8</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-green-600">${product.price.toFixed(2)}</span>
                    {product.discount_percentage > 0 && (
                      <span className="text-sm text-gray-400 line-through ml-2">
                        ${product.original_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${
                    product.stock > 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock} left
                  </span>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className={`w-full mt-4 py-2 rounded-lg font-medium transition-colors ${
                    product.stock > 0
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">No products found</p>
        </div>
      )}
    </div>
  );
}

export default CustomerBrowse;
