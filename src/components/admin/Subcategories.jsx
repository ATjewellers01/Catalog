import { useState } from "react";
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Image,
  FolderPlus,
  Edit3,
} from "lucide-react";

const Subcategories = ({
  selectedCategory,
  categoryImages,
  setCategoryImages,
  setSelectedCategory,
  showActions = true,
}) => {
  const [showAddSubcategoryModal, setShowAddSubcategoryModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [newSubcategoryImage, setNewSubcategoryImage] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newPhotoWeight, setNewPhotoWeight] = useState("");
  const subcategories = Object.keys(categoryImages[selectedCategory] || {});
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    subcategories[0] || null
  );
  const [sortBy, setSortBy] = useState("weight");
  const [minWeight, setMinWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const images = categoryImages[selectedCategory]?.[selectedSubcategory] || [];

  // Handle both old string format and new object format for images
  const getImageUrl = (img) => (typeof img === "string" ? img : img.url);

  const filteredImages = images.filter((img) => {
    const weightStr = typeof img === "string" ? "" : img.weight || "";
    const weightNum = parseFloat(weightStr.replace("g", "")) || 0;
    const min = minWeight ? parseFloat(minWeight) : 0;
    const max = maxWeight ? parseFloat(maxWeight) : Infinity;
    return weightNum >= min && weightNum <= max;
  });

  const sortedImages = [...filteredImages].sort((a, b) => {
    const aWeight = typeof a === "string" ? "" : a.weight || "";
    const bWeight = typeof b === "string" ? "" : b.weight || "";
    const aNum = parseFloat(aWeight.replace("g", "")) || 0;
    const bNum = parseFloat(bWeight.replace("g", "")) || 0;

    const aName =
      typeof a === "string" ? a : `${selectedCategory} ${selectedSubcategory}`;
    const bName =
      typeof b === "string" ? b : `${selectedCategory} ${selectedSubcategory}`;

    switch (sortBy) {
      case "weight-desc":
        return bNum - aNum;
      case "name":
        return aName.localeCompare(bName);
      case "name-desc":
        return bName.localeCompare(aName);
      case "weight":
      default:
        return aNum - bNum;
    }
  });

  const handleSubcategoryFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setNewSubcategoryImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubcategory = () => {
    if (newSubcategoryName.trim() && selectedCategory) {
      const subcategoryName = newSubcategoryName.trim();
      setCategoryImages({
        ...categoryImages,
        [selectedCategory]: {
          ...categoryImages[selectedCategory],
          [subcategoryName]: [],
        },
      });
      setSelectedSubcategory(subcategoryName);
      alert(`Subcategory "${subcategoryName}" added successfully!`);
      resetSubcategoryForm();

      // Demo mode: Add sample data if no images exist
      useEffect(() => {
        if (
          sortedImages.length === 0 &&
          selectedSubcategory &&
          selectedCategory
        ) {
          console.log(
            "Adding demo images for:",
            selectedCategory,
            selectedSubcategory
          );
          const demoImages = [
            {
              url: asset("/download.jpg"),
              description: `${selectedCategory} ${selectedSubcategory} Demo Photo 1`,
              weight: "18g",
            },
            {
              url: asset("/images.jpg"),
              description: `${selectedCategory} ${selectedSubcategory} Demo Photo 2`,
              weight: "22g",
            },
            {
              url: asset("/download (1).jpg"),
              description: `${selectedCategory} ${selectedSubcategory} Demo Photo 3`,
              weight: "25g",
            },
          ];

          setCategoryImages({
            ...categoryImages,
            [selectedCategory]: {
              ...categoryImages[selectedCategory],
              [selectedSubcategory]: demoImages,
            },
          });
        }
      }, [
        sortedImages.length,
        selectedCategory,
        selectedSubcategory,
        categoryImages,
        asset,
      ]);
    }
  };

  const handleAddPhoto = () => {
    if (newSubcategoryImage && selectedCategory && selectedSubcategory) {
      const photoData = {
        url: newSubcategoryImage,
        weight: newPhotoWeight.trim() || "",
        timestamp: new Date().toISOString(),
      };

      setCategoryImages({
        ...categoryImages,
        [selectedCategory]: {
          ...categoryImages[selectedCategory],
          [selectedSubcategory]: [
            ...(categoryImages[selectedCategory][selectedSubcategory] || []),
            photoData,
          ],
        },
      });
      alert("Photo added successfully!");
      resetPhotoForm();
    }
  };

  const resetSubcategoryForm = () => {
    setNewSubcategoryName("");
    setShowAddSubcategoryModal(false);
  };

  const resetPhotoForm = () => {
    setNewSubcategoryImage("");
    setNewPhotoWeight("");
    setShowAddPhotoModal(false);
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => (input.value = ""));
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => setIsLightboxOpen(false);
  const prevImage = () =>
    setLightboxIndex(
      (prev) => (prev - 1 + sortedImages.length) % sortedImages.length
    );
  const nextImage = () =>
    setLightboxIndex((prev) => (prev + 1) % sortedImages.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="px-3 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-8">
        {/* Header Section */}
        <div className="relative mb-6 sm:mb-12">
          <div className="absolute inset-0 bg-gradient-to-r rounded-2xl blur-xl from-blue-600/10 via-purple-600/10 to-pink-600/10 sm:rounded-3xl"></div>
          <div className="relative p-4 rounded-2xl border shadow-xl backdrop-blur-md bg-white/80 sm:rounded-3xl sm:p-8 border-white/20">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-2xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 sm:text-4xl lg:text-5xl">
                  {selectedCategory}
                </h1>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                {showActions && (
                  <>
                    <button
                      onClick={() => setShowAddSubcategoryModal(true)}
                      className="relative px-4 py-3 font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg transition-all duration-300 group sm:px-8 sm:py-4 sm:rounded-2xl hover:shadow-2xl hover:scale-105 active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl opacity-0 transition-opacity duration-300 sm:rounded-2xl group-hover:opacity-100"></div>
                      <div className="flex relative gap-2 justify-center items-center sm:gap-3">
                        <FolderPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">
                          Add Subcategory
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => setShowAddPhotoModal(true)}
                      disabled={!selectedSubcategory}
                      className="relative px-4 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg transition-all duration-300 group sm:px-8 sm:py-4 sm:rounded-2xl hover:shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 transition-opacity duration-300 sm:rounded-2xl group-hover:opacity-100"></div>
                      <div className="flex relative gap-2 justify-center items-center sm:gap-3">
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">Add Photo</span>
                      </div>
                    </button>
                  </>
                )}
              </div>

              {/* Filter & Sort Section */}
              <div className="mb-6 sm:mb-8">
                <div className="p-4 rounded-xl border shadow-lg backdrop-blur-md bg-white/70 sm:rounded-2xl sm:p-6 border-white/30">
                  <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-800 sm:text-xl">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    Filter & Sort Photos
                  </h3>

                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <div className="flex gap-2 items-center">
                      <label className="text-sm font-medium text-gray-700">
                        Sort by:
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="weight">Weight (Low to High)</option>
                        <option value="weight-desc">
                          Weight (High to Low)
                        </option>
                        <option value="name">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                      </select>
                    </div>
                    <div className="flex gap-2 items-center">
                      <label className="text-sm font-medium text-gray-700">
                        Min Weight (g):
                      </label>
                      <input
                        type="number"
                        value={minWeight}
                        onChange={(e) => setMinWeight(e.target.value)}
                        placeholder="0"
                        className="px-2 py-1 w-16 text-sm rounded border border-gray-300"
                        min="0"
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <label className="text-sm font-medium text-gray-700">
                        Max Weight (g):
                      </label>
                      <input
                        type="number"
                        value={maxWeight}
                        onChange={(e) => setMaxWeight(e.target.value)}
                        placeholder="100"
                        className="px-2 py-1 w-16 text-sm rounded border border-gray-300"
                        min="0"
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => {
                          setMinWeight("");
                          setMaxWeight("");
                          setSortBy("weight");
                        }}
                        className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                        title="Reset all filters"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subcategory Navigation */}
        {subcategories.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="p-4 rounded-xl border shadow-lg backdrop-blur-md bg-white/70 sm:rounded-2xl sm:p-6 border-white/30">
              <h3 className="flex gap-2 items-center mb-3 text-lg font-semibold text-gray-800 sm:text-xl sm:mb-4"></h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {subcategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 text-xs sm:text-base ${
                      selectedSubcategory === sub
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                        : "bg-gray-100 text-gray-700 hover:bg-green-500 hover:shadow-md"
                    }`}
                  >
                    <span className="block sm:inline">{sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Photo Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6 xl:gap-8">
          {sortedImages.map((img, idx) => (
            <div
              key={idx}
              className="group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => openLightbox(idx)}
            >
              <div className="overflow-hidden aspect-square">
                <img
                  src={getImageUrl(img)}
                  alt={`${selectedCategory} ${selectedSubcategory} ${idx + 1}`}
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Weight Badge */}
                {(() => {
                  const raw = typeof img === "object" ? img.weight : "";
                  const ws = String(raw || "18g").trim();
                  const weightNum = parseFloat(ws.replace("g", "")) || 0;
                  const text = `${weightNum.toFixed(2)}g`;
                  return (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1.5 text-sm font-bold text-white bg-black/80 rounded-full backdrop-blur-sm shadow-lg">
                      {text}
                    </div>
                  );
                })()}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <div className="absolute right-0 bottom-0 left-0 z-10 p-3 text-white transition-transform duration-300 transform translate-y-0 sm:p-4">
                <div className="flex justify-between items-end">
                  <div>{/* Subcategory name removed */}</div>
                  {addToCart && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const item = {
                          id: `${selectedCategory}-${selectedSubcategory}-${idx}`,
                          name: selectedSubcategory,
                          description: `${selectedCategory} - ${selectedSubcategory} Photo ${
                            idx + 1
                          }`,
                          image: getImageUrl(img),
                          category: selectedCategory,
                          price: 10000, // Default price for gallery items
                          quantity: 1,
                          weight: img.weight || "",
                        };
                        addToCart(item, 1);
                      }}
                      className={`relative z-10 p-2 rounded-full border shadow-lg opacity-100 transition-all duration-300 transform sm:p-3 hover:scale-110 active:scale-95 hover:shadow-xl border-white/20 focus:outline-none focus:ring-2 focus:ring-white/70 ${
                        clickedItems?.has(
                          `${selectedCategory}-${selectedSubcategory}-${idx}`
                        )
                          ? "bg-gradient-to-r from-green-500 to-green-600"
                          : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State - No Photos */}
        {images.length === 0 && selectedSubcategory && (
          <div className="py-12 text-center sm:py-20">
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 blur-xl animate-pulse"></div>
              <div className="flex relative justify-center items-center mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full sm:w-24 sm:h-24 sm:mb-6">
                <Image className="w-8 h-8 text-white sm:w-12 sm:h-12" />
              </div>
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-800 sm:text-2xl sm:mb-4">
              No Photos Yet
            </h3>
            <p className="px-4 mx-auto mb-6 max-w-md text-sm text-gray-600 sm:text-base sm:mb-8">
              This collection is waiting for its first masterpiece. Start
              building your gallery today!
            </p>
            {showActions && (
              <button
                onClick={() => setShowAddPhotoModal(true)}
                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg transition-all duration-300 transform sm:px-8 sm:py-4 sm:rounded-2xl hover:shadow-xl hover:scale-105 sm:text-base"
              >
                Add First Photo
              </button>
            )}
          </div>
        )}

        {/* Empty State - No Subcategories */}
        {subcategories.length === 0 && (
          <div className="py-12 text-center sm:py-20">
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-20 blur-xl animate-pulse"></div>
              <div className="flex relative justify-center items-center mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full sm:w-24 sm:h-24 sm:mb-6">
                <FolderPlus className="w-8 h-8 text-white sm:w-12 sm:h-12" />
              </div>
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-800 sm:text-2xl sm:mb-4">
              No Subcategories Yet
            </h3>
            <p className="px-4 mx-auto mb-6 max-w-md text-sm text-gray-600 sm:text-base sm:mb-8">
              Create your first subcategory to organize your{" "}
              {selectedCategory.toLowerCase()} photos.
            </p>
            {showActions && (
              <button
                onClick={() => setShowAddSubcategoryModal(true)}
                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg transition-all duration-300 transform sm:px-8 sm:py-4 sm:rounded-2xl hover:shadow-xl hover:scale-105 sm:text-base"
              >
                Create Subcategory
              </button>
            )}
          </div>
        )}

        {/* Lightbox Modal */}
        {isLightboxOpen && (
          <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/95">
            {/* Header */}
            <div className="absolute top-0 right-0 left-0 z-10 bg-gradient-to-b to-transparent from-black/80">
              <div className="flex justify-between items-center p-3 sm:p-6">
                <div className="text-white">
                  <h3 className="text-base font-semibold sm:text-lg">
                    {selectedCategory} • {selectedSubcategory}
                  </h3>
                  {/* Description removed from lightbox */}
                </div>
                <button
                  onClick={closeLightbox}
                  className="flex justify-center items-center w-10 h-10 text-white rounded-lg transition-colors sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 sm:rounded-xl"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Main Image */}
            <div className="flex justify-center items-center px-2 py-16 h-full sm:px-4 sm:py-20">
              <button
                onClick={prevImage}
                className="flex absolute left-2 z-10 justify-center items-center w-10 h-10 text-white rounded-full transition-all sm:left-6 sm:w-14 sm:h-14 bg-white/10 hover:bg-white/20"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>

              <img
                src={getImageUrl(sortedImages[lightboxIndex])}
                alt={`${selectedCategory} ${selectedSubcategory} ${
                  lightboxIndex + 1
                }`}
                className="object-contain max-w-full max-h-full rounded-lg shadow-2xl"
              />

              <button
                onClick={nextImage}
                className="flex absolute right-2 z-10 justify-center items-center w-10 h-10 text-white rounded-full transition-all sm:right-6 sm:w-14 sm:h-14 bg-white/10 hover:bg-white/20"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="absolute right-0 bottom-0 left-0 p-3 bg-gradient-to-t to-transparent from-black/80 sm:p-6">
              <div className="flex overflow-x-auto gap-2 justify-center pb-2 sm:gap-3">
                {sortedImages.map((thumb, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className={`flex-shrink-0 w-12 h-12 sm:w-20 sm:h-20 rounded-lg overflow-hidden transition-all ${
                      i === lightboxIndex
                        ? "ring-2 ring-white scale-110 shadow-xl"
                        : "opacity-60 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    <img
                      src={getImageUrl(thumb)}
                      alt={`Thumbnail ${i + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Subcategory Modal */}
        {showActions && showAddSubcategoryModal && (
          <div className="flex fixed inset-0 z-50 justify-center items-center p-3 backdrop-blur-sm sm:p-4 bg-black/50">
            <div className="overflow-hidden w-full max-w-md bg-white rounded-2xl shadow-2xl sm:rounded-3xl">
              <div className="p-4 text-white bg-gradient-to-r from-green-500 to-emerald-500 sm:p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold sm:text-2xl">
                    Add Subcategory
                  </h3>
                  <button
                    onClick={resetSubcategoryForm}
                    className="flex justify-center items-center w-8 h-8 rounded-full transition-colors sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <p className="mt-2 text-sm opacity-90 sm:text-base">
                  Create a new collection in {selectedCategory}
                </p>
              </div>

              <div className="p-4 space-y-4 sm:p-6 sm:space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700 sm:mb-3">
                    Subcategory Name
                  </label>
                  <input
                    type="text"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    placeholder="Enter subcategory name..."
                    className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 transition-all sm:px-4 sm:py-3 sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent sm:text-base"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-2 sm:gap-4 sm:pt-4">
                  <button
                    onClick={resetSubcategoryForm}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg transition-colors sm:px-6 sm:py-3 hover:bg-gray-200 sm:rounded-xl sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSubcategory}
                    disabled={!newSubcategoryName.trim()}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg transition-all sm:px-6 sm:py-3 hover:from-green-600 hover:to-emerald-600 sm:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl sm:text-base"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Photo Modal */}
        {showActions && showAddPhotoModal && (
          <div className="flex fixed inset-0 z-50 justify-center items-center p-3 backdrop-blur-sm sm:p-4 bg-black/50">
            <div className="overflow-hidden w-full max-w-md bg-white rounded-2xl shadow-2xl sm:rounded-3xl max-h-[70vh] overflow-y-auto">
              <div className="p-4 text-white bg-gradient-to-r from-blue-500 to-purple-500 sm:p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold sm:text-2xl">Add Photo</h3>
                  <button
                    onClick={resetPhotoForm}
                    className="flex justify-center items-center w-8 h-8 rounded-full transition-colors sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <p className="mt-2 text-sm opacity-90 sm:text-base">
                  Upload to {selectedCategory} • {selectedSubcategory}
                </p>
              </div>

              <div className="p-4 space-y-4 sm:p-6 sm:space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700 sm:mb-3">
                    Choose Photo
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSubcategoryFileUpload}
                      className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <div className="p-4 text-center rounded-xl border-2 border-gray-300 border-dashed transition-colors sm:rounded-2xl sm:p-8 hover:border-blue-500 hover:bg-blue-50/50">
                      <Camera className="mx-auto mb-2 w-8 h-8 text-gray-400 sm:w-12 sm:h-12 sm:mb-4" />
                      <p className="text-sm font-medium text-gray-600 sm:text-base">
                        Click to upload photo
                      </p>
                      <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                        PNG, JPG, JPEG up to 10MB
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700 sm:mb-3">
                    Weight
                  </label>
                  <input
                    type="text"
                    value={newPhotoWeight}
                    onChange={(e) => setNewPhotoWeight(e.target.value)}
                    placeholder="Enter weight (e.g., 10g, 5oz)"
                    className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 transition-all sm:px-4 sm:py-3 sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base"
                  />
                </div>

                {newSubcategoryImage && (
                  <div className="space-y-2 sm:space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Preview
                    </label>
                    <div className="overflow-hidden rounded-xl border-2 border-gray-200 sm:rounded-2xl">
                      <img
                        src={newSubcategoryImage}
                        alt="Preview"
                        className="object-cover w-full h-32 sm:h-48"
                        onError={() => setNewSubcategoryImage("")}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2 sm:gap-4 sm:pt-4">
                  <button
                    onClick={resetPhotoForm}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg transition-colors sm:px-6 sm:py-3 hover:bg-gray-200 sm:rounded-xl sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPhoto}
                    disabled={!newSubcategoryImage}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg transition-all sm:px-6 sm:py-3 hover:from-blue-600 hover:to-purple-600 sm:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl sm:text-base"
                  >
                    Add Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subcategories;
