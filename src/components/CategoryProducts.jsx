import React, { useState, useEffect } from 'react';
import { ChevronLeft, Filter, ShoppingCart, Package, Trash2 } from 'lucide-react';
import supabase from '../SupabaseClient';

const CategoryProducts = ({
  selectedCategory,
  setSelectedCategory,
  products,
  productsLoading,
  showFilters,
  setShowFilters,
  minWeight,
  setMinWeight,
  maxWeight,
  setMaxWeight,
  sortBy,
  setSortBy,
  clickedItems,
  handleAddToCartClick,
  handleRemoveFromCart, // Add this prop
 
}) => {
  const [addingToCart, setAddingToCart] = useState({});
  const [removingFromCart, setRemovingFromCart] = useState({});
  const [cartItems, setCartItems] = useState([]);

  // Fetch user's cart items
  const fetchCartItems = async () => {
    try {
      const userData = localStorage.getItem('users');
      if (!userData) return;

      const user = JSON.parse(userData);
      const userId = user.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('cart_item')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching cart items:', error);
        return;
      }

      setCartItems(data || []);
    } catch (error) {
      console.error('Error in fetchCartItems:', error);
    }
  };

  // Check if product is in cart
  const isProductInCart = (productId) => {
    return cartItems.some(item => String(item.product_id) === String(productId));
  };

  // Get cart item for product
  const getCartItem = (productId) => {
    return cartItems.find(item => item.product_id === productId);
  };

  // Remove from cart function
  const removeFromCartInSupabase = async (product) => {
    try {
      const userData = localStorage.getItem('users');
      if (!userData) return false;

      const user = JSON.parse(userData);
      const userId = user.id;
      if (!userId) return false;

      setRemovingFromCart(prev => ({ ...prev, [product.id]: true }));

      const cartItem = getCartItem(product.id);
      if (!cartItem) return false;

      const { error } = await supabase
        .from('cart_item')
        .delete()
        .eq('id', cartItem.id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing from cart:', error);
        return false;
      }

      // Update local cart items state
      setCartItems(prev => prev.filter(item => item.id !== cartItem.id));
      return true;
    } catch (error) {
      console.error('Error in removeFromCart:', error);
      return false;
    } finally {
      setRemovingFromCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  // Updated handleAddToCart with event prevention
  const handleAddToCart = async (product, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Prevent multiple clicks
    if (addingToCart[product.id]) {
      return;
    }

    setAddingToCart(prev => ({ ...prev, [product.id]: true }));
    try {
      await handleAddToCartClick({
        id: product.id,
        name: product.product_name,
        category_name: product.category_name
      }, event);
      await fetchCartItems(); // Refresh cart items after adding
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  // Updated handleRemoveClick with event prevention
  const handleRemoveClick = async (product, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Prevent multiple clicks
    if (removingFromCart[product.id]) {
      return;
    }

    setRemovingFromCart(prev => ({ ...prev, [product.id]: true }));
    try {
      await handleRemoveFromCart(product.id);
      await fetchCartItems(); // Refresh cart items after removal
    } finally {
      setRemovingFromCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  // Fetch cart items on component mount
  useEffect(() => {
    fetchCartItems();
  }, []);

  return (
    <div className="space-y-6">
      {/* Filter & Sort Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 p-3 border-b border-gray-200 shadow-md backdrop-blur-sm bg-white/95 md:sticky md:top-4 md:p-6 md:rounded-2xl md:border-2 md:shadow-xl md:bg-white md:border-amber-200 md:mb-8">
        <div className="flex flex-wrap gap-2 justify-between items-center md:gap-4">
          <div className="flex flex-wrap gap-2 items-center md:gap-3">
            <button
              onClick={() => setSelectedCategory("All")}
              className="flex items-center px-2 py-1.5 text-xs font-medium text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 md:px-3 md:py-2 md:text-sm"
            >
              <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Catalog</span>
              <span className="sm:hidden">Back</span>
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3 py-2 space-x-2 text-sm font-semibold rounded-xl border-2 shadow-lg transition-all md:px-4 md:py-3 md:space-x-3 ${
                showFilters
                  ? "text-white bg-gradient-to-r from-amber-500 to-orange-500 border-amber-500"
                  : "text-gray-700 bg-white border-gray-300 hover:bg-amber-50 hover:border-amber-300"
              }`}
            >
              <Filter className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block px-2 py-1.5 w-full text-xs text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 md:px-3 md:py-2 md:text-sm md:pr-8"
              >
                <option value="weight">Weight: Low to High</option>
                <option value="weight-desc">Weight: High to Low</option>
                <option value="name">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-1 pointer-events-none md:px-2">
                <ChevronLeft className="w-3 h-3 text-gray-500 md:w-4 md:h-4 rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="p-4 mt-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 md:mt-6 md:p-6 animate-fade-in">
            <h3 className="mb-2 text-xs font-semibold text-gray-700 md:mb-3 md:text-sm">Filter by Weight (grams)</h3>
            <div className="flex gap-2 md:gap-4">
              <div className="flex-1">
                <label className="block mb-1 text-xs text-gray-600">Min Weight</label>
                <input
                  type="number"
                  value={minWeight}
                  onChange={(e) => setMinWeight(e.target.value)}
                  placeholder="Min"
                  className="block w-full px-2 py-1.5 text-xs text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 md:px-3 md:py-2 md:text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-xs text-gray-600">Max Weight</label>
                <input
                  type="number"
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(e.target.value)}
                  placeholder="Max"
                  className="block w-full px-2 py-1.5 text-xs text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 md:px-3 md:py-2 md:text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {showFilters && <div className="block h-36 md:hidden"></div>}

      {productsLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6 md:gap-8">
          {products
            .filter((product) => {
              const weightNum = parseFloat((product.weight || "0").replace("g", "")) || 0;
              const min = minWeight ? parseFloat(minWeight) : 0;
              const max = maxWeight ? parseFloat(maxWeight) : Infinity;
              return weightNum >= min && weightNum <= max;
            })
            .sort((a, b) => {
              const aNum = parseFloat((a.weight || "0").replace("g", "")) || 0;
              const bNum = parseFloat((b.weight || "0").replace("g", "")) || 0;
              switch (sortBy) {
                case "weight-desc": return bNum - aNum;
                case "name": return a.product_name.localeCompare(b.product_name);
                case "name-desc": return b.product_name.localeCompare(a.product_name);
                default: return aNum - bNum;
              }
            })
            .map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                clickedItems={clickedItems}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveClick}
                addingToCart={addingToCart[product.id] || false}
                removingFromCart={removingFromCart[product.id] || false}
                isInCart={isProductInCart(product.id)}
              />
            ))}
        </div>
      )}

      {!productsLoading && products.length === 0 && (
        <div className="py-16 text-center">
          <Package className="mx-auto mb-4 w-16 h-16 text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No products found</h3>
          <p className="text-gray-500">No products available in {selectedCategory} category</p>
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ 
  product, 
  clickedItems, 
  onAddToCart, 
  onRemoveFromCart,
  addingToCart, 
  removingFromCart,
  isInCart 
}) => {
  const itemId = `product-${product.id}`;

  return (
    <div
      className={`overflow-hidden relative rounded-2xl border shadow-md group hover:shadow-xl hover:-translate-y-1 transition-transform duration-300 ${
        isInCart ? "bg-green-100 border-green-400" : "bg-white border-gray-200"
      }`}
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInCart) {
          onRemoveFromCart(product, e);
        }
      }}
    >
      <div className="aspect-square w-full overflow-hidden rounded-t-2xl">
        <img
          src={product.product_image_url || product.image || "https://via.placeholder.com/300x300?text=No+Image"}
          alt={product.product_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col justify-between p-4">
        {/* Product Info */}
        <div>
          <h3 className="text-white font-bold text-lg truncate">{product.product_name}</h3>
          {product.description && <p className="text-white/80 text-sm truncate">{product.description}</p>}
        </div>

        {/* Cart Button */}
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center text-white font-semibold px-6 space-x-3 bg-black/40 backdrop-blur-sm rounded-full py-2">
            view
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isInCart) {
                onRemoveFromCart(product, e);
              } else {
                onAddToCart(product, e);
              }
            }}
            disabled={addingToCart || removingFromCart}
            className={`p-2 rounded-full text-white shadow-lg border border-white/20 transition-transform hover:scale-110 active:scale-95 ${
              isInCart
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            }`}
          >
            {(addingToCart || removingFromCart) ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Weight Badge */}
        {product.weight && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full backdrop-blur-sm bg-black/60 text-white text-xs font-semibold">
            {parseFloat(String(product.weight).replace("g", "")).toFixed(2)} g
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;