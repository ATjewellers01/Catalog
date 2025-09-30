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

    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
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

  // LocalStorage key for category gallery images
  //const CATEGORY_IMAGES_KEY = "admin.categoryImages";

  // Resolve public assets with Vite base (safe join) and keep http/data URLs intact
  const asset = (name) => {
    if (!name) return name;
    if (typeof name !== "string") return name;
    if (name.startsWith("data:")) return name;
    if (name.startsWith("http://") || name.startsWith("https://")) return name;
    const base = import.meta.env.BASE_URL || "/";
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const clean = name.startsWith("/") ? name.slice(1) : name;
    return `${cleanBase}/${clean}`;
  };

  // // Declare categoryImages BEFORE effects that use it
   const [categoryImages, setCategoryImages] =useState({})
  

  // Persist gallery images whenever they change
  // useEffect(() => {
  //   try {
  //     localStorage.setItem(CATEGORY_IMAGES_KEY, JSON.stringify(categoryImages));
  //   } catch (err) {
  //     console.error("Failed to persist category images", err);
  //   }
  // }, [categoryImages]);
  const [photoPreview, setPhotoPreview] = useState("");
  // Normalize category names from URL to match our keys (e.g., 'Earring' -> 'Earrings')
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
    }).filter(Boolean); // Remove null items

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

  // // Add Photo handlers
  // const existingSubcategories = useMemo(
  //   () => Object.keys(categoryImages[selectedCategory] || {}),
  //   [categoryImages, selectedCategory]
  // );

  const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setNewPhoto((prev) => ({ ...prev, image: file }));
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
    const file = newPhoto.image; // MUST be File object, not base64
    const fileName = `${Date.now()}-${file.name}`;

    // --------- 1. Upload into category folder ---------
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

    // --------- 2. Get public URL ---------
    const { data: publicUrlData } = supabase.storage
      .from("product_image")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;
    console.log("✅ Public URL:", imageUrl);

    // --------- 3. Save to DB ---------
    const { error } = await supabase.from("products").insert([
      {
        category_name: selectedCategory,
        product_name: "Default",
        product_image_url: imageUrl,
      //  description: newPhoto.description || "",
        weight: newPhoto.weight || "",
      },
    ]);

    if (error) {
      console.error("Insert error:", error.message);
      alert("Failed to save product.");
      return;
    }

    // --------- 4. Update state ---------
    setCategoryImages((prev) => {
      const group = prev[selectedCategory] || {};
      const sub = "Default";
      const updatedSub = [
        ...(group[sub] || []),
        {
          url: imageUrl,
          description: newPhoto.description || "",
          weight: newPhoto.weight || "",
        },
      ];
      return {
        ...prev,
        [selectedCategory]: {
          ...group,
          [sub]: updatedSub,
        },
      };
    });

    alert("Photo added successfully!");
