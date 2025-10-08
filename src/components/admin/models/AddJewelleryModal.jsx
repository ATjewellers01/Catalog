import { X } from "lucide-react";

const AddJewelleryModal = ({
  showAddModal,
  editingItem,
  newJewellery,
  setNewJewellery,
  imagePreview,
  uniqueCategories,
  handleAddJewellery,
  handleFileUpload,
  resetForm,
}) => {
  if (!showAddModal) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {editingItem ? "Edit Jewellery" : "Add New Jewellery"}
          </h3>
          <button
            onClick={resetForm}
            className="p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-amber-500 scrollbar-track-gray-200">
          <form onSubmit={handleAddJewellery} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Category */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  value={newJewellery.category}
                  onChange={(e) =>
                    setNewJewellery({
                      ...newJewellery,
                      category: e.target.value,
                    })
                  }
                  className="px-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                >
                  <option value="">Select Category</option>
                  {uniqueCategories.slice(1).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  value={newJewellery.name}
                  onChange={(e) =>
                    setNewJewellery({
                      ...newJewellery,
                      name: e.target.value,
                    })
                  }
                  placeholder="Jewellery name"
                  className="px-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={newJewellery.description}
                onChange={(e) =>
                  setNewJewellery({
                    ...newJewellery,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="px-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Describe the jewellery..."
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Upload Photo *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="px-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                required
              />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="p-4 rounded-xl border border-gray-300">
                <p className="mb-3 text-sm font-medium text-gray-700">
                  Image Preview:
                </p>
                <div className="overflow-auto max-h-96 rounded-xl border border-gray-200 scrollbar-thin scrollbar-thumb-amber-500 scrollbar-track-gray-200">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="object-cover w-full min-h-48"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex pt-6 space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-6 py-3 font-medium text-gray-700 bg-gray-100 rounded-xl transition-colors hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg transition-all hover:from-amber-600 hover:to-orange-600"
              >
                {editingItem ? "Update" : "Save"} Jewellery
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddJewelleryModal;