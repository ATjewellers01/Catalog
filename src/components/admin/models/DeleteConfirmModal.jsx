import { X } from "lucide-react";

const DeleteConfirmModal = ({
  deleteConfirm,
  setDeleteConfirm,
  handleDeleteConfirm,
}) => {
  if (!deleteConfirm) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
      <div className="p-6 w-full max-w-md bg-white rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm Deletion
          </h3>
          <button
            onClick={() => setDeleteConfirm(null)}
            className="p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center p-4 space-x-4 bg-red-50 rounded-xl border border-red-200">
            <div className="overflow-auto relative max-h-32 rounded-lg border border-red-200 max-w-32 scrollbar-thin scrollbar-thumb-red-500 scrollbar-track-gray-200">
              <img
                src={deleteConfirm.image}
                alt={deleteConfirm.name}
                className="object-contain w-full h-full"
              />

              {/* Weight Badge Overlay */}
              {deleteConfirm.grams && (
                <div className="absolute bottom-2 left-1/2 z-20 transform -translate-x-1/2">
                  <div className="px-3 py-1 rounded-full backdrop-blur-sm bg-black/60">
                    <span className="text-xs font-semibold text-white">
                      {(() => {
                        const weightStr = String(deleteConfirm.grams);
                        const cleanWeight = weightStr
                          .replace(/g+/g, "")
                          .replace(/\s+/g, "")
                          .trim();
                        const numWeight = parseFloat(cleanWeight);

                        if (!isNaN(numWeight) && numWeight > 0) {
                          return `${numWeight.toFixed(2)}g`;
                        }

                        return weightStr.includes("g")
                          ? weightStr
                          : `${weightStr}g`;
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {deleteConfirm.name}
              </h4>
              <p className="text-sm text-gray-600">
                {deleteConfirm.category}
              </p>
              <p className="text-sm font-medium text-amber-600">
                ₹{deleteConfirm.price.toLocaleString()}
              </p>
              {/* Show weight in text format as well */}
              {deleteConfirm.grams && (
                <p className="text-sm font-medium text-blue-600">
                  Weight:{" "}
                  {(() => {
                    const weightStr = String(deleteConfirm.grams);
                    const cleanWeight = weightStr
                      .replace(/g+/g, "")
                      .replace(/\s+/g, "")
                      .trim();
                    const numWeight = parseFloat(cleanWeight);

                    if (!isNaN(numWeight) && numWeight > 0) {
                      return `${numWeight.toFixed(2)}g`;
                    }

                    return weightStr.includes("g")
                      ? weightStr
                      : `${weightStr}g`;
                  })()}
                </p>
              )}
            </div>
          </div>
          <p className="mt-4 text-gray-700">
            Are you sure you want to delete this item? This action cannot be
            undone.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="flex-1 px-4 py-3 font-medium text-gray-700 bg-gray-100 rounded-xl transition-colors hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            className="flex-1 px-4 py-3 font-medium text-white bg-red-500 rounded-xl transition-colors hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;