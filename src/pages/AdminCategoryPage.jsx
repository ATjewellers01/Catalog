import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useJewellery } from "../context/JewelleryContext";
import {
  Plus,
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronDown,
  Trash2,
} from "lucide-react";
import Footer from "../components/Footer";
import supabase from "../SupabaseClient";

const AdminCategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { jewellery } = useJewellery();

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("weight");
  const [minWeight, setMinWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [newPhoto, setNewPhoto] = useState({
    subcategory: "",
    description: "",
    weight: "",
    image: "",
  });
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Delete mode states
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .is("status",null)
        .order('created_at', { ascending: false });

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

  // Fetch products from Supabase
  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete mode functions
  const toggleProductSelection = (productId, e) => {
    if (e) e.stopPropagation();
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const selectAllProducts = () => {
    const allProductIds = galleryItems.map((item) => item.id);
    if (selectedProducts.size === allProductIds.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(allProductIds));
    }
  };

  const handleDeleteProducts = async () => {
    if (selectedProducts.size === 0) return;

    const productNames = Array.from(selectedProducts)
      .map((id) => {
        const product = galleryItems.find((item) => item.id === id);
        return product ? product.name : "Unknown Product";
      })
      .join(", ");

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the following ${selectedProducts.size} product(s)?\n\n${productNames}\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const productIdsToDelete = Array.from(selectedProducts);
      
      // Delete from Supabase products table
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', productIdsToDelete);

      if (error) {
        throw error;
      }

      // Refresh products
      await fetchProducts();
      
      // Reset states
      setDeleteMode(false);
      setSelectedProducts(new Set());
      
      alert(`Successfully deleted ${selectedProducts.size} product(s)!`);
    } catch (error) {
      console.error('Error deleting products:', error);
      alert('Error deleting products. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteMode = () => {
    setDeleteMode(false);
    setSelectedProducts(new Set());
  };

  // Handle card click - only show details if not in delete mode
  const handleCardClick = (productId, e) => {
    if (deleteMode) {
      e.preventDefault();
      toggleProductSelection(productId, e);
    }
  };

  const asset = (name) => {
    if (!name) return 'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=No+Image';
    if (typeof name !== "string") return 'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=Invalid+URL';
    if (name.startsWith("data:")) return name;
    if (name.startsWith("http://") || name.startsWith("https://")) return name;
    const base = import.meta.env.BASE_URL || "/";
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const clean = name.startsWith("/") ? name.slice(1) : name;
    return `${cleanBase}/${clean}`;
  };

  const [categoryImages, setCategoryImages] = useState({});
  const [photoPreview, setPhotoPreview] = useState("");

  const normalizeCategoryName = (name) => {
    if (!name) return "All";
    const map = {
      earring: "Earrings",
      earrings: "Earrings",
      bracelet: "Bracelets",
      bracelets: "Bracelets",
      ring: "Rings",
      set: "SET",
      men: "Man Collection",
      "man collection": "Man Collection",
    };
    const key = decodeURIComponent(name).replace(/-/g, " ").toLowerCase();
    return map[key] || decodeURIComponent(name);
  };
  
  const [selectedCategory, setSelectedCategory] = useState(
    normalizeCategoryName(categoryName)
  );

  // Flattened and filtered items for the gallery (by weight, search, and sort)
  const galleryItems = useMemo(() => {
    if (!products.length) return [];

    // Filter by selected category
    const categoryProducts = products.filter(product => 
      product.category_name === selectedCategory
    );

    const items = categoryProducts.map((product, index) => {
      const weightNum = parseFloat(String(product.weight).replace("g", "")) || 0;

      // Weight filter
      const min = minWeight ? parseFloat(minWeight) : 0;
      const max = maxWeight ? parseFloat(maxWeight) : Infinity;
      if (weightNum < min || weightNum > max) return null;

      // Search filter (by description, product name, or category)
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const searchableText = [
          product.description,
          product.product_name,
          product.category_name
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(q)) return null;
      }

      return {
        id: product.id || `product-${index}`,
        subcategory: product.product_name || "Uncategorized",
        url: product.product_image_url,
        desc: product.description || product.product_name || `${selectedCategory} item`,
        weight: product.weight || "",
        weightNum,
        name: product.product_name || `${selectedCategory} item`,
        category: product.category_name,
      };
    }).filter(Boolean);

    // Sort items
    items.sort((a, b) => {
      switch (sortBy) {
        case "weight-desc":
          return b.weightNum - a.weightNum;
        case "name":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "weight":
        default:
          return a.weightNum - b.weightNum;
      }
    });

    return items;
  }, [products, selectedCategory, minWeight, maxWeight, searchTerm, sortBy]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhoto((prev) => ({ ...prev, image: file }));
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const resetPhotoForm = () => {
    setNewPhoto({ subcategory: "", description: "", weight: "", image: "" });
    setPhotoPreview("");
    setShowAddPhotoModal(false);
  };

  const handleAddPhotoSubmit = async (e) => {
    e.preventDefault();

    if (!newPhoto.image) {
      alert("Please choose an image.");
      return;
    }

    try {
      const file = newPhoto.image;
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${selectedCategory}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product_image")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        alert("Failed to upload image.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("product_image")
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      const { error } = await supabase.from("products").insert([
        {
          category_name: selectedCategory,
          product_name: "Default",
          product_image_url: imageUrl,
          weight: newPhoto.weight || "",
        },
      ]);

      if (error) {
        console.error("Insert error:", error.message);
        alert("Failed to save product.");
        return;
      }

      alert("Photo added successfully!");
      await fetchProducts();
      resetPhotoForm();
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong while adding the photo.");
    }
  };

  // Set selected category based on URL parameter
  useEffect(() => {
    setSelectedCategory(normalizeCategoryName(categoryName));
  }, [categoryName]);

  const handleBack = () => {
    navigate("/", { state: { showCategories: true } });
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  if (loadingProducts) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
        <span className="ml-4 text-gray-600">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="sticky top-0 z-40 border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/80">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBack}
                className="flex items-center space-x-1 text-gray-600 transition-colors hover:text-gray-900 p-2"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Back</span>
              </button>
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center">
              {selectedCategory} Collection
            </h1>
            <div className="text-xs sm:text-sm text-gray-500 min-w-12 text-right">
              {galleryItems.length} items
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-4 mx-auto max-w-7xl sm:px-4 sm:py-6 lg:px-8">
        {/* Category Content */}
        <div className="space-y-4 sm:space-y-6">
          {selectedCategory && selectedCategory !== "All" ? (
            <div className="overflow-visible bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 sm:p-6">
                {/* Header with Actions */}
                <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:justify-between sm:items-center">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                      {selectedCategory} Gallery
                    </h2>
                    <p className="text-xs text-gray-600 sm:text-sm">
                      Explore our {selectedCategory.toLowerCase()} collection
                    </p>
                  </div>
                  
                  {/* Delete Mode Controls */}
                  {deleteMode ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <button
                        onClick={selectAllProducts}
                        className="px-3 py-2 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors sm:px-4 sm:text-sm"
                      >
                        {selectedProducts.size === galleryItems.length 
                          ? "Deselect All" 
                          : "Select All"}
                      </button>
                      
                      <button
                        onClick={handleDeleteProducts}
                        disabled={selectedProducts.size === 0 || deleting}
                        className="flex items-center justify-center px-3 py-2 text-xs text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:px-4 sm:text-sm"
                      >
                        <Trash2 className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />
                        {deleting ? "Deleting..." : `Delete (${selectedProducts.size})`}
                      </button>
                      
                      <button
                        onClick={cancelDeleteMode}
                        className="flex items-center justify-center px-3 py-2 text-xs text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors sm:px-4 sm:text-sm"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 sm:gap-3 justify-around ">
                      <button
                        onClick={() => setDeleteMode(true)}
                        className="flex items-center justify-center px-3 py-2 text-xs text-white bg-red-500 rounded hover:bg-red-600 transition-colors sm:px-4 sm:py-2 sm:text-sm"
                      >
                        <Trash2 className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />
                        Delete Products
                      </button>
                      
                      <button
                        onClick={() => setShowAddPhotoModal(true)}
                        className="px-4 py-2 text-md text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md transition-all hover:from-green-600 hover:to-emerald-600 sm:px-4 sm:py-2 sm:text-sm"
                      >
                        Add Photo
                      </button>
                    </div>
                  )}
                </div>

                {deleteMode && (
                  <div className="p-3 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 sm:text-sm">
                      <strong>Delete Mode:</strong> Select products to delete by clicking on the cards. 
                      {window.innerWidth >= 640 ? " Click \"Select All\" to select all products, then click \"Delete\" to remove them." : " Use buttons above to manage selection."}
                    </p>
                  </div>
                )}

                {/* Sticky Filter/Sort Controls */}
                <div className="overflow-y-auto sticky top-16 z-50 p-3 bg-white rounded-md border border-gray-200 shadow-sm scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-200">
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center justify-center px-3 py-2 space-x-2 text-xs font-medium text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 sm:text-sm"
                      >
                        <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Filters</span>
                      </button>

                      {/* Sort Dropdown */}
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="block px-3 py-2 pr-8 w-full text-xs text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        >
                          <option value="weight">Weight: Low to High</option>
                          <option value="weight-desc">
                            Weight: High to Low
                          </option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 w-3 h-3 text-gray-400 transform -translate-y-1/2 pointer-events-none sm:w-4 sm:h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Filters */}
                  {showFilters && (
                    <div className="sticky top-48 z-40 p-3 mt-3 bg-gray-50 rounded-xl border border-gray-200">
                      <h3 className="mb-2 text-xs font-semibold text-gray-700 sm:text-sm">
                        Filter by Weight (grams)
                      </h3>
                      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:items-center">
                        <div className="flex-1">
                          <label className="block mb-1 text-xs text-gray-600">
                            Min Weight
                          </label>
                          <input
                            type="number"
                            value={minWeight}
                            onChange={(e) => setMinWeight(e.target.value)}
                            placeholder="Min"
                            className="block px-3 py-2 w-full text-xs text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block mb-1 text-xs text-gray-600">
                            Max Weight
                          </label>
                          <input
                            type="number"
                            value={maxWeight}
                            onChange={(e) => setMaxWeight(e.target.value)}
                            placeholder="Max"
                            className="block px-3 py-2 w-full text-xs text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Items Grid */}
              <div className="grid grid-cols-1 gap-3 mt-4 sm:gap-4 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
  {galleryItems.map((gi) => (
    <div
      key={gi.id}
      onClick={(e) => handleCardClick(gi.id, e)}
      className={`relative rounded-lg border shadow-md transition-all duration-300 group hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
        selectedProducts.has(gi.id) 
          ? 'ring-2 ring-red-500 border-red-300' 
          : 'border-gray-200'
      }`}
    >
      {/* 👇 Changed here */}
      <div className="relative h-48 overflow-hidden rounded-lg bg-gray-100"> 
        {/* Image - Base Layer */}
        <img
          src={gi.url || 'https://via.placeholder.com/400x250/f3f4f6/9ca3af?text=No+Image'}
          alt={gi.desc || 'Product image'}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          style={{ zIndex: 1 }}
          onError={(e) => {
            console.error('❌ Image failed to load:', gi.url);
            e.target.src = 'https://via.placeholder.com/400x250/f3f4f6/9ca3af?text=Image+Not+Found';
            e.target.alt = 'Image not available';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" style={{ zIndex: 2 }}></div>

        {/* Checkbox for delete mode */}
        {deleteMode && (
          <div 
            className="absolute top-2 left-2 z-30"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={selectedProducts.has(gi.id)}
              onChange={(e) => toggleProductSelection(gi.id, e)}
              className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500 cursor-pointer shadow-lg sm:w-5 sm:h-5"
            />
          </div>
        )}

        {/* Selection badge */}
        {deleteMode && selectedProducts.has(gi.id) && (
          <div className="absolute top-2 right-2 z-30">
            <div className="bg-red-500 text-white text-xs px-1 py-0.5 rounded-full font-medium shadow-lg sm:px-2 sm:py-1">
              Selected
            </div>
          </div>
        )}

        {/* Weight badge */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-20 sm:bottom-2">
          <div className="px-2 py-0.5 rounded-full backdrop-blur-sm bg-black/60 sm:px-3 sm:py-1">
            <span className="text-xs font-semibold text-white">
              {gi.weight ? `${gi.weight}g` : 'No weight'}
            </span>
          </div>
        </div>

        {/* Delete mode selection overlay */}
        {deleteMode && (
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none ${
              selectedProducts.has(gi.id) 
                ? 'bg-red-500/30' 
                : 'bg-black/0 group-hover:bg-black/20'
            }`}
            style={{ zIndex: 3 }}
          >
            <div className={`text-center p-1 rounded transition-opacity duration-300 ${
              selectedProducts.has(gi.id) 
                ? 'bg-red-600 text-white opacity-100' 
                : 'bg-black/70 text-white opacity-0 group-hover:opacity-100'
            }`}>
              <p className="text-xs font-medium">
                {selectedProducts.has(gi.id) 
                  ? "✓ Selected" 
                  : "Tap to select"
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  ))}
</div>

              </div>
            </div>
          ) : (
            <div className="py-12 text-center bg-white rounded-lg border border-gray-200 sm:py-16">
              <h3 className="mb-2 text-base font-medium text-gray-900 sm:text-lg">
                Category not found
              </h3>
              <p className="text-sm text-gray-500 sm:text-base">
                The category "{categoryName}" does not exist in our collection.
              </p>
              <button
                onClick={handleBack}
                className="px-4 py-2 mt-4 text-sm text-white bg-blue-500 rounded-lg transition-colors hover:bg-blue-600 sm:px-6 sm:text-base"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Photo Modal - Mobile Responsive */}
      {showAddPhotoModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center p-3 bg-black/50 sm:p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-hidden flex flex-col mx-auto sm:rounded-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
                Add Photo to {selectedCategory}
              </h3>
              <button
                onClick={resetPhotoForm}
                className="p-1 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100 sm:p-2"
                aria-label="Close"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <form id="addPhotoForm" onSubmit={handleAddPhotoSubmit} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    value={selectedCategory}
                    readOnly
                    disabled
                    className="px-3 py-2 w-full text-sm text-gray-600 bg-gray-100 rounded-lg border border-gray-300 sm:px-4 sm:py-3 sm:text-base sm:rounded-xl"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Weight (g, optional)
                  </label>
                  <input
                    type="number"
                    value={newPhoto.weight}
                    onChange={(e) =>
                      setNewPhoto((p) => ({ ...p, weight: e.target.value }))
                    }
                    placeholder="e.g. 12"
                    className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:px-4 sm:py-3 sm:text-base sm:rounded-xl"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Upload Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 sm:px-4 sm:py-3 sm:text-base sm:rounded-xl sm:file:mr-4 sm:file:py-2 sm:file:px-4 sm:file:rounded-lg sm:file:text-sm"
                    required
                  />
                </div>

                {photoPreview && (
                  <div className="p-3 rounded-lg border border-gray-300 sm:p-4 sm:rounded-xl">
                    <p className="mb-2 text-sm font-medium text-gray-700 sm:mb-3">
                      Image Preview:
                    </p>
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="object-cover w-full h-40 rounded-lg sm:h-48 sm:rounded-xl"
                      onError={(e) => {
                        console.error("Image preview failed to load:", photoPreview);
                        setPhotoPreview("");
                      }}
                    />
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer - Fixed at bottom */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50 shadow-inner sm:p-6 sm:pt-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <button
                  type="button"
                  onClick={resetPhotoForm}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 sm:px-6 sm:py-3 sm:text-base sm:rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="addPhotoForm"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-lg transition-all hover:from-amber-600 hover:to-orange-600 sm:px-6 sm:py-3 sm:text-base sm:rounded-xl"
                >
                  Save Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminCategoryPage;