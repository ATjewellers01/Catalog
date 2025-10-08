import {
  Package,
  BookOpen,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import Footer from "../Footer";

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

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (isMobile) setSidebarOpen(false);
  };

 const userData = localStorage.getItem("users");
const userName = userData ? JSON.parse(userData).user_name : null;

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-[60] bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Menu Toggle */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-gray-200 transition-all hover:bg-gray-50 lg:hidden ios-touch-target"
          title="Open Menu"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-[70] bg-white flex flex-col justify-between w-full sm:w-[85vw] sm:max-w-xs border-r border-gray-200 shadow-xl lg:z-40 lg:shadow-none lg:w-72 lg:max-w-none lg:flex-shrink-0 overflow-y-auto overflow-x-hidden scrollbar-hide transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          height: "100dvh",
          paddingBottom: "max(env(safe-area-inset-bottom, 0px) + 2rem, 5rem)",
        }}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                At plus jewellers
              </h1>
              <p className="text-sm text-gray-500">{userName}</p>
            </div>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100 lg:hidden ios-touch-target"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
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
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl font-medium transition-colors overflow-hidden min-w-0 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title={tab.label}
              >
                <tab.icon className="flex-shrink-0 w-5 h-5" />
                <span className="truncate whitespace-nowrap">{tab.label}</span>
              </button>
            </div>
          ))}
        </nav>

        {/* Footer & Logout */}
        <div className="flex flex-col p-4 space-y-6 border-t border-gray-200">
          {isMobile && sidebarOpen && <Footer />}

          <button
            onClick={handleLogout}
            className="flex justify-center items-center px-4 py-3 w-full space-x-2 text-white bg-gray-600 rounded-xl transition-colors hover:bg-gray-700 ios-touch-target prevent-zoom"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop Collapsed Sidebar */}
      {!sidebarOpen && !isMobile && (
        <div className="hidden flex-col items-center py-4 w-16 bg-white border-r border-gray-200 shadow-xl lg:flex lg:w-72 lg:max-w-none lg:translate-x-0 lg:flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 mb-4 rounded-lg transition-colors hover:bg-gray-100 ios-touch-target"
            title="Show Sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Navigation Icons */}
          <nav className="flex-1 space-y-2">
            {tabs.map((tab) => (
              <div key={tab.id} className="relative">
                {activeTab === tab.id && (
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-amber-500 to-orange-500 rounded-r-full"></div>
                )}
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  title={tab.label}
                >
                  <tab.icon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </nav>

          {/* Logout Icon */}
          <div className="mt-auto mb-4">
            <button
              onClick={handleLogout}
              className="flex justify-center items-center w-12 h-12 text-gray-600 rounded-xl transition-colors hover:text-gray-800 hover:bg-gray-100"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;