import { jsPDF } from "jspdf";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useJewellery } from "../context/JewelleryContext";
import {
  Plus,
  ArrowUp,
  FileText,
} from "lucide-react";
import Footer from "../components/Footer";
import supabase from "../SupabaseClient";
import logo from '../../public/logo.jpeg';

import CategoriesTab from "../components/admin/CategoriesTab";
import BookingsTab from "../components/admin/BookingsTab";
import UsersTab from "../components/admin/UsersTab";
import AddJewelleryModal from "../components/admin/models/AddJewelleryModal";
import AddCategoryModal from "../components/admin/models/AddCategoryModal";
import AddUserModal from "../components/admin/models/AddUserModal";
import DeleteConfirmModal from "../components/admin/models/DeleteConfirmModal";
import AdminSidebar from "../components/admin/AdminSidebar";

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);

  const location = useLocation();
  const {
    jewellery,
    addJewellery,
    updateJewellery,
    deleteJewellery,
  } = useJewellery();

  const [activeTab, setActiveTab] = useState("categories");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(min-width: 1024px)").matches
  );
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  const [isMobile, setIsMobile] = useState(!isDesktop);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    phoneNumber: "",
    role: "user",
    status: "active"
  });

  // Add this state for individual order PDF generation
  const [generatingPDF, setGeneratingPDF] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [categoryImages, setCategoryImages] = useState({});
  const [uniqueCategories, setUniqueCategories] = useState(["All"]);
  const [expandedSets, setExpandedSets] = useState(new Set());

  // Update the resetUserForm function
  const resetUserForm = () => {
    setNewUser({ 
      username: "", 
      password: "", 
      phoneNumber: "", 
      role: "user", 
      status: "active" 
    });
    setShowAddUserModal(false);
  };

  // Handle navigation from category page
  useEffect(() => {
    if (location.state?.showCategories) {
      setActiveTab("categories");
      setSelectedCategory("All");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchOrdersFromSupabase = async () => {
    try {
      setLoadingOrders(true);
      console.log("🔄 Fetching orders from Supabase...");

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*, users(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw new Error('Failed to fetch orders from database');
      }

      console.log("✅ Orders fetched from Supabase:", orders);
      setOrders(orders || []);
    } catch (error) {
      console.error('❌ Failed to load orders from Supabase:', error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchOrdersFromSupabase();
    }
  }, [activeTab]);

  const [newJewellery, setNewJewellery] = useState({
    category: "",
    name: "",
    description: "",
    image: "",
  });
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    image: "",
  });
  const [categoryImagePreview, setCategoryImagePreview] = useState("");

  const asset = (name) => {
    if (!name) return name;
    if (name.startsWith('http') || name.startsWith('https')) {
      return name;
    }
    const base = import.meta.env.BASE_URL || "/";
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const clean = name.startsWith("/") ? name.slice(1) : name;
    return `${cleanBase}/${clean}`;
  };

  function getDefaultCategoryImages() {
    return {
      Animals: { Default: [asset("/download.jpg")] },
      "Arabic Style 21k": { Default: [asset("/download (2).jpg")] },
      Bracelets: { Default: [asset("/images.jpg")] },
      Pendant: { Default: [asset("/download (1).jpg")] },
      "Man Collection": { Default: [asset("/images.jpg")] },
      Rings: { Default: [asset("/download (3).jpg")] },
      Earrings: { Default: [asset("/images.jpg")] },
      SET: { Default: [asset("/download (3).jpg")] },
      Mine: { Default: [asset("/download (2).jpg")] },
    };
  }

const fetchCategoriesFromSupabase = async () => {
  try {
    setLoadingCategories(true);
    console.log("🔄 Fetching categories from Supabase...");

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories from database');
    }

    console.log("✅ Categories fetched from Supabase:", categories);

  if (!categories || categories.length === 0) {
      setCategoriesData([]);
      return;
    }

    if (categories && categories.length > 0) {
      const categoryImagesFromDB = {};
      const categoryNames = ['All'];
      const categoriesWithData = [];

      categories.forEach(category => {
        categoryImagesFromDB[category.category_name] = {
          Default: [category.image_url],
        };
        categoryNames.push(category.category_name);
        categoriesWithData.push(category); // Store the full category object
      });

 const categoriesWithProducts = await Promise.all(
      categoriesData.map(async (category) => {
        const categoryid = category.id ;
        
        // Check if this category has any products
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("id", { count: 'exact' })
          .eq("category_id", categoryid)
          .is("status", null);

        if (productsError) {
          console.error(`Error checking products for category ${categoryid}:`, productsError);
          return { ...category, hasProducts: false };
        }

        // Return category with hasProducts flag
        const hasProducts = (productsData && productsData.length > 0);
        console.log(`Category ${categoryid} has products:`, hasProducts);
        
        return {
          ...category,
          hasProducts: hasProducts
        };
      })
    );

    console.log("Categories with product info:", categoriesWithProducts);
    setCategoriesData(categoriesWithProducts);

      setCategoryImages(categoryImagesFromDB);
      setUniqueCategories(categoryNames);
      setCategoriesData(categoriesWithData); // Set the categories data with IDs
    } else {
      console.log("ℹ️ No categories found in Supabase, using defaults");
      const defaultImages = getDefaultCategoryImages();
      setCategoryImages(defaultImages);
      setUniqueCategories(["All", ...Object.keys(defaultImages)]);
      setCategoriesData([]);
    }
  } catch (error) {
    console.error('❌ Failed to load categories from Supabase:', error);
    const defaultImages = getDefaultCategoryImages();
    setCategoryImages(defaultImages);
    setUniqueCategories(["All", ...Object.keys(defaultImages)]);
    setCategoriesData([]);
  } finally {
    setLoadingCategories(false);
  }
};

  useEffect(() => {
    fetchCategoriesFromSupabase();
  }, []);

  const getCategoryCover = (category) => {
    const categoryData = categoryImages[category];
    if (!categoryData) return asset("download.jpg");

    const firstSubcategory = Object.keys(categoryData)[0];
    if (!firstSubcategory) return asset("download.jpg");

    const photos = categoryData[firstSubcategory];
    if (!photos || !Array.isArray(photos) || photos.length === 0)
      return asset("download.jpg");

    const firstPhoto = photos[0];
    if (typeof firstPhoto === "string") {
      return firstPhoto;
    } else if (firstPhoto && firstPhoto.url) {
      return asset(firstPhoto.url);
    }

    return asset("download.jpg");
  };

const handleDownloadOrderPDF = async (order) => {
  try {
    setGeneratingPDF(order.id);
    
    const doc = new jsPDF();
    
    // Page dimensions and styling
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let yPosition = margin;
    
    // Header with background
    doc.setFillColor(59, 130, 246); // Blue background
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Company Name and Title - centered in header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text("AT PLUS JEWELLERS", pageWidth / 2, margin + 10, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text("Order Receipt", pageWidth / 2, margin + 25, { align: 'center' });
    
    yPosition = 60;
    
    // Order Summary Box
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 40, 'F');
    doc.setTextColor(0, 0, 0);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text("ORDER SUMMARY", margin + 5, yPosition + 8);
    
    doc.setFont(undefined, 'normal');
    doc.text(`Order ID: #${order.id}`, margin + 5, yPosition + 16);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, pageWidth / 2, yPosition + 16);
    
    doc.text(`Customer: ${order.users?.user_name || 'Unknown Customer'}`, margin + 5, yPosition + 24);
    doc.text(`Phone: ${order.users?.phone_number || 'No phone'}`, pageWidth / 2, yPosition + 24);
    
    const totalWeight = order.items?.reduce((total, item) => total + Number(item.weight || 0), 0) || 0;
    doc.text(`Total Weight: ${totalWeight}g`, margin + 5, yPosition + 32);
    doc.text(`Items: ${order.items?.length || 0}`, pageWidth / 2, yPosition + 32);
    
    yPosition += 50;
    
    // Items Table Header
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPosition, pageWidth - 1.7 * margin, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text("ITEM", margin + 5, yPosition + 5);
    doc.text("WEIGHT", pageWidth - 45, yPosition + 5);
    doc.text("IMAGE", pageWidth - 25, yPosition + 5);
    
    yPosition += 12;
    doc.setTextColor(0, 0, 0);
    
    if (order.items && order.items.length > 0) {
      for (let index = 0; index < order.items.length; index++) {
        const item = order.items[index];
        
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }
        
        // Alternate row background
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(margin, yPosition, pageWidth - 2 * margin, 25, 'F');
        }
        
        // Item name and description
        doc.setFontSize(9);
        const itemName = item.product_name || 'Unnamed Item';
        const truncatedName = doc.splitTextToSize(itemName, 80);
        doc.text(truncatedName, margin + 5, yPosition + 5);
        
        if (item.description) {
          const descLines = doc.splitTextToSize(item.description, 80);
          doc.text(descLines, margin + 5, yPosition + 10);
        }
        
        // Weight
        if (item.weight) {
          doc.text(`${item.weight}g`, pageWidth - 45, yPosition + 8);
        }
        
        // Image
        if (item.product_image_url) {
          try {
            const imageData = await new Promise((resolve) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.src = item.product_image_url;
              img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
              };
              img.onerror = () => resolve(null);
            });
            
            if (imageData) {
              doc.addImage(imageData, 'JPEG', pageWidth - 25, yPosition + 2, 15, 15);
            }
          } catch (error) {
            console.warn('Image load failed');
          }
        }
        
        yPosition += 25;
      }
      
      // Total section
      yPosition += 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text("ORDER TOTAL", margin, yPosition);
      doc.text(`${order.items.length} Items • ${totalWeight}g Total Weight`, pageWidth - margin, yPosition, { align: 'right' });
      
    } else {
      doc.text("No items in this order", margin + 5, yPosition + 5);
    }
    
    // Footer
    const pageHeight = doc.internal.pageSize.height;
    yPosition = pageHeight - 30;
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Powered By Botivate", pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 4;
    doc.text("Contact: +91 XXXXXXXXXX | Email: info@botivate.com", pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 4;
    doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
    
    // Save PDF
    doc.save(`AT-Jeweller-Order-${order.id}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  } finally {
    setGeneratingPDF(null);
  }
};


  const toggleSetExpansion = (bookingId) => {
    const newExpanded = new Set(expandedSets);
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId);
    } else {
      newExpanded.add(bookingId);
    }
    setExpandedSets(newExpanded);
  };

  // Category stats for unique categories
  const categoryStats = useMemo(() => {
    const stats = { All: jewellery.length };
    uniqueCategories.slice(1).forEach((cat) => {
      stats[cat] = jewellery.filter((item) => item.category === cat).length;
    });
    return stats;
  }, [jewellery, uniqueCategories]);

  // Filtered and searched jewellery
  const filteredJewellery = useMemo(() => {
    let filtered = jewellery;

    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [jewellery, selectedCategory, searchTerm]);

  // Pagination
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredJewellery.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredJewellery, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredJewellery.length / itemsPerPage);

  useEffect(() => {
    if (newJewellery.image) {
      setImagePreview(newJewellery.image);
    }
  }, [newJewellery.image]);

  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      setIsDesktop(isDesktop);
      setSidebarOpen(isDesktop);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle scroll for back-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Logout handler for sidebar Logout button
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAddJewellery = (e) => {
    e.preventDefault();
    if (newJewellery.category && newJewellery.name && newJewellery.image) {
      if (editingItem) {
        // Update existing item
        updateJewellery(editingItem.id, newJewellery);
        alert("Product updated successfully!");
      } else {
        // Add new item
        addJewellery({
          ...newJewellery,
          price: 0,
          quantity: 1,
        });
        alert("Product added successfully!");
      }

      resetForm();
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      deleteJewellery(deleteConfirm.id);
      setDeleteConfirm(null);
      alert("Product deleted successfully!");
    }
  };

  const resetForm = () => {
    setNewJewellery({
      category: "",
      name: "",
      description: "",
      image: "",
    });
    setImagePreview("");
    setShowAddModal(false);
    setEditingItem(null);
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setNewJewellery({
      category: item.category,
      name: item.name,
      description: item.description,
      image: item.image,
    });
    setImagePreview(item.image);
    setShowAddModal(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setNewJewellery({ ...newJewellery, image: imageUrl });
        setImagePreview(imageUrl);
        console.log("Image loaded successfully:", imageUrl);
      };
      reader.onerror = () => {
        console.error("Error reading file");
        alert("Error loading image. Please try again.");
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select a valid image file.");
    }
  };

  const handleCategoryFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setNewCategory({ ...newCategory, image: imageUrl });
        setCategoryImagePreview(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

const fetchUsers = async () => {
  try {
    setLoading(true);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .not("user_name", "is", null) // exclude null user_name
      .order("created_at", { ascending: false });

    if (error) throw error;

    setUsers(data || []);
  } catch (err) {
    console.error("Error fetching users:", err);
    setUsers([]);
  } finally {
    setLoading(false);
  }
};


  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!newUser.username || !newUser.password) {
      alert("Name and password are required.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            user_name: newUser.username,
            password: newUser.password,
            role: newUser.role,
            phone_number: newUser.phoneNumber,
            status: newUser.status || "active",
          },
        ]);

      if (error) throw error;

      console.log("New user added:", data);
      alert(`User "${newUser.username}" added successfully!`);

      resetUserForm();
      setShowAddUserModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Error adding user:", err);
      alert("Something went wrong while adding the user.");
    }
  };

  const handleViewHistory = () => {
    console.log('View history clicked');
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.image) {
      alert("Please fill in all required fields");
      return;
    }

    // Check if category already exists (case-insensitive)
    const categoryExists = uniqueCategories.some(
      (cat) => cat.toLowerCase() === newCategory.name.toLowerCase()
    );

    if (categoryExists) {
      alert("Category already exists! Please choose a different name.");
      return;
    }

    try {
      // Upload image to Supabase storage if it's a new file
      let imageUrl = newCategory.image;

      // Check if it's a base64 image (new upload)
      if (newCategory.image.startsWith('data:image')) {
        const fileName = `category_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
        
        // Convert base64 to blob
        const response = await fetch(newCategory.image);
        const blob = await response.blob();
        
        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('category_image')
          .upload(fileName, blob, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          throw new Error('Failed to upload image');
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('category_image')
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      // Prepare category data for Supabase
      const categoryData = {
        category_name: newCategory.name,
       
        image_url: imageUrl,
      };

      // Insert into Supabase categories table
      const { data: insertedCategory, error: insertError } = await supabase
        .from('categories')
        .insert([categoryData])
        .select();

      if (insertError) {
        console.error('Error inserting category:', insertError);
        throw new Error('Failed to save category to database');
      }

      // Refresh categories from Supabase to get the latest data
      await fetchCategoriesFromSupabase();

      alert(`"${newCategory.name}" category added successfully with image!`);
      resetCategoryForm();

    } catch (error) {
      console.error('Error adding category:', error);
      alert(`Error adding category: ${error.message}`);
    }
  };

  const resetCategoryForm = () => {
    setNewCategory({ name: "", description: "", image: "" });
    setCategoryImagePreview("");
    setShowAddCategoryModal(false);
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => (input.value = ""));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleStatus = async (userId, newStatus) => {
    try {
      setUpdatingUserId(userId);
      const { error } = await supabase
        .from("users")
        .update({ status: newStatus })
        .eq("id", userId);
      if (error) throw error;

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: newStatus } : u
        )
      );
    } catch (err) {
      console.error("Error updating user status:", err);
      alert("Failed to update user status.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="flex overflow-x-hidden flex-col pb-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-1">
        {/* Sidebar - Now handles its own mobile menu button */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          handleLogout={handleLogout}
        />

        {/* Main Content */}
        <div
          className="flex overflow-hidden overflow-x-hidden flex-col flex-1 min-w-0 lg:ml-72"
          style={{ scrollBehavior: "auto" }}
        >
          {/* Top Bar */}
          <header className="p-4 bg-white border-b border-gray-200 shadow-sm lg:p-6">
            <div className="flex flex-col justify-between items-start space-y-4 lg:flex-row lg:items-center lg:space-y-0">
              <div className="flex-1 max-w-lg"></div>

              {activeTab === "jewellery" && (
                <div className="flex items-center space-x-4">
                  {/* Add your jewellery-specific header content here */}
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-6 py-2 space-x-2 text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg transition-all hover:from-amber-600 hover:to-orange-600"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Jewellery</span>
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-4 pb-28 sm:p-6 lg:pb-6">
            {/* Categories Tab */}
            {activeTab === "categories" && (
          // In AdminDashboard.jsx - update the CategoriesTab usage
<CategoriesTab
  loadingCategories={loadingCategories}
  categoriesData={categoriesData}
  selectedCategory={selectedCategory}
  setSelectedCategory={setSelectedCategory}
  getCategoryCover={getCategoryCover}
  asset={asset}
  showAddCategoryModal={showAddCategoryModal}
  setShowAddCategoryModal={setShowAddCategoryModal}
  categoryImages={categoryImages}
  setCategoryImages={setCategoryImages}
  fetchCategoriesFromSupabase={fetchCategoriesFromSupabase}
  jewellery={jewellery} // Add this line
/>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <BookingsTab
                orders={orders}
                generatingPDF={generatingPDF}
                handleDownloadOrderPDF={handleDownloadOrderPDF}
                handleViewHistory={handleViewHistory}
              />
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <UsersTab
                users={users}
                updatingUserId={updatingUserId}
                handleToggleStatus={handleToggleStatus}
                setShowAddUserModal={setShowAddUserModal}
                fetchUsers={fetchUsers}
              />
            )}
          </main>
        </div>
      </div>

      <Footer />

      {/* Modals */}
      <AddJewelleryModal
        showAddModal={showAddModal}
        editingItem={editingItem}
        newJewellery={newJewellery}
        setNewJewellery={setNewJewellery}
        imagePreview={imagePreview}
        uniqueCategories={uniqueCategories}
        handleAddJewellery={handleAddJewellery}
        handleFileUpload={handleFileUpload}
        resetForm={resetForm}
      />

      <AddCategoryModal
        showAddCategoryModal={showAddCategoryModal}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        categoryImagePreview={categoryImagePreview}
        handleAddCategory={handleAddCategory}
        handleCategoryFileUpload={handleCategoryFileUpload}
        resetCategoryForm={resetCategoryForm}
      />

      <AddUserModal
        showAddUserModal={showAddUserModal}
        newUser={newUser}
        setNewUser={setNewUser}
        handleAddUser={handleAddUser}
        resetUserForm={resetUserForm}
      />

      <DeleteConfirmModal
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        handleDeleteConfirm={handleDeleteConfirm}
      />

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed right-6 bottom-24 z-40 p-3 text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg transition-all duration-300 transform hover:shadow-xl hover:scale-110 active:scale-95 md:bottom-8 animate-fade-in-up"
          title="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default AdminDashboard;