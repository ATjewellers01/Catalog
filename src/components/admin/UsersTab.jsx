import { Plus } from "lucide-react";

const UsersTab = ({
  users,
  updatingUserId,
  handleToggleStatus,
  setShowAddUserModal,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col p-6 space-y-4 border-b border-gray-200 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">
            User Management
          </h2>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center px-4 py-2 space-x-2 text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md transition-all hover:from-green-600 hover:to-emerald-600"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
        <div className="p-6">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Name",
                      "Role",
                      "Password",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {u.user_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {u.role}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {"•".repeat(u.password.length)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                            u.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm  text-gray-900">
                        <button
                          onClick={() => handleToggleStatus(u.id, "active")}
                          disabled={updatingUserId === u.id}
                          className={`px-3 py-2 rounded-lg text-xs font-medium mr-3 ${
                            u.status === "active"
                              ? "text-white bg-green-600 font-semibold cursor-not-allowed"
                              : "text-white bg-green-500 font-semibold hover:bg-green-200"
                          }`}
                        >
                          {updatingUserId === u.id && "Updating..."}
                          {updatingUserId !== u.id && "Activate"}
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id, "inactive")}
                          disabled={updatingUserId === u.id}
                          className={`px-3 py-2 rounded-lg text-xs font-medium  ${
                            u.status === "inactive"
                              ? "text-white bg-red-700 font-semibold cursor-not-allowed"
                              : "text-white  bg-red-500 font-semibold hover:bg-red-200"
                          }`}
                        >
                          {updatingUserId === u.id && "Updating..."}
                          {updatingUserId !== u.id && "Deactivate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="space-y-4 md:hidden">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="mb-1 text-lg font-semibold text-gray-900">
                      {u.user_name}
                    </h3>
                    <p className="text-md text-gray-900">{u.role}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                      u.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {u.status}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-600">
                    Password: {"•".repeat(u.password.length)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(u.id, "active")}
                      disabled={updatingUserId === u.id}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        u.status === "active"
                          ? "bg-green-200 text-green-900 cursor-not-allowed"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                    >
                      {updatingUserId === u.id ? "Updating..." : "Activate"}
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u.id, "inactive")}
                      disabled={updatingUserId === u.id}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        u.status === "inactive"
                          ? "bg-red-200 text-red-900 cursor-not-allowed"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {updatingUserId === u.id ? "Updating..." : "Deactivate"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTab;