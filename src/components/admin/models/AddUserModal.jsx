import { X } from "lucide-react";

const AddUserModal = ({
  showAddUserModal,
  newUser,
  setNewUser,
  handleAddUser,
  resetUserForm,
}) => {
  if (!showAddUserModal) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Add New User
          </h3>
          <button
            onClick={resetUserForm}
            className="p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <form id="addUserForm" onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Username *
              </label>
              <input
                type="text"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="Enter username"
                className="px-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Enter password"
                className="px-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                value={newUser.phoneNumber}
                onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                placeholder="Enter phone number"
                className="px-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Role Dropdown Field */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Role *
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="px-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={newUser.status}
                onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                className="px-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </form>
        </div>

        <div className="flex-shrink-0 p-6 pt-4 bg-gray-50 border-t border-gray-200">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={resetUserForm}
              className="flex-1 px-6 py-3 font-medium text-gray-700 bg-gray-100 rounded-xl transition-colors hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="addUserForm"
              className="flex-1 px-6 py-3 font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg transition-all hover:from-green-600 hover:to-emerald-600"
            >
              Add User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;