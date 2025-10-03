import {
  Package,
  BookOpen,
  Users,
  LogOut,
  ChevronLeft,
} from "lucide-react";

const AdminSidebar = ({ 
  activeTab, 
  setActiveTab, 
  sidebarOpen, 
  setSidebarOpen, 
  isMobile, 
  handleLogout 
}) => {
  const tabs = [
    { id: "categories", label: "Categories", icon: Package },
    { id: "bookings", label: "User Bookings", icon: BookOpen },
    { id: "users", label: "User Management", icon: Users },
  ];

  return (
    sidebarOpen && (
      <div
        className="flex overflow-y-auto overflow-x-hidden fixed inset-y-0 left-0 z-[70] flex-col pb-32 w-80 bg-white border-r border-gray-200 shadow-xl lg:fixed lg:inset-y-0 lg:left-0 lg:top-0 lg:h-screen lg:z-40 lg:shadow-none lg:w-72 lg:translate-x-0 lg:flex-shrink-0 scrollbar-hide"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 5rem)",
        }}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                At plus jewellers
              </h1>
              <p className="text-sm text-gray-500">Admin Dashboard</p>
            </div>
            <div className="flex items-center space-x-2 lg:hidden">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <div key={tab.id} className="relative">
              {/* Active indicator bar */}
              {activeTab === tab.id && (
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-amber-500 to-orange-500 rounded-r-full"></div>
              )}
              <button
                onClick={() => {
                  setActiveTab(tab.id);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl font-medium transition-colors overflow-hidden min-w-0
                ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title={!sidebarOpen ? tab.label : ""}
              >
                <tab.icon className="flex-shrink-0 w-5 h-5" />
                {sidebarOpen && (
                  <span className="truncate whitespace-nowrap">
                    {tab.label}
                  </span>
                )}
              </button>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 pb-2 border-t border-gray-200 md:pb-4">
          <button
            onClick={handleLogout}
            className="flex justify-center items-center px-4 py-3 space-x-2 w-full text-white bg-gray-600 rounded-xl transition-colors hover:bg-gray-700"
            title={!sidebarOpen ? "Logout" : ""}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
    )
  );
};

export default AdminSidebar;