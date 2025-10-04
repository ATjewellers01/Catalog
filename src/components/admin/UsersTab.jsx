import { Plus, Edit, Trash2, Save, X, CheckSquare, Square } from "lucide-react";
import { useState } from "react";
import supabase from "../../SupabaseClient";

const UsersTab = ({
  users,
  updatingUserId,
  handleToggleStatus,
  setShowAddUserModal,
  fetchUsers
}) => {
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setEditedUser({
      user_name: user.user_name,
      role: user.role,
      phone_number: user.phone_number
    });
  };

 const handleSave = async (userId) => {
  try {
    if (!editedUser.user_name?.trim()) {
      alert("User name is required");
      return;
    }

    if (!editedUser.role?.trim()) {
      alert("Role is required");
      return;
    }

    console.log('Updating user:', userId, editedUser);

    const { data, error } = await supabase
      .from('users')
      .update({
        user_name: editedUser.user_name.trim(),
        role: editedUser.role,
        phone_number: editedUser.phone_number?.trim() || null,
      })
      .eq('id', userId)
      .select(); // Add .select() to see what's returned

    console.log('Update response:', { data, error });

    if (error) {
      console.error('Supabase update error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    alert('User updated successfully!');
    setEditingUserId(null);
    setEditedUser({});
    fetchUsers();
  } catch (error) {
    console.error('Error updating user:', error);
    
    // More specific error messages
    if (error.code === '23505') {
      alert('Error: A user with this name already exists.');
    } else if (error.code === '42501') {
      alert('Error: You do not have permission to update users.');
    } else if (error.message.includes('JWT')) {
      alert('Error: Authentication failed. Please log in again.');
    } else {
      alert(`Error updating user: ${error.message}`);
    }
  }
};

  const handleCancel = () => {
    setEditingUserId(null);
    setEditedUser({});
  };

  const toggleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAllUsers = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      const allUserIds = users.map(user => user.id);
      setSelectedUsers(new Set(allUserIds));
    }
  };

  const handleDeleteUsers = async () => {
    if (selectedUsers.size === 0) return;

    const userNames = Array.from(selectedUsers)
      .map(id => {
        const user = users.find(u => u.id === id);
        return user ? user.user_name : "Unknown User";
      })
      .join(", ");

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the following ${selectedUsers.size} user(s)?\n\n${userNames}\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const userIdsToDelete = Array.from(selectedUsers);
      
      const { error } = await supabase
        .from('users')
        .delete()
        .in('id', userIdsToDelete);

      if (error) throw error;

      await fetchUsers();
      setDeleteMode(false);
      setSelectedUsers(new Set());
      alert(`Successfully deleted ${selectedUsers.size} user(s)!`);
    } catch (error) {
      console.error('Error deleting users:', error);
      alert('Error deleting users. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteMode = () => {
    setDeleteMode(false);
    setSelectedUsers(new Set());
  };

  const handleIndividualDelete = async (user) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete user "${user.user_name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      alert(`User "${user.user_name}" deleted successfully!`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col p-6 space-y-4 border-b border-gray-200 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">
            User Management
          </h2>
          
          <div className="flex items-center space-x-3">
            {deleteMode ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={selectAllUsers}
                  className="flex items-center px-4 py-3 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-base"
                >
                  {selectedUsers.size === users.length ? (
                    <CheckSquare className="w-5 h-5 mr-2" />
                  ) : (
                    <Square className="w-5 h-5 mr-2" />
                  )}
                  {selectedUsers.size === users.length ? "Deselect All" : "Select All"}
                </button>
                
                <button
                  onClick={handleDeleteUsers}
                  disabled={selectedUsers.size === 0 || deleting}
                  className="flex items-center px-4 py-3 text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  {deleting ? "Deleting..." : `Delete (${selectedUsers.size})`}
                </button>
                
                <button
                  onClick={cancelDeleteMode}
                  className="flex items-center px-4 py-3 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-base"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setDeleteMode(true)}
                  className="flex items-center px-4 py-3 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors text-base"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete Users
                </button>
                
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="flex items-center px-6 py-3 space-x-2 text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md transition-all hover:from-green-600 hover:to-emerald-600 text-base"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add User</span>
                </button>
              </>
            )}
          </div>
        </div>

        {deleteMode && (
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Delete Mode:</strong> Select users to delete by clicking on the checkboxes. 
              Click "Select All" to select all users, then click "Delete" to remove them.
            </p>
          </div>
        )}

        <div className="p-6">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {deleteMode && (
                      <th className="px-4 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase w-16 sticky left-0 bg-gray-50 z-10">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedUsers.size === users.length && users.length > 0}
                            onChange={selectAllUsers}
                            className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      </th>
                    )}
                    {[
                      "Name",
                      "Role",
                      "Phone",
                      "Password",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className={`hover:bg-gray-50 ${selectedUsers.has(u.id) ? 'bg-red-50' : ''} ${editingUserId === u.id ? 'bg-blue-50' : ''}`}>
                      {deleteMode && (
                        <td className="px-4 py-4 w-16 sticky left-0 bg-inherit z-10">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(u.id)}
                            onChange={() => toggleUserSelection(u.id)}
                            className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                      )}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingUserId === u.id ? (
                          <input
                            type="text"
                            value={editedUser.user_name || ""}
                            onChange={(e) => setEditedUser({...editedUser, user_name: e.target.value})}
                            className="w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter user name"
                            required
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{u.user_name}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingUserId === u.id ? (
                          <select
                            value={editedUser.role || ""}
                            onChange={(e) => setEditedUser({...editedUser, role: e.target.value})}
                            className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Role</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <div className="text-sm text-gray-900">{u.role}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingUserId === u.id ? (
                          <input
                            type="tel"
                            value={editedUser.phone_number || ""}
                            onChange={(e) => setEditedUser({...editedUser, phone_number: e.target.value})}
                            className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter phone number"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{u.phone_number || "N/A"}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{"•".repeat(u.password.length)}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
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
                      <td className="px-4 py-4 whitespace-nowrap">
                        {!deleteMode && (
                          editingUserId === u.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSave(u.id)}
                                className="flex items-center px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                              >
                                <Save className="w-4 h-4 mr-1" />
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(u)}
                                className="flex items-center px-3 py-2 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleToggleStatus(u.id, u.status === "active" ? "inactive" : "active")}
                                disabled={updatingUserId === u.id}
                                className={`px-3 py-2 rounded-lg text-xs font-medium ${
                                  u.status === "active"
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "bg-green-500 text-white hover:bg-green-600"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {updatingUserId === u.id ? "Updating..." : u.status === "active" ? "Deactivate" : "Activate"}
                              </button>
                              {/* <button
                                onClick={() => handleIndividualDelete(u)}
                                className="flex items-center px-3 py-2 text-xs text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </button> */}
                            </div>
                          )
                        )}
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
                className={`p-6 bg-white rounded-xl border shadow-sm transition-shadow hover:shadow-md ${
                  selectedUsers.has(u.id) ? 'border-red-300 bg-red-50' : 'border-gray-200'
                } ${editingUserId === u.id ? 'border-blue-300 bg-blue-50' : ''}`}
              >
                {deleteMode && (
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(u.id)}
                      onChange={() => toggleUserSelection(u.id)}
                      className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Select for deletion</span>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-4">
                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        {editingUserId === u.id ? (
                          <input
                            type="text"
                            value={editedUser.user_name || ""}
                            onChange={(e) => setEditedUser({...editedUser, user_name: e.target.value})}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter user name"
                            required
                          />
                        ) : (
                          <div className="text-base font-semibold text-gray-900">{u.user_name}</div>
                        )}
                      </div>

                      {/* Role Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        {editingUserId === u.id ? (
                          <select
                            value={editedUser.role || ""}
                            onChange={(e) => setEditedUser({...editedUser, role: e.target.value})}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Role</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <div className="text-sm text-gray-900">{u.role}</div>
                        )}
                      </div>

                      {/* Phone Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        {editingUserId === u.id ? (
                          <input
                            type="tel"
                            value={editedUser.phone_number || ""}
                            onChange={(e) => setEditedUser({...editedUser, phone_number: e.target.value})}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter phone number"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{u.phone_number || "N/A"}</div>
                        )}
                      </div>
                    </div>
                    
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        u.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {u.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Password: {"•".repeat(u.password.length)}
                    </div>
                  </div>
                </div>

                {/* Mobile Actions */}
                {!deleteMode && (
                  <div className="flex flex-col space-y-3 mt-6 pt-4 border-t border-gray-200">
                    {editingUserId === u.id ? (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleSave(u.id)}
                          className="flex-1 flex items-center justify-center px-4 py-3 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex-1 flex items-center justify-center px-4 py-3 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleEdit(u)}
                            className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </button>
                          {/* <button
                            onClick={() => handleIndividualDelete(u)}
                            className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </button> */}
                        </div>
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status === "active" ? "inactive" : "active")}
                          disabled={updatingUserId === u.id}
                          className={`w-full px-4 py-3 rounded-lg text-sm font-medium ${
                            u.status === "active"
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-green-500 text-white hover:bg-green-600"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updatingUserId === u.id ? "Updating..." : u.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTab;