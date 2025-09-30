import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { JewelleryProvider } from "./context/JewelleryContext";
import Login from "./components/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import AdminCategoryPage from "./pages/AdminCategoryPage";


// Component that decides what to show based on auth state
function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-b-2 border-amber-500 animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      {/* Root route → Show dashboard based on role */}
      <Route
        path="/"
        element={user.role === "admin" ? <AdminDashboard /> : <UserDashboard />}
      />

      {/* Admin category page (accessible to both, but you can restrict with role check) */}
      <Route path="/category/:categoryName" element={<AdminCategoryPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <JewelleryProvider>
        <Router>
         
          <AppContent />
        

        </Router>
      </JewelleryProvider>
    </AuthProvider>
  );
}

export default App;
