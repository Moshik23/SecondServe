import React, { useState, useEffect } from 'react';
import api from '../services/api';

function VendorOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Orders</h2>
      
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No orders yet
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">Order #{order.id}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800 mt-2">
                    Quantity: {order.quantity}
                  </p>
                  <p className="text-gray-600">Total: ${order.total_price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default VendorOrders;
