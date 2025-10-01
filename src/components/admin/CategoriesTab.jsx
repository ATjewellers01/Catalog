import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Subcategories from "./Subcategories";
import { Trash2, X } from "lucide-react";
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
}) => {
  const navigate = useNavigate();
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());

  // Reset image errors when categories data changes
  useEffect(() => {
    setImageLoadErrors(new Set());
  }, [categoriesData]);

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

  // Handle card click - only navigate if not in delete mode
  const handleCardClick = (category, e) => {
    if (deleteMode) {
      e.preventDefault();
      toggleCategorySelection(category.id, e);
    } else {
      navigate(`/category/${category.category_name}`);
    }
  };

  // Handle image error
  const handleImageError = (categoryId) => {
    setImageLoadErrors(prev => new Set(prev).add(categoryId));
  };

  // Get image source with fallback - FIXED to ensure images load
  const getImageSource = (category) => {
    if (imageLoadErrors.has(category.id)) {
      return asset("download.jpg");
    }
    const coverImage = getCategoryCover(category.category_name);
    // Ensure we return a valid image URL
    return coverImage || asset("download.jpg");
  };

  return (
    <div className="space-y-6">
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

      {loadingCategories ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-gray-600">Loading categories...</span>
        </div>
      ) : !selectedCategory || selectedCategory === "All" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 lg:px-0">
          {categoriesData.map((category) => (
            <div
              key={category.id}
              onClick={(e) => handleCardClick(category, e)}
              className={`overflow-hidden relative rounded-xl lg:rounded-2xl border border-gray-200 shadow-md transition-all duration-300 group hover:shadow-lg lg:hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                selectedCategories.has(category.id) 
                  ? 'ring-2 ring-red-500 border-red-300' 
                  : 'border-gray-200'
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
                  <div className="absolute top-2 right-2 lg:top-3 lg:right-3 z-20">
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Selected
                    </div>
                  </div>
                )}

                {/* Image container - FIXED: Ensure images always display */}
                <div className="w-full h-48 sm:h-52 md:h-56 lg:h-60 bg-gray-100 overflow-hidden relative">
                  <img
                    src={getImageSource(category)}
                    alt={category.category_name}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    onError={() => handleImageError(category.id)}
                    loading="eager"
                    onLoad={(e) => {
                      e.target.style.opacity = "1";
                    }}
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
                          : "Tap to view collection"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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