import React, { createContext, useContext, useState, useEffect } from "react";

const JewelleryContext = createContext();

export const useJewellery = () => {
  const context = useContext(JewelleryContext);
  if (!context) {
    throw new Error("useJewellery must be used within a JewelleryProvider");
  }
  return context;
};

export const JewelleryProvider = ({ children }) => {
  // Resolve public assets with Vite base; keep data URLs intact
  const asset = (path) => {
    if (!path) return path;
    if (typeof path !== "string") return path;
    if (path.startsWith("data:")) return path;
    const base = import.meta.env.BASE_URL || "/";
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${cleanBase}/${cleanPath}`;
  };

  // Initial mock data - this will be replaced by your backend API later
  const initialJewellery = [
    {
      id: 1,
      category: "Animals",
      name: "Lion Pendant",
      description: "Majestic lion design",
      price: 15000,
      image: "/download.jpg",
      quantity: 5,
      rating: 4.8,
      reviews: 24,
    },
    {
      id: 2,
      category: "Animals",
      name: "Elephant Ring",
      description: "Traditional elephant motif",
      price: 8500,
      image: "/download (1).jpg",
      quantity: 3,
      rating: 4.6,
      reviews: 18,
    },
    {
      id: 3,
      category: "Arabic Style 21k",
      name: "Golden Bracelet",
      description: "Arabic calligraphy design",
      price: 25000,
      image: "/download (2).jpg",
      quantity: 2,
      rating: 4.9,
      reviews: 31,
    },
    {
      id: 4,
      category: "Rings",
      name: "Diamond Ring",
      description: "Sparkling diamond solitaire",
      price: 45000,
      image: "/download (3).jpg",
      quantity: 1,
      rating: 5.0,
      reviews: 42,
    },
    {
      id: 5,
      category: "Earrings",
      name: "Pearl Studs",
      description: "Classic pearl earrings",
      price: 12000,
      image: "/images.jpg",
      quantity: 8,
      rating: 4.7,
      reviews: 28,
    },
    // More Animals
    {
      id: 6,
      category: "Animals",
      name: "Tiger Necklace",
      description: "Fierce tiger pendant design",
      price: 18000,
      image: "/download.jpg",
      quantity: 4,
      rating: 4.5,
      reviews: 15,
    },
    {
      id: 7,
      category: "Animals",
      name: "Butterfly Brooch",
      description: "Delicate butterfly pin",
      price: 9500,
      image: "/download (1).jpg",
      quantity: 6,
      rating: 4.4,
      reviews: 12,
    },
    {
      id: 8,
      category: "Animals",
      name: "Horse Pendant",
      description: "Elegant horse silhouette",
      price: 14000,
      image: "/download (2).jpg",
      quantity: 3,
      rating: 4.6,
      reviews: 19,
    },
    // More Arabic Style
    {
      id: 9,
      category: "Arabic Style 21k",
      name: "Arabic Necklace",
      description: "Intricate Arabic calligraphy pendant",
      price: 32000,
      image: "/download.jpg",
      quantity: 2,
      rating: 4.8,
      reviews: 22,
    },
    {
      id: 10,
      category: "Arabic Style 21k",
      name: "Arabic Earrings",
      description: "Traditional Arabic drop earrings",
      price: 16000,
      image: "/download (1).jpg",
      quantity: 5,
      rating: 4.7,
      reviews: 25,
    },
    {
      id: 11,
      category: "Arabic Style 21k",
      name: "Arabic Ring",
      description: "Arabic script band ring",
      price: 22000,
      image: "/download (3).jpg",
      quantity: 3,
      rating: 4.9,
      reviews: 33,
    },
    // Bracelets
    {
      id: 12,
      category: "Bracelets",
      name: "Silver Bangle Set",
      description: "Traditional silver bangles",
      price: 8000,
      image: "/images.jpg",
      quantity: 12,
      rating: 4.5,
      reviews: 16,
    },
    {
      id: 13,
      category: "Bracelets",
      name: "Gold Chain Bracelet",
      description: "Delicate gold chain bracelet",
      price: 28000,
      image: "/download (2).jpg",
      quantity: 4,
      rating: 4.8,
      reviews: 29,
    },
    {
      id: 14,
      category: "Bracelets",
      name: "Beaded Bracelet",
      description: "Colorful crystal beaded bracelet",
      price: 3500,
      image: "/download.jpg",
      quantity: 15,
      rating: 4.3,
      reviews: 14,
    },
    // Pendant
    {
      id: 15,
      category: "Pendant",
      name: "Heart Pendant",
      description: "Classic heart shaped pendant",
      price: 6500,
      image: "/download (1).jpg",
      quantity: 8,
      rating: 4.6,
      reviews: 21,
    },
    {
      id: 16,
      category: "Pendant",
      name: "Cross Pendant",
      description: "Elegant cross pendant",
      price: 7200,
      image: "/download (2).jpg",
      quantity: 6,
      rating: 4.7,
      reviews: 18,
    },
    {
      id: 17,
      category: "Pendant",
      name: "Star Pendant",
      description: "Five-pointed star pendant",
      price: 5800,
      image: "/download (3).jpg",
      quantity: 9,
      rating: 4.4,
      reviews: 13,
    },
    // Man Collection
    {
      id: 18,
      category: "Man Collection",
      name: "Men's Gold Chain",
      description: "Heavy gold chain necklace",
      price: 45000,
      image: "/images.jpg",
      quantity: 3,
      rating: 4.9,
      reviews: 35,
    },
    {
      id: 19,
      category: "Man Collection",
      name: "Men's Silver Bracelet",
      description: "Stylish men's silver bracelet",
      price: 12000,
      image: "/download.jpg",
      quantity: 7,
      rating: 4.6,
      reviews: 23,
    },
    {
      id: 20,
      category: "Man Collection",
      name: "Men's Ring",
      description: "Bold men's fashion ring",
      price: 18000,
      image: "/download (1).jpg",
      quantity: 5,
      rating: 4.8,
      reviews: 27,
    },
    // More Rings
    {
      id: 21,
      category: "Rings",
      name: "Sapphire Ring",
      description: "Blue sapphire engagement ring",
      price: 52000,
      image: "/download (2).jpg",
      quantity: 2,
      rating: 5.0,
      reviews: 38,
    },
    {
      id: 22,
      category: "Rings",
      name: "Ruby Ring",
      description: "Red ruby cocktail ring",
      price: 38000,
      image: "/download (3).jpg",
      quantity: 1,
      rating: 4.9,
      reviews: 31,
    },
    {
      id: 23,
      category: "Rings",
      name: "Emerald Ring",
      description: "Green emerald band ring",
      price: 42000,
      image: "/images.jpg",
      quantity: 2,
      rating: 4.8,
      reviews: 26,
    },
    // More Earrings
    {
      id: 24,
      category: "Earrings",
      name: "Gold Hoops",
      description: "Large gold hoop earrings",
      price: 15000,
      image: "/download.jpg",
      quantity: 6,
      rating: 4.7,
      reviews: 24,
    },
    {
      id: 25,
      category: "Earrings",
      name: "Diamond Studs",
      description: "Small diamond stud earrings",
      price: 25000,
      image: "/download (1).jpg",
      quantity: 4,
      rating: 4.9,
      reviews: 36,
    },
    {
      id: 26,
      category: "Earrings",
      name: "Silver Drops",
      description: "Elegant silver drop earrings",
      price: 8500,
      image: "/download (2).jpg",
      quantity: 8,
      rating: 4.5,
      reviews: 17,
    },
    // SET (Jewelry Sets)
    {
      id: 27,
      category: "SET",
      name: "Gold Necklace Set",
      description: "Complete gold necklace and earring set",
      price: 55000,
      image: "/download (3).jpg",
      quantity: 2,
      rating: 4.9,
      reviews: 28,
    },
    {
      id: 28,
      category: "SET",
      name: "Diamond Jewelry Set",
      description: "Necklace, earrings, and bracelet set",
      price: 150000,
      image: "/images.jpg",
      quantity: 1,
      rating: 5.0,
      reviews: 45,
    },
    {
      id: 29,
      category: "SET",
      name: "Silver Wedding Set",
      description: "Wedding rings and pendant set",
      price: 35000,
      image: "/download.jpg",
      quantity: 3,
      rating: 4.8,
      reviews: 30,
    },
    // Mine (Custom/Mined)
    {
      id: 30,
      category: "Mine",
      name: "Raw Diamond Pendant",
      description: "Uncut diamond pendant",
      price: 75000,
      image: "/download (1).jpg",
      quantity: 1,
      rating: 4.9,
      reviews: 41,
    },
    {
      id: 31,
      category: "Mine",
      name: "Natural Ruby Ring",
      description: "Natural mined ruby ring",
      price: 65000,
      image: "/download (2).jpg",
      quantity: 1,
      rating: 4.8,
      reviews: 37,
    },
  ];

  const [jewellery, setJewellery] = useState(() => {
    // Try to load from localStorage first, fallback to initial data
    const saved = localStorage.getItem("jewellery-data");
    const base = saved ? JSON.parse(saved) : initialJewellery;
    // Normalize image paths for deploy base
    return base.map((item) => ({ ...item, image: asset(item.image) }));
  });

  // CENTRALIZED BOOKINGS SYSTEM - All user bookings stored here
  const [allBookings, setAllBookings] = useState(() => {
    // Try to load from localStorage first, fallback to empty array
    const saved = localStorage.getItem("all-bookings-data");
    const base = saved ? JSON.parse(saved) : [];
    // Normalize any stored image paths to respect app base; keep data URLs unchanged
    return base.map((b) => {
      const normalized = { ...b };
      if (typeof normalized.image === "string") {
        normalized.image = asset(normalized.image);
      }
      if (Array.isArray(normalized.images)) {
        normalized.images = normalized.images.map((img) => asset(img));
      }
      return normalized;
    });
  });

  // Save all bookings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("all-bookings-data", JSON.stringify(allBookings));
  }, [allBookings]);

  // Persist jewellery to localStorage so added data survives reloads
  useEffect(() => {
    try {
      localStorage.setItem("jewellery-data", JSON.stringify(jewellery));
    } catch (err) {
      console.error("Failed to persist jewellery-data to localStorage", err);
    }
  }, [jewellery]);

  // Add new booking with comprehensive data capture
  const addBooking = (bookingData, currentUser = null) => {
    // Handle multiple items in a single booking
    const items = bookingData.items || [bookingData];
    const itemsArray = Array.isArray(items) ? items : [items];

    // Generate unique base timestamp for this booking batch
    const baseTimestamp = Date.now();

    // Create booking entries for each item
    const newBookings = itemsArray.map((item, index) => {
      // Normalize image(s) for persistence and correct base path
      const primaryImage = asset(item.image);
      const imagesArr = Array.isArray(item.images)
        ? item.images.map((img) => asset(img))
        : undefined;
      const booking = {
        ...bookingData,
        ...item,
        id: `booking-${baseTimestamp}-${Math.random()
          .toString(36)
          .substr(2, 9)}-${index}`, // Unique ID for each item
        bookingDate: new Date().toISOString(),
        status: "Confirmed",
        image: primaryImage,
        images: imagesArr,
        // User information - prioritize passed user data
        userId:
          currentUser?.id ||
          bookingData.userId ||
          item.userId ||
          `guest-${Date.now()}`,
        userName:
          currentUser?.name ||
          bookingData.userName ||
          item.userName ||
          "Anonymous",
        userEmail:
          currentUser?.email || bookingData.userEmail || item.userEmail || "",
        userPhone:
          currentUser?.phone || bookingData.userPhone || item.userPhone || "",
        // Ensure all required fields are captured
        category: item.category || bookingData.category || "N/A",
        jewelleryName: item.jewelleryName || item.name || "N/A",
        items: item.items || item.quantity || 1,
        grams: parseFloat(item.grams) || parseFloat(item.weight) || 0,
        price: item.price || bookingData.price || 0,
        description: item.description || bookingData.description || "",
        // Store additional booking details
        bookingDetails: {
          totalItems: item.items || item.quantity || 1,
          totalGrams: parseFloat(item.grams) || parseFloat(item.weight) || 0,
          unitPrice: item.price || bookingData.price || 0,
          totalPrice:
            (item.items || item.quantity || 1) *
            (item.price || bookingData.price || 0),
          orderType: bookingData.orderType || "Standard",
          notes: bookingData.notes || "",
          // Track if this is part of a multi-item booking
          isMultiItem: itemsArray.length > 1,
          totalItemsInBooking: itemsArray.length,
          itemIndex: index + 1,
        },
      };
      return booking;
    });

    // Add to central bookings store
    setAllBookings((prev) => [...prev, ...newBookings]);
    return newBookings.length;
  };

  // Get bookings for a specific user (for user dashboard)
  const getUserBookings = (userId) => {
    if (!userId) return [];
    return allBookings.filter((booking) => booking.userId === userId);
  };

  // Get all bookings (for admin dashboard)
  const getAllBookings = () => {
    return allBookings;
  };

  // Get bookings by status
  const getBookingsByStatus = (status) => {
    return allBookings.filter((booking) => booking.status === status);
  };

  // Get bookings by date range
  const getBookingsByDateRange = (startDate, endDate) => {
    return allBookings.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= startDate && bookingDate <= endDate;
    });
  };

  // Update booking status (for admin)
  const updateBookingStatus = (bookingId, newStatus, notes = "") => {
    setAllBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status: newStatus,
              statusUpdatedAt: new Date().toISOString(),
              adminNotes: notes,
            }
          : booking
      )
    );
  };

  // Clear all bookings (for admin)
  const clearAllBookings = () => {
    setAllBookings([]);
    localStorage.removeItem("all-bookings-data");
    return true;
  };

  // Delete booking (for admin)
  const deleteBooking = (bookingId) => {
    setAllBookings((prev) =>
      prev.filter((booking) => booking.id !== bookingId)
    );
  };

  // Get booking statistics
  const getBookingStats = () => {
    const total = allBookings.length;
    const confirmed = allBookings.filter(
      (b) => b.status === "Confirmed"
    ).length;
    const processing = allBookings.filter(
      (b) => b.status === "Processing"
    ).length;
    const delivered = allBookings.filter(
      (b) => b.status === "Delivered"
    ).length;
    const cancelled = allBookings.filter(
      (b) => b.status === "Cancelled"
    ).length;

    const totalRevenue = allBookings
      .filter((b) => b.status !== "Cancelled")
      .reduce(
        (sum, b) => sum + (b.bookingDetails?.totalPrice || b.price || 0),
        0
      );

    const uniqueUsers = new Set(allBookings.map((b) => b.userId)).size;

    return {
      total,
      confirmed,
      processing,
      delivered,
      cancelled,
      totalRevenue,
      uniqueUsers,
    };
  };

  // Add new jewellery item
  const addJewellery = (newItem) => {
    const item = {
      ...newItem,
      id: Date.now(), // Simple ID generation
      rating: 0,
      reviews: 0,
    };
    setJewellery((prev) => [...prev, item]);
  };

  // Update existing jewellery item
  const updateJewellery = (id, updatedItem) => {
    setJewellery((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedItem } : item))
    );
  };

  // Delete jewellery item
  const deleteJewellery = (id) => {
    setJewellery((prev) => prev.filter((item) => item.id !== id));
  };

  // Get jewellery by category
  const getJewelleryByCategory = (category) => {
    if (category === "All") return jewellery;
    return jewellery.filter((item) => item.category === category);
  };

  // Get all categories
  const getCategories = () => {
    const categories = [
      "All",
      ...new Set(jewellery.map((item) => item.category)),
    ];
    return categories;
  };

  const value = {
    jewellery,

    // Centralized booking system
    allBookings,
    getUserBookings,
    getAllBookings,
    getBookingsByStatus,
    getBookingsByDateRange,
    updateBookingStatus,
    deleteBooking,
    clearAllBookings,
    getBookingStats,
    addBooking,

    // Jewellery management
    addJewellery,
    updateJewellery,
    deleteJewellery,
    getJewelleryByCategory,
    getCategories,

    // Legacy support (deprecated - use getUserBookings instead)
    bookings: allBookings, // For backward compatibility
  };

  return (
    <JewelleryContext.Provider value={value}>
      {children}
    </JewelleryContext.Provider>
  );
};
