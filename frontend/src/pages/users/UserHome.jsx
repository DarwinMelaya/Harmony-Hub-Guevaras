import Layout from "../../components/Layout/Layout";
import CartModal from "../../components/Modals/Users/CartModal";
import BookingModal from "../../components/Modals/Users/BookingModal";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  User,
  ChevronDown,
  ShoppingCart,
  Package,
  Star,
  Heart,
  Eye,
  Search,
  Filter,
  X,
  Music,
  Calendar,
} from "lucide-react";
import InventoryCard from "../../components/User/Dashboard/InventoryCard";
import ArtistCard from "../../components/User/Dashboard/ArtistCard";
import PackagesCard from "../../components/User/Dashboard/PackagesCard";
import UserCalendar from "../../components/User/Dashboard/UserCalendar";
import axios from "axios";
import toast from "react-hot-toast";

const UserHome = () => {
  const [userData, setUserData] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [packages, setPackages] = useState([]);
  const [bandArtists, setBandArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Cart and booking states
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [bookingData, setBookingData] = useState({
    bookingDate: "",
    bookingTime: "",
    setupDate: "",
    setupTime: "",
    duration: 1,
    notes: "",
    contactInfo: {
      phone: "",
      email: "",
      address: "",
    },
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Fly-to-cart animation state
  const cartButtonRef = useRef(null);
  const [flyItems, setFlyItems] = useState([]);

  // Booking mode: 'standard' (Inventory + Artists) or 'packages'
  const [bookingMode, setBookingMode] = useState("standard");

  // Artist availability tracking
  const [artistAvailability, setArtistAvailability] = useState({});
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [reservedDates, setReservedDates] = useState([]); // dates with confirmed bookings (YYYY-MM-DD)

  // Compute available quantities per inventory item based on cart reservations
  const { inventoryWithAvailability, availableQuantityMap } = useMemo(() => {
    const reservedTotals = cart.reduce((acc, cartItem) => {
      if (cartItem.type === "inventory") {
        acc[cartItem.id] = cartItem.quantity;
      }
      return acc;
    }, {});

    const list = inventory.map((item) => {
      const reserved = reservedTotals[item._id] ?? 0;
      const available = Math.max(0, (item.quantity ?? 0) - reserved);
      return {
        ...item,
        availableQuantity: available,
      };
    });

    const map = new Map(list.map((item) => [item._id, item.availableQuantity]));

    return {
      inventoryWithAvailability: list,
      availableQuantityMap: map,
    };
  }, [inventory, cart]);

  const getAvailableById = (itemId) =>
    availableQuantityMap.get(itemId) ?? 0;

  // Define fetchData before useEffect hooks that use it
  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const [inventoryResponse, packagesResponse, artistsResponse] =
        await Promise.all([
          axios.get("http://localhost:5000/api/inventory/public"),
          axios.get("http://localhost:5000/api/packages/public"),
          axios.get("http://localhost:5000/api/users/artists/public"),
        ]);

      setInventory(inventoryResponse.data.inventory || []);
      setPackages(packagesResponse.data.packages || []);
      setBandArtists(artistsResponse.data.data || []);
    } catch (err) {
      // Only show error if not silent (to avoid spamming errors during polling)
      if (!silent) {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Get user data from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      setUserData(JSON.parse(user));
    }

    // Fetch inventory and packages
    fetchData();

    // Fetch confirmed-reserved dates for venue
    const fetchReservedDates = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/bookings/calendar"
        );
        const bookings = response.data?.data || [];

        // Keep only confirmed bookings and map to YYYY-MM-DD strings
        const confirmedDates = bookings
          .filter((b) => b.status === "confirmed")
          .map((b) => {
            const d = new Date(b.bookingDate);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          });

        // Unique date strings
        setReservedDates(Array.from(new Set(confirmedDates)));
      } catch (err) {
        console.error("Error fetching reserved dates:", err);
      }
    };

    fetchReservedDates();
  }, [fetchData]);

  // Refetch data after successful booking to reflect availability/quantities
  useEffect(() => {
    if (bookingSuccess) {
      fetchData();
    }
  }, [bookingSuccess, fetchData]);

  // Poll inventory data frequently while the tab is active
  useEffect(() => {
    let pollInterval = null;

    const startPolling = () => {
      // Immediately fetch once when starting
      fetchData(true);
      pollInterval = setInterval(() => {
        fetchData(true);
      }, 10000); // 10-second refresh while active
    };

    const stopPolling = () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        stopPolling();
        startPolling();
      } else {
        stopPolling();
      }
    };

    const handleWindowFocus = () => {
      stopPolling();
      startPolling();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    // Kick off polling immediately when component mounts
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [fetchData]);

  // Check artist availability for a specific date
  const checkArtistAvailability = async (artistId, bookingDate) => {
    if (!bookingDate) return true; // If no date selected, assume available

    try {
      setCheckingAvailability(true);
      const response = await axios.get(
        `http://localhost:5000/api/bookings/check-availability?artistId=${artistId}&bookingDate=${bookingDate}`
      );
      if (response.data.success) {
        setArtistAvailability((prev) => ({
          ...prev,
          [`${artistId}-${bookingDate}`]: response.data.available,
        }));
        return response.data.available;
      }
      return false;
    } catch (err) {
      console.error("Error checking artist availability:", err);
      return false;
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Filter and search functions
  const filterItems = (items, type) => {
    let filtered = items;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          (item.name || item.fullName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (item.description &&
            item.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (item.genre &&
            item.genre.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      if (type === "inventory") {
        const quantityAccessor = (item) =>
          item.availableQuantity ?? item.quantity ?? 0;
        if (selectedCategory === "available") {
          filtered = filtered.filter((item) => quantityAccessor(item) > 0);
        } else if (selectedCategory === "out_of_stock") {
          filtered = filtered.filter((item) => quantityAccessor(item) === 0);
        }
      } else if (type === "packages") {
        // For packages, filter by price range
        if (selectedCategory === "budget") {
          filtered = filtered.filter((item) => item.price < 10000);
        } else if (selectedCategory === "premium") {
          filtered = filtered.filter((item) => item.price >= 10000);
        }
      }
    }

    // Sort
    if (sortBy === "newest") {
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.createdAt || b.updatedAt) -
          new Date(a.createdAt || a.updatedAt)
      );
    } else if (sortBy === "oldest") {
      filtered = filtered.sort(
        (a, b) =>
          new Date(a.createdAt || a.updatedAt) -
          new Date(b.createdAt || b.updatedAt)
      );
    } else if (sortBy === "price_low") {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_high") {
      filtered = filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  };

  const filteredInventory = filterItems(
    inventoryWithAvailability,
    "inventory"
  );
  const filteredPackages = filterItems(packages, "packages");
  const filteredBandArtists = filterItems(bandArtists, "bandArtists");

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("newest");
  };

  const addToCart = async (item, type) => {
    const cartItem = {
      id: item._id,
      name: item.name || item.fullName,
      type: type,
      price: type === "bandArtist" ? item.booking_fee : item.price,
      quantity: 1,
      image: item.image,
      genre: item.genre,
      description: item.description,
      unit: item.unit,
      category: item.category,
    };
    const itemLabel = cartItem.name || "Item";

    if (type === "inventory") {
      const available = getAvailableById(item._id);
      if (available <= 0) {
        const message = "No more stock available for this item.";
        setError(message);
        return { status: "error", message };
      }

      let updated = false;
      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (ci) => ci.id === item._id && ci.type === type
        );
        if (existingItem) {
          updated = true;
          return prevCart.map((c) =>
            c.id === item._id && c.type === type
              ? { ...c, quantity: c.quantity + 1 }
              : c
          );
        }
        updated = true;
        return [...prevCart, cartItem];
      });

      if (updated) {
        return {
          status: "success",
          message: `${itemLabel} added to your selections.`,
        };
      }

      return {
        status: "info",
        message: `${itemLabel} is already in your selections.`,
      };
    }

    // For band artists, check availability if booking date is selected
    if (type === "bandArtist" && bookingData.bookingDate) {
      const isAvailable = await checkArtistAvailability(
        item._id,
        bookingData.bookingDate
      );
      if (!isAvailable) {
        const message = `${
          item.fullName || item.name || "Artist"
        } is not available on ${bookingData.bookingDate}`;
        setError(message);
        return { status: "error", message };
      }
    }

    let duplicate = false;
    let added = false;
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (ci) => ci.id === item._id && ci.type === type
      );
      if (existingItem) {
        duplicate = true;
        return prevCart;
      }
      added = true;
      return [...prevCart, cartItem];
    });

    if (duplicate) {
      return {
        status: "info",
        message: `${itemLabel} is already in your selections.`,
      };
    }

    if (added) {
      return {
        status: "success",
        message: `${itemLabel} added to your selections.`,
      };
    }

    return {
      status: "error",
      message: "Unable to update selections at this time.",
    };
  };

  // Trigger fly animation from a source element id
  const triggerFlyFrom = (sourceElementId, imageSrc) => {
    const sourceEl = document.getElementById(sourceElementId);
    const cartEl = cartButtonRef.current;
    if (!sourceEl || !cartEl) return;

    const srcRect = sourceEl.getBoundingClientRect();
    const cartRect = cartEl.getBoundingClientRect();

    const startX = srcRect.left + srcRect.width / 2;
    const startY = srcRect.top + srcRect.height / 2;
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;

    const id = Date.now() + Math.random();
    const initial = {
      id,
      src: imageSrc,
      style: {
        position: "fixed",
        left: `${startX - 20}px`,
        top: `${startY - 20}px`,
        width: "40px",
        height: "40px",
        borderRadius: "9999px",
        overflow: "hidden",
        pointerEvents: "none",
        opacity: 1,
        transform: "scale(1)",
        transition:
          "left 600ms cubic-bezier(0.22, 1, 0.36, 1), top 600ms cubic-bezier(0.22, 1, 0.36, 1), transform 600ms ease, opacity 600ms ease",
        zIndex: 9999,
      },
    };
    setFlyItems((prev) => [...prev, initial]);

    // Animate to cart on next frame
    requestAnimationFrame(() => {
      setFlyItems((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                style: {
                  ...f.style,
                  left: `${endX - 12}px`,
                  top: `${endY - 12}px`,
                  width: "24px",
                  height: "24px",
                  transform: "scale(0.6)",
                  opacity: 0.2,
                },
              }
            : f
        )
      );
    });

    // Cleanup after animation
    setTimeout(() => {
      setFlyItems((prev) => prev.filter((f) => f.id !== id));
    }, 700);
  };

  const handleAddToCartClick = async (item, type, sourceElementId) => {
    const result = await addToCart(item, type);
    if (!result) return;

    const { status, message } = result;

    if (status === "success") {
      toast.success(message || "Added to selections.");
      const img =
        item.image || (Array.isArray(item.images) ? item.images[0] : null) || null;
      triggerFlyFrom(sourceElementId, img);
    } else if (status === "info") {
      toast(message || "Already in selections.", {
        icon: "ℹ️",
      });
    } else if (status === "error") {
      toast.error(message || "Unable to add item.");
    }
  };

  const removeFromCart = (itemId, type) => {
    setCart((prevCart) =>
      prevCart.filter((i) => !(i.id === itemId && i.type === type))
    );
  };

  const updateCartQuantity = (itemId, type, newQuantity) => {
    // Packages and band artists are singular; force quantity to 1
    if (type === "package" || type === "bandArtist") {
      return;
    }
    if (newQuantity <= 0) {
      removeFromCart(itemId, type);
      return;
    }

    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === itemId && item.type === type) {
          const currentQty = item.quantity;
          const diff = newQuantity - currentQty;
          if (diff === 0) return item;
          if (diff > 0) {
            const available = getAvailableById(itemId);
            if (diff > available) {
              setError("Cannot exceed available stock.");
              return item;
            }
            return { ...item, quantity: newQuantity };
          } else {
            return { ...item, quantity: newQuantity };
          }
        }
        return item;
      });
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const clearCart = () => {
    // Release all reserved inventory
    setCart([]);
  };

  const switchBookingMode = (mode) => {
    if (mode === bookingMode) return;
    // On mode switch, keep only compatible items
    if (mode === "packages") {
      // Release inventory reservations and remove inventory; keep packages and artists
      setCart((prev) => prev.filter((i) => i.type !== "inventory"));
    } else {
      // standard: remove packages only, keep inventory and artists
      setCart((prev) => prev.filter((i) => i.type !== "package"));
    }
    setBookingMode(mode);
  };

  // Booking functions
  const handleBookingSubmit = async (e, customBookingData = null) => {
    e.preventDefault();

    // Use custom booking data if provided (from agreement modal), otherwise use state
    const dataToUse = customBookingData || bookingData;

    if (cart.length === 0) {
      setError("Cart is empty. Please add items to book.");
      return;
    }

    if (!dataToUse.bookingDate || !dataToUse.bookingTime) {
      setError("Please select booking date and time.");
      return;
    }

    if (!dataToUse.setupDate || !dataToUse.setupTime) {
      setError("Please select setup date and time for advance arrival.");
      return;
    }

    setBookingLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const bookingPayload = {
        items: cart.map((item) => ({
          type: item.type,
          itemId: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
        bookingDate: dataToUse.bookingDate,
        bookingTime: dataToUse.bookingTime,
        setupDate: dataToUse.setupDate,
        setupTime: dataToUse.setupTime,
        duration: dataToUse.duration,
        notes: dataToUse.notes,
        contactInfo: dataToUse.contactInfo,
        agreement: dataToUse.agreement, // Add agreement data
      };

      const response = await axios.post(
        "http://localhost:5000/api/bookings",
        bookingPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setBookingSuccess(true);
        clearCart();
        setShowBookingModal(false);
        // Clear artist availability cache since booking was successful
        setArtistAvailability({});
        setBookingData({
          bookingDate: "",
          bookingTime: "",
          setupDate: "",
          setupTime: "",
          duration: 1,
          notes: "",
          contactInfo: {
            phone: "",
            email: "",
            address: "",
          },
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBookingDataChange = async (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setBookingData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      // Block selecting a date that is already reserved (confirmed booking)
      if (field === "bookingDate" && value) {
        if (reservedDates.includes(value)) {
          setError("Selected date is already reserved.");
          return;
        }
      }

      setBookingData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // If booking date changes, check availability for all artists
      if (field === "bookingDate" && value) {
        const artistPromises = bandArtists.map((artist) =>
          checkArtistAvailability(artist._id, value)
        );
        await Promise.all(artistPromises);
      }
    }
  };

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with user profile */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="text-orange-400">GUEVARRA</span> LIGHTS AND
                SOUNDS
              </h1>
              {userData && (
                <div className="mb-4">
                  <p className="text-gray-300">
                    Welcome,{" "}
                    <span className="text-orange-400 font-semibold">
                      {userData.fullName || userData.username}
                    </span>
                  </p>
                  <p className="text-gray-400 text-sm">{userData.email}</p>
                </div>
              )}
            </div>

            {/* Cart and User Profile Section */}
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              {/* Calendar Button */}
              <button
                onClick={() => setShowCalendar(true)}
                className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Calendar className="w-5 h-5 text-gray-300" />
                <span className="text-gray-300 font-medium hidden sm:inline">
                  Calendar
                </span>
              </button>

              {/* Cart Button */}
              <button
                onClick={() => setShowCart(true)}
                ref={cartButtonRef}
                className="relative bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5 text-gray-300" />
                <span className="text-gray-300 font-medium hidden sm:inline">
                  My Selections
                </span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>

              {/* User Profile Section */}
              {userData && (
                <div className="flex items-center space-x-3 bg-gray-800 px-3 sm:px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-300" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-300 font-medium text-sm truncate max-w-[140px] sm:max-w-none">
                      {userData.fullName || userData.username}
                    </span>
                    <span className="text-gray-500 text-xs capitalize">
                      {userData.role}
                    </span>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8">
            <div className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700">
              <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search instruments, packages, or services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 flex items-center gap-2 transition-colors w-full lg:w-auto justify-center"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Items</option>
                        <option value="available">Available Only</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="budget">Budget (Under ₱10,000)</option>
                        <option value="premium">Premium (₱10,000+)</option>
                      </select>
                    </div>

                    {/* Sort Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="name">Name: A to Z</option>
                      </select>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                      <button
                        onClick={clearFilters}
                        className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Results Summary */}
              {(searchTerm || selectedCategory !== "all") && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    <span>
                      Showing {filteredInventory.length} instruments,{" "}
                      {filteredPackages.length} packages, and{" "}
                      {filteredBandArtists.length} band artists
                    </span>
                    {searchTerm && (
                      <span className="flex items-center gap-2">
                        Search: "{searchTerm}"
                        <button
                          onClick={() => setSearchTerm("")}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    )}
                    {selectedCategory !== "all" && (
                      <span className="flex items-center gap-2">
                        Filter: {selectedCategory.replace("_", " ")}
                        <button
                          onClick={() => setSelectedCategory("all")}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation Policy Notice */}
          <div className="mb-8 bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-4 text-sm text-yellow-100">
            <p className="font-semibold text-yellow-200">Cancellation Policy</p>
            <p className="mt-1">
              If you decide to cancel after making a downpayment or full
              payment, only 20% of the total payment will be eligible for
              refund. Any amount paid beyond 20% is non-refundable.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-900/90 text-red-100 px-4 py-3 rounded-lg border border-red-700 flex items-center gap-2">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-300 hover:text-red-100"
              >
                ×
              </button>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="mb-6 flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-gray-300 text-sm">Booking Mode:</span>
            <button
              onClick={() => switchBookingMode("standard")}
              className={`px-3 py-1.5 rounded border text-sm ${
                bookingMode === "standard"
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Inventory + Artists
            </button>
            <button
              onClick={() => switchBookingMode("packages")}
              className={`px-3 py-1.5 rounded border text-sm ${
                bookingMode === "packages"
                  ? "bg-green-600 border-green-500 text-white"
                  : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Packages Only
            </button>
          </div>

          {/* Inventory Section (shown only in standard mode) */}
          {bookingMode === "standard" && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-blue-400" />
                  Musical Instruments & Equipment
                </h2>
                <span className="text-gray-400 text-sm">
                  {filteredInventory.length} items available
                </span>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                </div>
              ) : bookingMode !== "standard" ? (
                <div className="text-center py-12 text-gray-400">
                  Switch to "Inventory + Artists" mode to add instruments.
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 text-lg">
                    {searchTerm || selectedCategory !== "all"
                      ? "No items match your search criteria"
                      : "No inventory items available"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                  {filteredInventory.map((item) => (
                    <InventoryCard
                      key={item._id}
                      item={item}
                      availableQuantity={item.availableQuantity}
                      onAdd={(it, sourceId) =>
                        handleAddToCartClick(it, "inventory", sourceId)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Band Artists Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Music className="w-6 h-6 text-purple-400" />
                Band Artists & Musicians
              </h2>
              <span className="text-gray-400 text-sm">
                {filteredBandArtists.length} artists available
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              </div>
            ) : bookingMode !== "standard" && bookingMode !== "packages" ? (
              <div className="text-center py-12 text-gray-400">
                Switch mode to view artists.
              </div>
            ) : filteredBandArtists.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-lg">
                  {searchTerm || selectedCategory !== "all"
                    ? "No artists match your search criteria"
                    : "No band artists available"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredBandArtists.map((artist) => (
                  <ArtistCard
                    key={artist._id}
                    artist={artist}
                    onAdd={(a, sourceId) =>
                      handleAddToCartClick(a, "bandArtist", sourceId)
                    }
                    bookingDate={bookingData.bookingDate}
                    artistAvailability={artistAvailability}
                    checkingAvailability={checkingAvailability}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Packages Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Package className="w-6 h-6 text-green-400" />
                Service Packages
              </h2>
              <span className="text-gray-400 text-sm">
                {filteredPackages.length} packages available
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
              </div>
            ) : bookingMode !== "packages" ? (
              <div className="text-center py-12 text-gray-400">
                Switch to "Packages Only" mode to add packages.
              </div>
            ) : filteredPackages.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-lg">
                  {searchTerm || selectedCategory !== "all"
                    ? "No packages match your search criteria"
                    : "No packages available"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredPackages.map((pkg) => (
                  <PackagesCard
                    key={pkg._id}
                    pkg={pkg}
                    onAdd={(p, sourceId) =>
                      handleAddToCartClick(p, "package", sourceId)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fly thumbnails container */}
      {flyItems.map((f) => (
        <div key={f.id} style={f.style}>
          {f.src ? (
            <img
              src={f.src}
              alt="thumb"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div className="w-full h-full bg-gray-600 rounded-full" />
          )}
        </div>
      ))}

      {/* Cart Modal */}
      <CartModal
        showCart={showCart}
        setShowCart={setShowCart}
        cart={cart}
        updateCartQuantity={updateCartQuantity}
        removeFromCart={removeFromCart}
        getCartTotal={getCartTotal}
        clearCart={clearCart}
        setShowBookingModal={setShowBookingModal}
      />

      {/* Booking Modal */}
      <BookingModal
        showBookingModal={showBookingModal}
        setShowBookingModal={setShowBookingModal}
        cart={cart}
        getCartTotal={getCartTotal}
        bookingData={bookingData}
        handleBookingDataChange={handleBookingDataChange}
        handleBookingSubmit={handleBookingSubmit}
        bookingLoading={bookingLoading}
        bookingSuccess={bookingSuccess}
        setBookingSuccess={setBookingSuccess}
        artistAvailability={artistAvailability}
        checkArtistAvailability={checkArtistAvailability}
        userName={userData?.fullName || userData?.username || "Guest"}
        userEmail={userData?.email || ""}
        reservedDates={reservedDates}
      />

      {/* Calendar Modal */}
      {showCalendar && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCalendar(false)}
        >
          <div
            className="bg-[#30343c] rounded-lg p-6 max-w-7xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-400" />
                My Booking Calendar
              </h2>
              <button
                onClick={() => setShowCalendar(false)}
                className="text-gray-400 hover:text-white text-3xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            {/* Calendar Component */}
            <UserCalendar />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserHome;

// Floating thumbnails for fly-to-cart animation (portal-like inline)
// Rendered globally via a fixed container
