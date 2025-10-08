import { Trash2, X, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../SupabaseClient";

const CategoriesTab = ({
  loadingCategories,
  categoriesData,
  selectedCategory,
  setSelectedCategory,
  getCategoryCover,
  asset,
  showAddCategoryModal,
  setShowAddCategoryModal,
  categoryImages,
  setCategoryImages,
  fetchCategoriesFromSupabase,
  jewellery = []
}) => {
  const navigate = useNavigate();
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Share modal states
  const [showShareModal, setShowShareModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [sharing, setSharing] = useState(false);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const { data, error } = await supabase
          .from('products')
          .select('*');

        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        setProducts(data || []);
      } catch (err) {
        console.error('Unexpected error fetching products:', err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch users from Supabase when share modal opens
  useEffect(() => {
    const fetchUsers = async () => {
      if (!showShareModal) return;
      
      try {
        setLoadingUsers(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq("role","user")
          .order('user_name', { ascending: true });

        if (error) {
          console.error('Error fetching users:', error);
          return;
        }

        setUsers(data || []);
      } catch (err) {
        console.error('Unexpected error fetching users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [showShareModal]);

  // Reset image errors when categories data changes
  useEffect(() => {
    setImageLoadErrors(new Set());
  }, [categoriesData]);

  // Calculate product counts by status for each category - UPDATED
  const getCategoryProductCounts = (categoryName) => {
    const productsToCheck = products.length > 0 ? products : jewellery;
    
    const categoryProducts = productsToCheck.filter(item => {
      const itemCategory = item.category_name || item.category;
      return itemCategory === categoryName;
    });

    const pendingCount = categoryProducts.filter(item => 
      item.status === null || item.status === 'pending'
    ).length;

    const bookedCount = categoryProducts.filter(item => 
      item.status === 'booked'
    ).length;

    const availableCount = categoryProducts.filter(item => 
      item.status === null || item.status === 'pending' || item.status === 'available'
    ).length;

    return { pendingCount, bookedCount, availableCount };
  };

  // Check if category is sold out (no available products)
  const isCategorySoldOut = (category) => {
    const { availableCount } = getCategoryProductCounts(category.category_name);
    return availableCount === 0;
  };

  // Toggle category selection by ID
  const toggleCategorySelection = (categoryId, e) => {
    if (e) e.stopPropagation();
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  // Toggle user selection
  const toggleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  // Select all users
  const selectAllUsers = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      const allUserIds = users.map(user => user.id);
      setSelectedUsers(new Set(allUserIds));
    }
  };

  // Handle share confirmation - UPDATED TO CLEAR AND INSERT DATA
  const handleShareConfirm = async () => {
    const selectedUserData = users.filter(user => selectedUsers.has(user.id));
    console.log("Selected users:", selectedUserData);
    
    if (selectedUserData.length === 0) return;

    setSharing(true);
    try {
     
      // Step 2: Prepare data for insertion
      const shareData = selectedUserData.map(user => ({
    
        name: user.user_name || 'Unnamed User',
        phone_number: user.phone_number || null,
        // Add any other fields you want to store
      }));

      // Step 3: Insert new selected users
      const { data: insertData, error: insertError } = await supabase
        .from('share_users_list')
        .insert(shareData)
        .select();

      if (insertError) {
        throw new Error(`Failed to insert new data: ${insertError.message}`);
      }

      console.log("Successfully inserted new data:", insertData);
      
      alert(`Categories shared with ${selectedUserData.length} user(s)! Data updated in share_user_list table.`);
      setShowShareModal(false);
      setSelectedUsers(new Set());
      
    } catch (error) {
      console.error('Error sharing categories:', error);
      alert(`Error sharing categories: ${error.message}`);
    } finally {
      setSharing(false);
    }
  };

  // Select all categories by their IDs
  const selectAllCategories = () => {
    const allCategoryIds = categoriesData.map(cat => cat.id);
    if (selectedCategories.size === allCategoryIds.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(allCategoryIds));
    }
  };

  // Delete selected categories by ID
  const handleDeleteCategories = async () => {
    if (selectedCategories.size === 0) return;

    const categoryNames = Array.from(selectedCategories).map(id => {
      const category = categoriesData.find(cat => cat.id === id);
      return category ? category.category_name : 'Unknown Category';
    }).join(', ');

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the following ${selectedCategories.size} category(ies)?\n\n${categoryNames}\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const categoryIdsToDelete = Array.from(selectedCategories);
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .in('id', categoryIdsToDelete);

      if (error) {
        throw error;
      }

      await fetchCategoriesFromSupabase();
      setDeleteMode(false);
      setSelectedCategories(new Set());
      
      alert(`Successfully deleted ${selectedCategories.size} category(ies)!`);
    } catch (error) {
      console.error('Error deleting categories:', error);
      alert('Error deleting categories. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete mode
  const cancelDeleteMode = () => {
    setDeleteMode(false);
    setSelectedCategories(new Set());
  };

  // Handle card click - ADMIN CAN CLICK ALL CATEGORIES
  const handleCardClick = (category, e) => {
    if (deleteMode) {
      e.preventDefault();
      toggleCategorySelection(category.id, e);
    } else {
      // Admin can navigate to any category
      navigate(`/category/${category.category_name}`);
    }
  };

  // Handle image error
  const handleImageError = (categoryId) => {
    setImageLoadErrors(prev => new Set(prev).add(categoryId));
  };

  // Get image source with fallback
  const getImageSource = (category) => {
    if (imageLoadErrors.has(category.id)) {
      return asset("download.jpg");
    }
    const coverImage = getCategoryCover(category.category_name);
    return coverImage || asset("download.jpg");
  };

  // Show loading if both categories and products are loading
  if (loadingCategories || loadingProducts) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-600">Loading categories...</span>
      </div>
    );
  }

  // Category card component
  const CategoryCard = ({ category }) => {
    const { pendingCount, bookedCount, availableCount } = getCategoryProductCounts(category.category_name);
    const isSoldOut = availableCount === 0;
    
    return (
      <div
        onClick={(e) => handleCardClick(category, e)}
        className={`overflow-hidden relative rounded-xl lg:rounded-2xl border shadow-md transition-all duration-300 group hover:shadow-lg lg:hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
          selectedCategories.has(category.id) 
            ? 'ring-2 ring-red-500 border-red-300' 
            : isSoldOut ? 'border-gray-300 bg-gray-100' : 'border-gray-200'
        }`}
      >
        <div className="relative">
          {/* Checkbox for delete mode */}
          {deleteMode && (
            <div 
              className="absolute top-2 left-2 lg:top-3 lg:left-3 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={selectedCategories.has(category.id)}
                onChange={(e) => toggleCategorySelection(category.id, e)}
                className="w-4 h-4 lg:w-5 lg:h-5 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500 cursor-pointer"
              />
            </div>
          )}

          {/* Selection badge */}
          {deleteMode && selectedCategories.has(category.id) && (
            <div className="absolute top-2 left-2 lg:top-3 lg:left-3 z-20">
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Selected
              </div>
            </div>
          )}

          {/* Booked Count - Top Right */}
          {bookedCount > 0 && (
            <div className="absolute top-2 right-2 lg:top-3 lg:right-3 z-20">
              <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                {bookedCount} Booked
              </div>
            </div>
          )}

          {/* Available Count - Bottom Right */}
          <div className="absolute bottom-2 right-2 lg:bottom-3 lg:right-3 z-20">
            <div className={`text-white text-xs px-2 py-1 rounded-full font-medium ${
              availableCount > 0 ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {availableCount} Available
            </div>
          </div>

          {/* Sold Out Overlay - Visual only */}
          {isSoldOut && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="bg-red-600 text-white px-4 py-2 rounded-lg transform -rotate-12">
                <span className="text-lg font-bold">EMPTY</span>
              </div>
            </div>
          )}

          {/* Image container */}
          <div className="w-full h-48 sm:h-52 md:h-56 lg:h-60 bg-gray-100 overflow-hidden relative">
            <img
              src={getImageSource(category)}
              alt={category.category_name}
              className={`object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                isSoldOut ? 'filter grayscale opacity-80' : ''
              }`}
              onError={() => handleImageError(category.id)}
              loading="eager"
              style={{ opacity: 1 }}
            />
            
            {/* Fallback background if image fails to load */}
            {imageLoadErrors.has(category.id) && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <span className="text-gray-500 text-sm font-medium">
                  {category.category_name}
                </span>
              </div>
            )}
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Content */}
          <div className="absolute right-0 bottom-0 left-0 p-3 lg:p-4 z-10">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-base lg:text-lg font-bold text-white mb-1">
                  {category.category_name}
                </h3>
                <p className="text-xs text-white/80">
                  {deleteMode ? 
                    (selectedCategories.has(category.id) 
                      ? "✓ Selected for deletion" 
                      : "Tap to select for deletion"
                    ) 
                    : isSoldOut ? 
                      "All items booked" 
                      : `${availableCount} available, ${bookedCount} booked`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Share Users Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Share Categories with Users</h3>
              <p className="text-sm text-gray-600 mt-1">Select users to share categories with</p>
            </div>
            
            <div className="p-4 border-b">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">
                  {selectedUsers.size} user(s) selected
                </span>
                <button
                  onClick={selectAllUsers}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedUsers.size === users.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {loadingUsers ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedUsers.has(user.id) 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {user.user_name || 'Unnamed User'}
                          </div>
                          {user.phone_number && (
                            <div className="text-sm text-gray-600">
                              {user.phone_number}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setSelectedUsers(new Set());
                }}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={sharing}
              >
                Cancel
              </button>
              <button
                onClick={handleShareConfirm}
                disabled={selectedUsers.size === 0 || sharing}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {sharing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Sharing...
                  </>
                ) : (
                  `Share with ${selectedUsers.size} User(s)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <div className="hidden lg:flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Categories
        </h2>
        <div className="flex items-center space-x-3">
          {deleteMode ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={selectAllCategories}
                className="px-4 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {selectedCategories.size === categoriesData.length 
                  ? "Deselect All" 
                  : "Select All"}
              </button>
              
              <button
                onClick={handleDeleteCategories}
                disabled={selectedCategories.size === 0 || deleting}
                className="flex items-center px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleting ? "Deleting..." : `Delete (${selectedCategories.size})`}
              </button>
              
              <button
                onClick={cancelDeleteMode}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 transition-colors"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Categories
              </button>
              
              <button
                onClick={() => setDeleteMode(true)}
                className="flex items-center px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Categories
              </button>
              
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
              >
                Add Category
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Header with Buttons */}
      <div className="lg:hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Categories
          </h2>
        </div>
        
        {/* Mobile Action Buttons - Top Position with exact sizes */}
        <div className="mb-4">
          <div className="flex justify-between items-center space-x-2">
            {deleteMode ? (
              <>
                <button
                  onClick={selectAllCategories}
                  className="flex-1 px-3 py-2 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  {selectedCategories.size === categoriesData.length 
                    ? "Deselect All" 
                    : "Select All"}
                </button>
                
                <button
                  onClick={handleDeleteCategories}
                  disabled={selectedCategories.size === 0 || deleting}
                  className="flex items-center flex-1 px-3 py-2 text-xs text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors justify-center"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  {deleting ? "Deleting..." : `Delete (${selectedCategories.size})`}
                </button>
                
                <button
                  onClick={cancelDeleteMode}
                  className="flex-1 px-3 py-2 text-xs text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center flex-1 px-3 py-2 text-xs text-white bg-green-500 rounded hover:bg-green-600 transition-colors justify-center"
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </button>
                
                <button
                  onClick={() => setDeleteMode(true)}
                  className="flex items-center flex-1 px-3 py-2 text-xs text-white bg-red-500 rounded hover:bg-red-600 transition-colors justify-center"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </button>
                
                <button
                  onClick={() => setShowAddCategoryModal(true)}
                  className="flex-1 px-3 py-2 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                >
                  Add Category
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {deleteMode && (
        <div className="p-3 lg:p-4 bg-yellow-50 border border-yellow-200 rounded-lg mx-4 lg:mx-0">
          <p className="text-xs lg:text-sm text-yellow-800">
            <strong>Delete Mode:</strong> Select categories to delete by clicking on the cards. 
            {window.innerWidth >= 1024 && " Click \"Select All\" to select all categories, then click \"Delete\" to remove them."}
            {window.innerWidth < 1024 && " Select categories below to delete them."}
          </p>
        </div>
      )}

      {!selectedCategory || selectedCategory === "All" ? (
        <div className="px-4 lg:px-0">
          {/* All Categories in Single Grid - Mixed Available and Sold Out */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoriesData.map((category) => (
              <CategoryCard 
                key={category.id} 
                category={category}
              />
            ))}
          </div>
        </div>
      ) : (
        <Subcategories
          selectedCategory={selectedCategory}
          categoryImages={categoryImages}
          setCategoryImages={setCategoryImages}
          setSelectedCategory={setSelectedCategory}
          addToCart={() => {}}
        />
      )}
    </div>
  );
};

export default CategoriesTab;