// UserDashboard.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  ShoppingCart, 
  Package, 
  History, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  ArrowUp,
  CheckCircle,
  X,
  Calendar
} from "lucide-react";
import { useJewellery } from "../context/JewelleryContext";
import Footer from "../components/Footer";
import Cart from "../components/Cart";
import CategoryProducts from "../components/CategoryProducts";
import OrderHistory from "../components/OrderHistory";
import Sidebar from "../components/Sidebar";
import supabase from "../SupabaseClient";
import { sendOrderSMS } from "../smsService";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { jewellery, addBooking } = useJewellery();

  // State declarations
  const [activeTab, setActiveTab] = useState("catalog");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [myOrders, setMyOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [clickedItems, setClickedItems] = useState(new Set());
  const [orderJustPlaced, setOrderJustPlaced] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [minWeight, setMinWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");
  const [sortBy, setSortBy] = useState("weight");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0); // Add this state for cart count
  const toastRef = useRef(null);
    const [lastToastTime, setLastToastTime] = useState(0); // Add this state
 const [cartLoading, setCartLoading] = useState(new Set());

  // Prevent automatic scroll restoration
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const preventScroll = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener("beforeunload", preventScroll);

    return () => {
      window.removeEventListener("beforeunload", preventScroll);
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
      }
    };
  }, []);

  // Responsive sidebar behavior
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handleChange = () => {
      setSidebarOpen(mq.matches);
      setIsMobile(!mq.matches);
    };
    handleChange();
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // Auto-clear toast after duration
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Back to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset order just placed flag when switching away from cart tab
  useEffect(() => {
    if (activeTab !== "cart") {
      setOrderJustPlaced(false);
    }
  }, [activeTab]);

 const [cartItems, setCartItems] = useState([]);

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

  // Fetch cart items count
const fetchCartItemsCount = async () => {
  try {
    const userData = localStorage.getItem('users');
    if (!userData) return;

    const user = JSON.parse(userData);
    const userId = user.id;
    if (!userId) return;

    const { count, error } = await supabase
      .from('cart_item')
      .select('id', { count: 'exact', head: true }) // head:true avoids fetching rows
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching cart count:', error);
      return;
    }

    setCartItemsCount(count || 0);

  } catch (error) {
    console.error('Error in fetchCartItemsCount:', error);
  }
};


// Fetch categories with product count - UPDATED to filter out sold out categories
const fetchCategories = async () => {
  setLoading(true);
  try {
    // First, fetch all categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .select("*");

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError.message);
      setCategories([]);
      return;
    }

    if (!categoriesData || categoriesData.length === 0) {
      setCategories([]);
      return;
    }

    console.log("Fetched categories successfully", categoriesData);

    // Check which categories have products and filter out sold out ones
    const categoriesWithProducts = await Promise.all(
      categoriesData.map(async (category) => {
        const categoryName = category.category_name;
        
        // Check if this category has any available products
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("id", { count: 'exact' })
          .eq("category_name", categoryName)
          .is("status", null); // Only count products that are not booked

        if (productsError) {
          console.error(`Error checking products for category ${categoryName}:`, productsError);
          return null; // Return null for categories with errors
        }

        // Return category only if it has available products
        const hasProducts = (productsData && productsData.length > 0);
        console.log(`Category ${categoryName} has available products:`, hasProducts);
        
        if (hasProducts) {
          return {
            ...category,
            hasProducts: true
          };
        } else {
          return null; // Filter out categories with no available products
        }
      })
    );

    // Filter out null values (sold out categories)
    const availableCategories = categoriesWithProducts.filter(category => category !== null);
    
    console.log("Available categories:", availableCategories);
    setCategories(availableCategories);

  } catch (error) {
    console.error("Error in fetchCategories:", error);
    setCategories([]);
  }
  setLoading(false);
};
  useEffect(() => {
    fetchCategories();
   // fetchCartItemsCount(); // Fetch cart count on component mount
  }, []);

// Fetch products by category - FIXED
const fetchProductsByCategory = async (categoryName) => {
  setProductsLoading(true);
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category_name", categoryName) // Use the parameter directly
      .is("status", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error.message);
      setProducts([]);
    } else {
      console.log(`Fetched products for ${categoryName}:`, data);
      setProducts(data);
    }
  } catch (error) {
    console.error("Error in fetchProductsByCategory:", error);
    setProducts([]);
  }
  setProductsLoading(false);
};

// Fetch products when category changes - FIXED
useEffect(() => {
  if (selectedCategory !== "All") {
    fetchProductsByCategory(selectedCategory); // Pass the selected category
  } else {
    setProducts([]);
  }
}, [selectedCategory]);

  // Update cart count when cart modal opens/closes
  useEffect(() => {
    if (showCartModal) {
      fetchCartItemsCount();
    }
  }, [showCartModal]);

// In UserDashboard.jsx - improve the processing state
const [processingItems, setProcessingItems] = useState(new Set());



// In UserDashboard.jsx - add this debug useEffect
useEffect(() => {
  if (toast) {
    console.log('🔔 TOAST SHOWN:', toast.message, 'at:', new Date().toISOString());
  }
}, [toast]);

const handleViewMyOrders = () => {
  setShowOrderSuccessModal(false);  // close success modal
  setOrderJustPlaced(false);        // clear "just placed" flag
  setActiveTab("bookings");         // go directly to bookings tab
  setShowCartModal(false);          // Close cart modal if it's open
};

// Improved syncCartItems function
const syncCartItems = async () => {
  try {
    const userData = localStorage.getItem('users');
    if (!userData) return;

    const user = JSON.parse(userData);
    const userId = user.id;
    if (!userId) return;

    const { data, error } = await supabase
      .from('cart_item')
      .select('product_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error syncing cart items:', error);
      return;
    }

    // Update clickedItems state based on cart items
    const cartProductIds = new Set(data?.map(item => String(item.product_id)) || []);
    setClickedItems(cartProductIds);
    
    // Also update cart count
    setCartItemsCount(cartProductIds.size);

  } catch (error) {
    console.error('Error in syncCartItems:', error);
  }
};

// Call this on component mount
useEffect(() => {
  syncCartItems();
}, []);


// In UserDashboard.jsx - Improved toast functions with better debouncing
const showSuccessToast = (message) => {
  const now = Date.now();
  if (now - lastToastTime < 500) {
    console.log('🚫 Blocking duplicate toast:', message);
    return;
  }
  
  setLastToastTime(now);
  setToast({
    message,
    type: "success",
    duration: 3000,
  });
};

const showErrorToast = (message) => {
  const now = Date.now();
  if (now - lastToastTime < 500) {
    console.log('🚫 Blocking duplicate error toast:', message);
    return;
  }
  
  setLastToastTime(now);
  setToast({
    message,
    type: "error",
    duration: 3000,
  });
};



// In UserDashboard.jsx - Add these functions and effects

// Load cart state from localStorage on component mount
useEffect(() => {
  const loadCartState = () => {
    try {
      const savedCartState = localStorage.getItem('cartState');
      if (savedCartState) {
        const { clickedItems, cartCount } = JSON.parse(savedCartState);
        setClickedItems(new Set(clickedItems));
        setCartItemsCount(cartCount || 0);
      }
    } catch (error) {
      console.error('Error loading cart state:', error);
    }
  };
  
  loadCartState();
}, []);

// Save cart state to localStorage whenever it changes
useEffect(() => {
  const saveCartState = () => {
    try {
      const cartState = {
        clickedItems: Array.from(clickedItems),
        cartCount: cartItemsCount
      };
      localStorage.setItem('cartState', JSON.stringify(cartState));
    } catch (error) {
      console.error('Error saving cart state:', error);
    }
  };
  
  saveCartState();
}, [clickedItems, cartItemsCount]);

