// components/OrderHistory.jsx
import React, { useState, useEffect } from 'react';
import { Package, Calendar, ChevronLeft } from 'lucide-react';
import supabase from '../SupabaseClient';

const OrderHistory = ({ myOrders, setActiveTab, setSelectedCategory, setCurrentPage }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Back button handler - redirect to Categories
  const handleBackToCategories = () => {
    setSelectedCategory("All");
    setCurrentPage(1);
    setActiveTab("catalog"); // Switch to catalog tab where categories are shown
  };

  // Fetch orders from the orders table
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const userData = localStorage.getItem('users');
      if (!userData) {
        console.error('No user found in localStorage');
        setOrders([]);
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.id;

      if (!userId) {
        console.error('No user ID found');
        setOrders([]);
        return;
      }

      // Fetch orders from orders table
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
        return;
      }

      console.log('Fetched orders:', data);
      setOrders(data || []);

    } catch (error) {
      console.error('Error in fetchOrders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Calculate total number of items across all orders
  const getTotalItemsCount = () => {
    return orders.reduce((total, order) => total + (order.total_item || 0), 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleBackToCategories}
            className="flex items-center space-x-1 text-gray-600 transition-colors hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Categories</span>
          </button>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Loading...</span>
          </div>
        </div>
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleBackToCategories}
          className="flex items-center space-x-1 text-gray-600 transition-colors hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Categories</span>
        </button>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{orders.length} orders
             {/* • {getTotalItemsCount()} items */}

          </span>
        </div>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <EmptyOrders setActiveTab={setActiveTab} />
      )}
    </div>
  );
};

const OrderCard = ({ order }) => {
  // Parse the items JSON array
  const items = Array.isArray(order.items) ? order.items : [];
  
  // Calculate total weight for the entire order
  const calculateTotalOrderWeight = () => {
    const totalWeight = items.reduce((total, item) => {
      if (!item.weight) return total;
      const weightNum = parseFloat(String(item.weight).replace("g", "")) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + (weightNum * quantity);
    }, 0);
    
    return totalWeight > 0 ? `${totalWeight.toFixed(1)}g` : "N/A";
  };

  // Calculate total price for the entire order
  const calculateTotalOrderPrice = () => {
    const totalPrice = items.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + (price * quantity);
    }, 0);
    
    return totalPrice.toLocaleString();
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-lg">
      {/* Order Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">
            Order #{order.id}
          </h3>
          <p className="text-sm text-gray-600">
            {new Date(order.created_at).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
            Completed
          </span>
          <p className="text-sm text-gray-600 mt-1">
            {order.total_item} item{order.total_item !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-4 space-y-3">
        <h4 className="font-medium text-gray-900">Items in this order:</h4>
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <img
              src={item.product_image_url || "https://via.placeholder.com/48x48?text=No+Image"}
              alt={item.product_name}
              className="object-cover w-12 h-12 rounded-lg"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.product_name}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Qty: {item.quantity}</span>
                {item.weight && <span>Weight: {item.weight}</span>}
                {item.price > 0 && <span>₹{parseFloat(item.price).toLocaleString()}</span>}
              </div>
            </div>
            <div className="text-right">
              {item.status && (
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                  item.status === 'booked' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3 pt-4 border-t border-gray-200">
        <div>
          <p className="text-gray-500">Total Items</p>
          <p className="font-medium text-gray-900">{order.total_item}</p>
        </div>
        <div>
          <p className="text-gray-500">Total Weight</p>
          <p className="font-medium text-gray-900">{calculateTotalOrderWeight()}</p>
        </div>
        <div>
          <p className="text-gray-500">Order Date</p>
          <p className="font-medium text-gray-900">
            {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Order Progress */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <span className="text-xs text-gray-500">
              Order completed on {new Date(order.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyOrders = ({ setActiveTab }) => (
  <div className="py-16 text-center bg-white rounded-2xl border border-gray-200">
    <Package className="mx-auto mb-4 w-16 h-16 text-gray-300" />
    <h3 className="mb-2 text-xl font-medium text-gray-900">No orders yet</h3>
    <p className="mb-6 text-gray-600">Your order history will appear here</p>
    <div className="flex justify-center">
      <button
        onClick={() => setActiveTab("catalog")}
        className="flex items-center px-6 py-3 space-x-2 font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg transition-all hover:from-amber-600 hover:to-orange-600"
      >
        <Package className="w-4 h-4" />
        <span>Start Shopping</span>
      </button>
    </div>
  </div>
);

export default OrderHistory;