fetchProducts()
    setTimeout(() => {
      resetPhotoForm();
    }, 500);
  } catch (err) {
    console.error("Unexpected error:", err);
    alert("Something went wrong while adding the photo.");
  }
};


  // Set selected category based on URL parameter - runs on mount and when categoryName changes
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
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 transition-colors hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedCategory} Collection
            </h1>
            <div className="text-sm text-gray-500">
              {galleryItems.length} items
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Sticky Search Bar */}
        <div className="sticky top-16 z-30 p-4 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search within this collection..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2 pr-4 pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Category Content */}
        <div className="space-y-6">
          {selectedCategory && selectedCategory !== "All" ? (
            <div className="overflow-visible bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedCategory} Gallery
                    </h2>
                    <p className="text-gray-600">
                      Explore our {selectedCategory.toLowerCase()} collection
                    </p>
                  </div>
                </div>

                {/* Sticky Filter/Sort Controls */}
                <div className="overflow-y-auto sticky top-32 z-50 p-3 bg-white rounded-md border border-gray-200 shadow-sm scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-200">
                  <div className="flex flex-wrap gap-2 justify-between items-center md:gap-4">
                    <div className="flex flex-wrap gap-2 items-center md:gap-3">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-3 py-2 space-x-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50"
                      >
                        <Filter className="w-4 h-4" />
                        <span>Filters</span>
                      </button>

                      {/* Sort Dropdown */}
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="block px-3 py-2 pr-8 w-full text-sm text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        >
                          <option value="weight">Weight: Low to High</option>
                          <option value="weight-desc">
                            Weight: High to Low
                          </option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => setShowAddPhotoModal(true)}
                        className="px-4 py-2 text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md transition-all hover:from-green-600 hover:to-emerald-600"
                      >
                        Add Photo
                      </button>
                    </div>
                  </div>

                  {/* Expanded Filters */}
                  {showFilters && (
                    <div className="sticky top-48 z-40 p-3 mt-3 bg-gray-50 rounded-xl border border-gray-200">
                      <h3 className="mb-2 text-sm font-semibold text-gray-700">
                        Filter by Weight (grams)
                      </h3>
                      <div className="flex gap-4 items-center">
                        <div className="flex-1">
                          <label className="block mb-1 text-xs text-gray-600">
                            Min Weight
                          </label>
                          <input
                            type="number"
                            value={minWeight}
                            onChange={(e) => setMinWeight(e.target.value)}
                            placeholder="Min"
                            className="block px-3 py-2 w-full text-sm text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
                            className="block px-3 py-2 w-full text-sm text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Items Grid */}
             <div className="grid grid-cols-1 gap-4 mt-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {galleryItems.map((gi) => (
          <div
            key={gi.id}
            className="overflow-hidden relative rounded-xl border border-gray-200 shadow-md transition-all duration-300 group hover:shadow-xl hover:-translate-y-1"
          >
            <div className="overflow-hidden relative aspect-square">
              <img
                src={gi.url}
                alt={gi.desc}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.target.src = '/fallback-image.jpg';
                }}
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t to-transparent from-black/60 via-black/10">
              <div className="absolute bottom-2 left-1/2 z-20 transform -translate-x-1/2 sm:bottom-4">
                <div className="px-3 py-1 rounded-full backdrop-blur-sm bg-black/60 sm:bg-black/50">
                  <span className="text-xs font-semibold text-white sm:text-sm">
                    {gi.weight ? `${gi.weight}g` : 'Weight not specified'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-lg border border-gray-200">
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Category not found
              </h3>
              <p className="text-gray-500">
                The category "{categoryName}" does not exist in our collection.
              </p>
              <button
                onClick={handleBack}
                className="px-6 py-2 mt-4 text-white bg-blue-500 rounded-lg transition-colors hover:bg-blue-600"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Photo Modal */}
      {showAddPhotoModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[85vh] overflow-hidden flex flex-col transform -translate-y-8">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Add Photo to {selectedCategory}
              </h3>
              <button
                onClick={resetPhotoForm}
                className="p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <form id="addPhotoForm" onSubmit={handleAddPhotoSubmit} className="space-y-5">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    value={selectedCategory}
                    readOnly
                    disabled
                    className="px-4 py-3 w-full text-gray-600 bg-gray-100 rounded-xl border border-gray-300"
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
                    className="px-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Upload Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      console.log("File input changed, files:", e.target.files);
                      handleFileChange(e);
                    }}
                    className="px-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    required
                  />
                </div>

                {photoPreview && (
                  <div className="p-4 rounded-xl border border-gray-300">
                    <p className="mb-3 text-sm font-medium text-gray-700">
                      Image Preview:
                    </p>
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="object-cover w-full h-48 rounded-xl"
                      onError={(e) => {
                        console.error("Image failed to load:", photoPreview);
                        console.error("Image element error:", e);
                        setPhotoPreview("");
                      }}
                      onLoad={() => {
                        console.log("Image loaded successfully:", photoPreview);
                      }}
                    />
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer - Fixed at bottom */}
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200 bg-gray-50 shadow-inner">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetPhotoForm}
                  className="flex-1 px-6 py-3 font-medium text-gray-700 bg-gray-100 rounded-xl transition-colors hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="addPhotoForm"
                  className="flex-1 px-6 py-3 font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg transition-all hover:from-amber-600 hover:to-orange-600"
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
