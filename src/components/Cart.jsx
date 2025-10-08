// components/Cart.jsx
import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Trash2 } from 'lucide-react';
import supabase from '../SupabaseClient';

const Cart = ({ 
  showCartModal, 
  setShowCartModal, 
  setActiveTab, 
  onCartUpdate,
  onConfirmOrder,
  setToast,
  fetchCartItems
}) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingFromCart, setRemovingFromCart] = useState({});

  // Fetch cart items from Supabase
  const fetchCartItem = async () => {
    try {
      setLoading(true);
      
      const userData = localStorage.getItem('users');
      if (!userData) {
        console.error('No user found in localStorage');
        setCartItems([]);
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.id;

      if (!userId) {
        console.error('No user ID found');
        setCartItems([]);
        return;
      }

      const { data, error } = await supabase
        .from('cart_item')
        .select(`
          *,
          products (*),
          users (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cart items:', error);
        setCartItems([]);
        return;
      }

      console.log('Fetched cart items:', data);
      setCartItems(data || []);

    } catch (error) {
      console.error('Error in fetchCartItems:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Updated removeFromCart function - NO TOASTS HERE
  const removeFromCart = async (cartItemId, productName = "Item") => {
    try {
      setRemovingFromCart(prev => ({ ...prev, [cartItemId]: true }));

      const { error } = await supabase
        .from('cart_item')
        .delete()
        .eq('id', cartItemId);

      if (error) {
        console.error('Error removing from cart:', error);
        return false;
      }
      
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
      if (onCartUpdate) onCartUpdate();
      console.log(' removeFromCart: cart');
      await fetchCartItems(); // refresh cart item
      // DON'T show toast here - let the parent handle it
      return true;
    } catch (error) {
      console.error('Error in removeFromCart: cart', error);
      return false;
    } finally {
      setRemovingFromCart(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  // Clear cart function - NO TOASTS HERE
  const clearCart = async () => {
    try {
      const userData = localStorage.getItem('users');
      if (!userData) return false;

      const user = JSON.parse(userData);
      const userId = user.id;

      const { error } = await supabase
        .from('cart_item')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing cart:', error);
        return false;
      }

      setCartItems([]);
      if (onCartUpdate) onCartUpdate();
      return true;

    } catch (error) {
      console.error('Error in clearCart:', error);
      return false;
    }
  };

  // Calculate cart totals
  const getCartItemCount = () => {
    return cartItems.length;
  };

  const getCartTotalWeight = () => {
    return cartItems
      .reduce((total, item) => {
        if (!item.products?.weight) return total;
        const weightNum = parseFloat(String(item.products.weight).replace("g", "")) || 0;
        return total + weightNum;
      }, 0)
      .toFixed(1);
  };

  const getCartTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.products?.price) || 0;
      return total + price;
    }, 0);
  };

  // Fetch cart items when modal opens
  useEffect(() => {
    if (showCartModal) {
      fetchCartItem();
    }
  }, [showCartModal]);

  const confirmOrder = async () => {
    try {
      if (onConfirmOrder) {
        await onConfirmOrder();
      } else {
        const success = await clearCart();
        if (success) {
          setShowCartModal(false);
          setActiveTab('bookings');
        }
      }
    } catch (error) {
      console.error('Error confirming order:', error);
    }
  };

  if (!showCartModal) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50 ios-modal">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Shopping Cart</h3>
          <button
            onClick={() => setShowCartModal(false)}
            className="p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : cartItems.length > 0 ? (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-2xl divide-y divide-gray-200">
              {cartItems.map((item) => (
                <CartItem 
                  key={item.id} 
                  item={item} 
                  onRemove={removeFromCart}
                  removing={removingFromCart[item.id] || false}
                />
              ))}
            </div>

            <CartSummary 
              cartItems={cartItems}
              getCartItemCount={getCartItemCount}
              getCartTotalWeight={getCartTotalWeight}
              getCartTotalPrice={getCartTotalPrice}
              clearCart={clearCart}
              confirmOrder={confirmOrder}
              setShowCartModal={setShowCartModal}
            />
          </div>
        ) : (
          <EmptyCart setShowCartModal={setShowCartModal} setActiveTab={setActiveTab} />
        )}
      </div>
    </div>
  );
};

// Updated CartItem component
const CartItem = ({ item, onRemove, removing }) => {
  const product = item.products || {};

  return (
    <div className="flex items-center p-4 space-x-4 transition-colors hover:bg-gray-100">
      <img
        src={product.product_image_url || "https://via.placeholder.com/64x64?text=No+Image"}
        alt={product.product_name}
        className="object-cover w-16 h-16 rounded-xl"
      />
      <div className="flex-1">
        <h4 className="text-base font-semibold text-gray-900">{product.product_name}</h4>
        <p className="text-sm text-gray-600">{product.category_name}</p>
        <p className="text-xs text-gray-500">
          Weight: {product.weight ? `${parseFloat(String(product.weight).replace("g", "")).toFixed(1)}g` : "N/A"}
        </p>
      
        <div className="flex items-center space-x-3 mt-2">
          <button
            onClick={() => onRemove(item.id, product.product_name)}
            disabled={removing}
            className="flex items-center px-3 py-1 text-red-600 bg-red-50 rounded-lg border border-red-200 transition-colors hover:bg-red-100 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove item from cart"
          >
            {removing ? (
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

const CartSummary = ({ 
  cartItems,
  getCartItemCount, 
  getCartTotalWeight, 
  getCartTotalPrice,
  clearCart, 
  confirmOrder, 
  setShowCartModal 
}) => (
  <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
    <h4 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h4>

    <div className="mb-6 space-y-3">
      <div className="flex justify-between text-gray-600">
        <span>Total Items:</span>
        <span>{getCartItemCount()} items</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>Total Weight:</span>
        <span className="font-medium text-amber-600">{getCartTotalWeight()}g</span>
      </div>
    </div>

    <div className="flex gap-3">
      <button
        onClick={clearCart}
        className="flex-1 px-4 py-3 font-medium text-red-600 bg-red-50 rounded-xl border border-red-200 transition-colors hover:bg-red-100 hover:text-red-700"
      >
        Clear Cart
      </button>
      <button
        onClick={confirmOrder}
        className="flex-1 px-4 py-3 font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg transition-all hover:from-amber-600 hover:to-orange-600"
      >
        Confirm Order
      </button>
    </div>
  </div>
);

const EmptyCart = ({ setShowCartModal, setActiveTab }) => (
  <div className="py-16 text-center">
    <ShoppingCart className="mx-auto mb-4 w-16 h-16 text-gray-300" />
    <h4 className="mb-2 text-lg font-medium text-gray-900">Your cart is empty</h4>
    <p className="mb-6 text-gray-600">Add some beautiful jewellery to your cart</p>
    <div className="flex gap-3">
      <button
        onClick={() => {
          setShowCartModal(false);
          setActiveTab("catalog");
        }}
        className="flex-1 px-6 py-3 font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg transition-all hover:from-amber-600 hover:to-orange-600"
      >
        Browse Catalogue
      </button>
    </div>
  </div>
);

export default Cart;