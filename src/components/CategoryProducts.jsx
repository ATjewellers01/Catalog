import React, { useState, useEffect } from 'react';
import { ChevronLeft, Filter, ShoppingCart, Package, Trash2, X } from 'lucide-react';
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
  handleRemoveFromCart,
  fetchCartItems,
  setToast,
  updateCartCount,
  cartItems
}) => {
  const [addingToCart, setAddingToCart] = useState({});
  const [removingFromCart, setRemovingFromCart] = useState({});
 
  const [selectedImage, setSelectedImage] = useState(null);
  const [lastToastTime, setLastToastTime] = useState(0);

  // Check if any filters are active
  const hasActiveFilters = minWeight || maxWeight || sortBy !== "weight";

  // Clear all filters
  const clearFilters = () => {
    setMinWeight("");
    setMaxWeight("");
    setSortBy("weight");
  };

  // Fetch user's cart items
 

  // Check if product is in cart
  const isProductInCart = (productId) => {
    return cartItems.some(item => String(item.product_id) === String(productId));
  };

  // Show toast with debounce
  const showToast = (message, type = "success") => {
    const now = Date.now();
    if (now - lastToastTime < 1000) {
      console.log('🚫 Blocking duplicate toast');
      return;
    }
    
    setLastToastTime(now);
    setToast({
      message,
      type,
      duration: 3000,
    });
  };

  // Updated handleAddToCart function
  const handleAddToCart = async (product, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (addingToCart[product.id]) {
      return;
    }

    setAddingToCart(prev => ({ ...prev, [product.id]: true }));
    try {
      const result = await handleAddToCartClick({
        id: product.id,
        name: product.product_name,
        category_name: product.category_name
      }, event);
      
      if (result && result.success) {
        showToast(`${result.itemName} added to cart!`, "success");
      }
      
      await fetchCartItems();
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  // Updated handleRemoveClick function
  const handleRemoveClick = async (product, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (removingFromCart[product.id]) {
      return;
    }

    setRemovingFromCart(prev => ({ ...prev, [product.id]: true }));
    try {
      await handleRemoveFromCart(product.id, product.product_name);
      
      await fetchCartItems();
      if (updateCartCount) {
        await updateCartCount();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setRemovingFromCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  // Handle view image click
  const handleViewImage = (product, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setSelectedImage(product);
  };

  // Handle close full image view
  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleCloseImage();
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  // Fetch cart items on component mount
  useEffect(() => {
    fetchCartItems();
  }, []);

  return (
    <div className="space-y-6">
      {/* Full Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
            <button
              onClick={handleCloseImage}
              className="absolute -top-12 right-0 z-10 p-2 text-white hover:text-amber-300 transition-colors"
              aria-label="Close image"
            >
              <X className="w-8 h-8" />
            </button>
            
            <button
              onClick={handleCloseImage}
              className="absolute -top-12 left-0 z-10 flex items-center space-x-2 p-2 text-white hover:text-amber-300 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
              <span className="text-lg font-medium">Back</span>
            </button>

            <div className="relative rounded-2xl overflow-hidden bg-white">
              <img
                src={selectedImage.product_image_url || selectedImage.image || "https://via.placeholder.com/300x300?text=No+Image"}
                alt={selectedImage.product_name}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-white font-bold text-2xl mb-2">
                  {selectedImage.product_name}
                </h3>
                {selectedImage.description && (
                  <p className="text-white/90 text-lg mb-3">
                    {selectedImage.description}
                  </p>
                )}
                {selectedImage.weight && (
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-black/60 text-white text-lg font-semibold backdrop-blur-sm">
                    {parseFloat(String(selectedImage.weight).replace("g", "")).toFixed(2)} g
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Sort Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 p-3 border-b border-gray-200 shadow-md backdrop-blur-sm bg-white/95 md:sticky md:top-4 md:p-6 md:rounded-2xl md:border-2 md:shadow-xl md:bg-white md:border-amber-200 md:mb-8">
        <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
          {/* First Row: Back Button and Filter Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCategory("All")}
              className="flex items-center px-2 py-1.5 text-xs font-medium text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 md:px-3 md:py-2 md:text-sm"
            >
              <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Catalog</span>
              <span className="sm:hidden">Back</span>
            </button>

            {/* Filter and Clear buttons in one line */}
            <div className="flex items-center gap-1">
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-2 py-1.5 space-x-1 text-xs font-medium rounded-lg border shadow-sm transition-all md:px-4 md:py-3 md:space-x-3 md:text-sm md:rounded-xl md:border-2 md:font-semibold ${
                  showFilters
                    ? "text-white bg-gradient-to-r from-amber-500 to-orange-500 border-amber-500"
                    : "text-gray-700 bg-white border-gray-300 hover:bg-amber-50 hover:border-amber-300"
                }`}
              >
                <Filter className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Filters</span>
                <span className="sm:hidden">Filter</span>
                {hasActiveFilters && (
                  <span className="flex items-center justify-center w-3 h-3 text-[10px] text-white bg-red-500 rounded-full md:w-4 md:h-4 md:text-xs">
                    !
                  </span>
                )}
              </button>

              {/* Clear Filters Button - Only show when filters are active */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center px-2 py-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors md:px-3 md:py-2 md:text-sm"
                >
                  <X className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Clear</span>
                  <span className="sm:hidden">Clear</span>
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
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

          {/* Active Filters Summary - Mobile Only */}
          <div className="w-full md:hidden">
            {hasActiveFilters && (
              <div className="text-xs text-gray-600">
                {minWeight && `Min: ${minWeight}g`}
                {maxWeight && ` Max: ${maxWeight}g`}
                {sortBy !== "weight" && ` Sort: ${sortBy === "weight-desc" ? "High to Low" : sortBy === "name" ? "A-Z" : "Z-A"}`}
              </div>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="p-3 mt-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 md:mt-6 md:p-6 md:rounded-2xl animate-fade-in">
            <h3 className="mb-2 text-xs font-semibold text-gray-700 md:mb-3 md:text-sm">Filter by Weight (grams)</h3>
            
            {/* Mobile Compact Layout */}
            <div className="block md:hidden">
              <div className="space-y-2">
                <div>
                  <label className="block mb-1 text-xs text-gray-600">Weight Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={minWeight}
                      onChange={(e) => setMinWeight(e.target.value)}
                      placeholder="Min"
                      className="flex-1 px-2 py-1.5 text-xs text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <span className="flex items-center text-xs text-gray-500">to</span>
                    <input
                      type="number"
                      value={maxWeight}
                      onChange={(e) => setMaxWeight(e.target.value)}
                      placeholder="Max"
                      className="flex-1 px-2 py-1.5 text-xs text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
       
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex gap-4">
              <div className="flex-1">
                <label className="block mb-2 text-sm text-gray-600">Min Weight</label>
                <input
                  type="number"
                  value={minWeight}
                  onChange={(e) => setMinWeight(e.target.value)}
                  placeholder="Min"
                  className="block w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-2 text-sm text-gray-600">Max Weight</label>
                <input
                  type="number"
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(e.target.value)}
                  placeholder="Max"
                  className="block w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex justify-between items-center mt-3">
            
              
              <div className="text-xs text-gray-500 md:text-sm">
                {products.filter(product => {
                  const weightNum = parseFloat((product.weight || "0").replace("g", "")) || 0;
                  const min = minWeight ? parseFloat(minWeight) : 0;
                  const max = maxWeight ? parseFloat(maxWeight) : Infinity;
                  return weightNum >= min && weightNum <= max;
                }).length} items match
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-16 md:pt-0">
        {showFilters && <div className="block h-32 md:hidden"></div>}

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
                  onViewImage={handleViewImage}
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
    </div>
  );
};

const ProductCard = ({ 
  product, 
  clickedItems, 
  onAddToCart, 
  onRemoveFromCart,
  onViewImage,
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
        <div>
          <h3 className="text-white font-bold text-lg truncate">{product.product_name}</h3>
          {product.description && <p className="text-white/80 text-sm truncate">{product.description}</p>}
        </div>

        <div className="flex justify-between items-center mt-2">
          <button
            onClick={(e) => onViewImage(product, e)}
            className="flex items-center text-white font-semibold px-6 space-x-3 bg-black/40 backdrop-blur-sm rounded-full py-2 hover:bg-black/60 transition-colors"
          >
            view
          </button>

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