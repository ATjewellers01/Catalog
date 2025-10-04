import { X } from "lucide-react";
import { useEffect, useState } from "react";
import supabase from "../../../SupabaseClient";

const AddCategoryModal = ({
  showAddCategoryModal,
  newCategory,
  setNewCategory,
  categoryImagePreview,
  handleAddCategory,
  handleCategoryFileUpload,
  resetCategoryForm,
}) => {
  const [categories, setCategories] = useState([]);

  // fetch distinct categories from users table
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("dropdown")
        .select("category_name")
        .not("category_name", "is", null);

      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }

      const uniqueCategories = [...new Set(data.map((row) => row.category_name))];
      setCategories(uniqueCategories);
    };

    fetchCategories();
  }, []);

  if (!showAddCategoryModal) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">Add New Category</h3>
          <button
            onClick={resetCategoryForm}
            className="p-1 md:p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 p-4 md:p-6 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
          <form id="addCategoryForm" onSubmit={handleAddCategory} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              
              {/* Category Name */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Category Name *
                </label>
                <input
                  list="categoryOptions"
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  placeholder="Select or type category"
                  className="px-3 md:px-4 py-2 md:py-3 w-full text-sm md:text-base rounded-lg md:rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
                <datalist id="categoryOptions">
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat} />
                  ))}
                </datalist>
              </div>

              {/* Description (commented out but kept for reference) */}
              {/* <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                  placeholder="Category description"
                  className="px-3 md:px-4 py-2 md:py-3 w-full text-sm md:text-base rounded-lg md:rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div> */}
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Upload Photo *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCategoryFileUpload}
                className="px-3 md:px-4 py-2 md:py-3 w-full text-sm md:text-base rounded-lg md:rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors file:mr-2 md:file:mr-4 file:py-1 md:file:py-2 file:px-2 md:file:px-4 file:rounded-md md:file:rounded-lg file:border-0 file:text-xs md:file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>

            {/* Image Preview */}
            {categoryImagePreview && (
              <div className="p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-300">
                <p className="mb-2 md:mb-3 text-sm font-medium text-gray-700">Image Preview:</p>
                <div className="overflow-auto max-h-48 md:max-h-64 rounded-lg md:rounded-xl border border-gray-200 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
                  <img
                    src={categoryImagePreview}
                    alt="Preview"
                    className="object-contain w-full min-h-24 md:min-h-32"
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 md:p-6 md:pt-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={resetCategoryForm}
              className="flex-1 px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium text-gray-700 bg-gray-100 rounded-lg md:rounded-xl transition-colors hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="addCategoryForm"
              className="flex-1 px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg md:rounded-xl shadow-lg transition-all hover:from-blue-600 hover:to-blue-700"
            >
              Save Category
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;