// Improved handleAddToCartClick with toast
const handleAddToCartClick = useCallback(async (item, event) => {
  if (processingItems.has(item.id)) {
    console.log('🚫 BLOCKING - Item already processing:', item.id);
    return { success: false };
  }

  try {
    setProcessingItems(prev => {
      const newSet = new Set(prev);
      newSet.add(item.id);
      return newSet;
    });

    const userData = localStorage.getItem('users');
    if (!userData) {
      showErrorToast('Please login to add items to cart');
      return { success: false };
    }

    const user = JSON.parse(userData);
    const userId = user.id;

    // Check if product is already in cart
    const { data: existingCartItems, error } = await supabase
      .from('cart_item')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', item.id);

    if (error) {
      console.error('Error checking cart:', error);
      return { success: false };
    }

    if (existingCartItems && existingCartItems.length > 0) {
      showErrorToast(`${item.name || item.product_name} is already in your cart!`);
      return { success: false };
    }

    // Add to cart
    const { data, error: insertError } = await supabase
      .from('cart_item')
      .insert([{ 
        user_id: userId, 
        product_id: item.id, 
        category_name: item.category_name, 
        quantity: '1'
      }])
      .select();

    if (insertError) {
      console.error('Error adding to cart:', insertError);
      showErrorToast('Failed to add item to cart');
      return { success: false };
    }

    // Update visual state
    setClickedItems((prev) => new Set(prev).add(item.id));
    
    // Refresh cart count
    await updateCartCount();

    // Return success so CategoryProducts knows to show toast
    return { success: true, itemName: item.name || item.product_name };

  } catch (error) {
    console.error('❌ Error in handleAddToCartClick:', error);
    showErrorToast('Failed to add item to cart');
    return { success: false };
  } finally {
    setProcessingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(item.id);
      return newSet;
    });
  }
}, [processingItems]);

// Improved handleRemoveFromCart with toast and better state management
const handleRemoveFromCart = async (productId, productName = 'Item') => {
  try {
    const userData = localStorage.getItem('users');
    if (!userData) {
      showErrorToast('Please login to remove items from cart');
      return;
    }

    const user = JSON.parse(userData);
    const userId = user.id;

    // Get product name if not provided
    let itemName = productName;
    if (productName === 'Item') {
      const product = products.find(p => p.id === productId);
      itemName = product?.product_name || 'Item';
    }

    const { error } = await supabase
      .from('cart_item')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing from cart:', error);
      showErrorToast('Failed to remove item from cart');
      return;
    }

    // Update visual state immediately
    setClickedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });

    // Update cart count immediately
    await updateCartCount();

    // Show success toast with proper debouncing
    const now = Date.now();
    if (now - lastToastTime > 500) {
      showSuccessToast(`${itemName} removed from cart!`);
      setLastToastTime(now);
    }

  } catch (error) {
    console.error('Error in handleRemoveFromCart:', error);
    showErrorToast('Failed to remove item from cart');
  }
};

// Add this function to update cart count
const updateCartCount = async () => {
  await fetchCartItemsCount();
  await syncCartItems();
};

// In UserDashboard.jsx - ensure you have this useEffect
useEffect(() => {
  const mq = window.matchMedia("(min-width: 1024px)");
  const handleChange = () => {
    setSidebarOpen(mq.matches);
    setIsMobile(!mq.matches);
  };
  handleChange();
  mq.addEventListener("change", handleChange);
  return () => mq.removeEventListener("change", handleChange);
}, []);

const confirmOrder = async () => {
  try {
    const userData = localStorage.getItem('users');
    if (!userData) return;

    const user = JSON.parse(userData);
    const userId = user.id;

    // Fetch cart items with product details
    const { data: cartItems, error } = await supabase
      .from('cart_item')
      .select('*, products(*)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching cart items for order:', error);
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setToast({
        message: 'Your cart is empty!',
        type: "warning",
        duration: 3000,
      });
      return;
    }

    console.log("Confirming order, cart items:", cartItems);

    // Extract product IDs from cart items to update their status
    const productIds = cartItems.map(item => item.product_id).filter(id => id);

    // Update product status to "booked" for all products in the cart
    if (productIds.length > 0) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          status: 'booked',
          booking_date: new Date().toISOString().split('T')[0]
        })
        .in('id', productIds);

      if (updateError) {
        console.error('Error updating product status:', updateError);
      } else {
        console.log('Product status updated to booked for IDs:', productIds);
      }
    }

    // Prepare items data for orders table
    const itemsData = cartItems.map(item => ({
      id: item.id,
      product_id: item.product_id,
      product_name: item.products?.product_name || 'Unknown Product',
      category_name: item.category_name || item.products?.category_name,
      quantity: item.quantity,
      weight: item.products?.weight || '',
      price: item.products?.price || 0,
      product_image_url: item.products?.product_image_url || '',
      created_at: item.created_at
    }));

    // Calculate total items count and amount
    const totalItems = cartItems.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
    const totalAmount = cartItems.reduce((total, item) => {
      const price = parseFloat(item.products?.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + (price * quantity);
    }, 0);

    // Create order in orders table
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: userId,
        total_item: totalItems,
       
        items: itemsData,
        created_at: new Date().toISOString()
      }])
      .select();

    if (orderError) {
      console.error('Error creating order:', orderError);
      setToast({
        message: 'Failed to create order',
        type: "error",
        duration: 3000,
      });
      return;
    }

    console.log("Order created successfully:", orderData);

    // ✅ SEND SMS NOTIFICATION TO ADMIN
    const orderInfo = {
      orderId: orderData[0].id,
      customerName: user?.name || 'Guest Customer',
      totalItems: totalItems,
      totalAmount: totalAmount.toFixed(2),
      items: cartItems.map(item => item.products?.product_name).filter(Boolean)
    };

    // Send SMS notification (async - don't block order confirmation)
    sendOrderSMS(orderInfo).then(smsSuccess => {
      if (smsSuccess) {
        console.log('✅ SMS notification sent successfully to admin');
        // Optionally show a toast for SMS success
        setToast({
          message: 'Order confirmed & SMS sent to admin!',
          type: "success",
          duration: 3000,
        });
      } else {
        console.log('⚠️ Order placed but SMS failed');
        // Order still succeeds even if SMS fails
        setToast({
          message: 'Order confirmed! (SMS notification failed)',
          type: "warning", 
          duration: 3000,
        });
      }
    });

    // Store booking data for admin to see
    if (addBooking && cartItems) {
      cartItems.forEach((item) => {
        addBooking({
          userName: user?.name || "Guest User",
          category: item.category_name || item.products?.category_name,
          jewelleryName: item.products?.product_name || item.product_name,
          quantity: item.quantity,
          weight: item.products?.weight || item.weight || "",
          userId: user?.id || "guest",
          image: item.products?.product_image_url || item.product_image_url,
          images: item.products?.product_image_url ? [item.products.product_image_url] : [],
        });
      });
    }

    // Add to user's local orders state for immediate UI update
    const newBookings = await Promise.all(cartItems.map(async (item, index) => {
      let imageUrl = item.products?.product_image_url || item.product_image_url;
      if (imageUrl && !imageUrl.startsWith("data:image/")) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const reader = new FileReader();
          const dataUrl = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          imageUrl = dataUrl;
        } catch (error) {
          console.error("Error converting image:", error);
          imageUrl = "https://via.placeholder.com/64x64?text=No+Image";
        }
      }
      return {
        id: `${Date.now()}-${index}`,
        jewelleryName: item.products?.product_name || item.product_name,
        category: item.category_name || item.products?.category_name,
        quantity: item.quantity,
        weight: item.products?.weight || item.weight || "",
        bookingDate: new Date().toISOString(),
        status: "booked",
        image: imageUrl,
        order_id: orderData[0].id
      };
    }));

    console.log("New bookings:", newBookings);

    setMyOrders((prev) => {
      const updated = [...prev, ...newBookings];
      return updated;
    });

    // Clear cart in Supabase after order confirmation
    const { error: clearError } = await supabase
      .from('cart_item')
      .delete()
      .eq('user_id', userId);

    if (clearError) {
      console.error('Error clearing cart after order:', clearError);
    } else {
      await updateCartCount();
    }

    // Set order just placed flag for cart message
    setOrderJustPlaced(true);

    // Show success modal
    setShowOrderSuccessModal(true);

    // Initial success toast (might be overridden by SMS toast)
    setToast({
      message: 'Order placed successfully!',
      type: "success",
      duration: 3000,
    });

  } catch (error) {
    console.error('Error in confirmOrder:', error);
    setToast({
      message: 'Failed to place order',
      type: "error",
      duration: 3000,
    });
  }
};


  const handleCategoryChange = (category) => {
    const scrollPosition = window.pageYOffset;
    setSelectedCategory(category);
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 0);
  };

  const handleBackToCategories = () => {
    setSelectedCategory("All");
    setSearchTerm("");
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const asset = (name) => {
    if (!name) return name;
    const base = import.meta.env.BASE_URL || "/";
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const clean = name.startsWith("/") ? name.slice(1) : name;
    return `${cleanBase}/${clean}`;
  };

// CategoriesGallery Component (improved with better debugging)
// CategoriesGallery Component - Only shows categories with available products
const CategoriesGallery = () => {
  console.log("CategoriesGallery rendering, available categories:", categories);
  
  return (
    <div className="space-y-4">
      <h2 className="mt-4 text-2xl font-bold text-gray-900">Categories</h2>
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.isArray(categories) && categories.length > 0 ? (
          categories.map((category) => {
            const categoryName = category.category_name || category.name || category.title;
            const imageUrl = category.image_url || category.image || category.cover_image || asset("download.jpg");
            
            console.log(`Rendering available category: ${categoryName}`);
            
            return (
              <div
                key={category.id || categoryName}
                onClick={() => {
                  console.log(`Selected category: ${categoryName}`);
                  setSelectedCategory(categoryName);
                  setCurrentPage(1);
                }}
                className="overflow-hidden relative z-10 rounded-2xl border border-gray-200 shadow-md transition-all duration-300 group cursor-pointer hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={categoryName}
                    className="object-cover w-full h-56 transition-transform duration-500 sm:h-52 md:h-60 group-hover:scale-105"
                    onError={(e) => {
                      console.error(`Image failed to load for ${categoryName}:`, imageUrl);
                      e.target.src = 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=No+Image';
                    }}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  
                  <div className="absolute right-0 bottom-0 left-0 p-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {categoryName}
                        </h3>
                        <p className="text-xs text-white/80">
                          Tap to view products
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-8 text-center">
            <p className="text-gray-500">
              {loading ? "Loading categories..." : "No categories available at the moment"}
            </p>
            {!loading && (
              <p className="text-sm text-gray-400 mt-2">
                All items are currently sold out. Please check back later.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

  // TopBar Component (merged) - FIXED: using cartItemsCount instead of cart
  const TopBar = () => (
    <header className="fixed top-0 right-0 left-0 z-30 p-4 border-b border-gray-200 shadow-sm backdrop-blur bg-white/90 md:sticky md:top-0 lg:p-6">
      <div className="flex relative gap-2 justify-center items-center">
        <div className="absolute left-0">
          {activeTab === "catalog" && selectedCategory !== "All" && (
            <button
              onClick={handleBackToCategories}
              className="hidden items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50"
            >
              <ChevronLeft className="mr-1 w-4 h-4" />
              Back to Categories
            </button>
          )}
        </div>
        <div className="text-base font-semibold text-gray-800">
          At plus jewellers
        </div>
        <div className="absolute right-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCartModal(true)}
              className="flex relative justify-center items-center w-10 h-10 text-gray-600 rounded-lg transition-colors hover:bg-gray-100 hover:text-gray-900 ios-touch-target"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="flex absolute -top-1 -right-1 justify-center items-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  // OrderSuccessModal Component (merged)
const OrderSuccessModal = () => {
  if (!showOrderSuccessModal) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50 ios-modal">
      <div className="p-8 w-full max-w-md text-center bg-white rounded-2xl shadow-xl">
        <div className="mb-6">
          <div className="flex justify-center items-center mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-gray-900">Order Confirmed!</h3>
          <p className="text-gray-600">
            Your order has been successfully placed. You will receive a
            confirmation email shortly.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleViewMyOrders}
            className="px-6 py-3 w-full font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg transition-all hover:from-amber-600 hover:to-orange-600"
          >
            View My Orders
          </button>
          <button
            onClick={() => {
              setShowOrderSuccessModal(false);
              setActiveTab("catalog");
              setShowCartModal(false); // Also close cart modal
            }}
            className="px-6 py-3 w-full font-medium text-gray-700 bg-gray-100 rounded-xl transition-colors hover:bg-gray-200"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

  // ToastNotification Component (merged)
  const ToastNotification = () => {
    if (!toast) return null;

    return (
      <div className="fixed right-4 bottom-4 left-4 z-50 sm:bottom-6 sm:left-auto sm:right-6 animate-slide-up">
        <div
          className={`flex items-center p-3 sm:p-4 rounded-xl shadow-lg border transition-all duration-300 ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex flex-1 items-center space-x-3">
            {toast.type === "success" ? (
              <CheckCircle className="flex-shrink-0 w-4 h-4 text-green-600 sm:w-5 sm:h-5" />
            ) : (
              <X className="flex-shrink-0 w-4 h-4 text-red-600 sm:w-5 sm:h-5" />
            )}
            <p className="flex-1 text-xs font-medium  sm:text-base">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="flex-shrink-0 ml-2 text-gray-400 transition-colors sm:ml-4 hover:text-gray-600"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    );
  };

  // BackToTopButton Component (merged)
  const BackToTopButton = () => {
    if (!showBackToTop || sidebarOpen) return null;

    return (
      <button
        onClick={scrollToTop}
        className="fixed right-6 bottom-24 z-40 p-3 text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg transition-all duration-300 transform hover:shadow-xl hover:scale-110 active:scale-95 md:bottom-8 animate-fade-in-up"
        title="Back to Top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    );
  };

  return (
    <div className="flex overflow-y-auto overflow-x-hidden pb-28 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 scrollbar-hide">
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        handleLogout={handleLogout}
        setSelectedCategory={setSelectedCategory}
        setSearchTerm={setSearchTerm}
        setCurrentPage={setCurrentPage}
      />

      {/* Main Content */}
      <div
        className="flex flex-col flex-1 lg:ml-72 ios-footer-fix"
        style={{
          scrollBehavior: "auto",
          minHeight: "100dvh",
          paddingBottom: "5rem",
        }}
      >
        {/* Top Bar */}
        <TopBar />

        {/* Content Area */}
        <main
          className={`flex-1 ${
            selectedCategory !== "All" ? "pt-24" : "pt-16"
          } p-4 sm:p-6 scrollbar-hide ios-scroll-fix`}
        >
          {/* Jewellery Catalog */}
          {activeTab === "catalog" && (
            <div className="space-y-6">
              {/* Categories Gallery (when All is selected) */}
              {selectedCategory === "All" && !searchTerm && (
                <CategoriesGallery />
              )}

              {/* Category Products */}
              {selectedCategory !== "All" && (
               // In UserDashboard.jsx - ensure setToast is passed
<CategoryProducts
  selectedCategory={selectedCategory}
  setSelectedCategory={setSelectedCategory}
  products={products}
  productsLoading={productsLoading}
  showFilters={showFilters}
  setShowFilters={setShowFilters}
  minWeight={minWeight}
  setMinWeight={setMinWeight}
  maxWeight={maxWeight}
  setMaxWeight={setMaxWeight}
  sortBy={sortBy}
  setSortBy={setSortBy}
  clickedItems={clickedItems}
  handleAddToCartClick={handleAddToCartClick}
  handleRemoveFromCart={handleRemoveFromCart}
   setToast={setToast}
  updateCartCount={updateCartCount}
  cartItems={cartItems}
  fetchCartItems={fetchCartItems}
  
/>
              )}
            </div>
          )}

          {/* My Orders Tab */}
       
{activeTab === "bookings" && (
  <OrderHistory 
    myOrders={myOrders} 
    setActiveTab={setActiveTab}
    setSelectedCategory={setSelectedCategory}
    setCurrentPage={setCurrentPage}
  />
)}
        </main>
        <Footer />
      </div>

      {/* Cart Modal */}
     
{/* Cart Modal */}
<Cart
  showCartModal={showCartModal}
  setShowCartModal={setShowCartModal}
  setActiveTab={setActiveTab}
  onCartUpdate={fetchCartItemsCount}
  onConfirmOrder={confirmOrder}
    setToast={setToast}
   fetchCartItems={fetchCartItems}
/>

      {/* Order Success Modal */}
      <OrderSuccessModal />

      {/* Back to Top Button */}
      <BackToTopButton />

      {/* Toast Notification */}
      <ToastNotification />
    </div>
  );
};

export default UserDashboard;