import Layout from "../../components/Layout/Layout";
import CartModal from "../../components/Modals/Users/CartModal";
import BookingModal from "../../components/Modals/Users/BookingModal";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import axios from "axios";

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
  const [bookingData, setBookingData] = useState({
    bookingDate: "",
    bookingTime: "",
    duration: 1,
    notes: "",
    contactInfo: {
      phone: "",
      email: "",
      address: "",
    },
    paymentMethod: "cash",
    paymentReference: "",
    paymentImage: null,
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      setUserData(JSON.parse(user));
    }

    // Fetch inventory and packages
    fetchData();
  }, []);

  // Refetch data after successful booking to reflect availability/quantities
  useEffect(() => {
    if (bookingSuccess) {
      fetchData();
    }
  }, [bookingSuccess]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryResponse, packagesResponse, bandArtistsResponse] =
        await Promise.all([
          axios.get("http://localhost:5000/api/inventory/public"),
          axios.get("http://localhost:5000/api/packages/public"),
          axios.get("http://localhost:5000/api/band-artists/public"),
        ]);

      setInventory(inventoryResponse.data.inventory || []);
      setPackages(packagesResponse.data.packages || []);
      setBandArtists(bandArtistsResponse.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search functions
  const filterItems = (items, type) => {
    let filtered = items;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      if (type === "inventory") {
        // For inventory, we could add categories later
        // For now, just filter by availability
        if (selectedCategory === "available") {
          filtered = filtered.filter((item) => item.quantity > 0);
        } else if (selectedCategory === "out_of_stock") {
          filtered = filtered.filter((item) => item.quantity === 0);
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

  const filteredInventory = filterItems(inventory, "inventory");
  const filteredPackages = filterItems(packages, "packages");
  const filteredBandArtists = filterItems(bandArtists, "bandArtists");

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("newest");
  };

  // Cart functions
  const addToCart = (item, type) => {
    const cartItem = {
      id: item._id,
      name: item.name,
      type: type,
      price: type === "bandArtist" ? item.booking_fee : item.price,
      quantity: 1,
      image: item.image,
      genre: item.genre,
      description: item.description,
    };

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.id === item._id && cartItem.type === type
      );

      if (existingItem) {
        // For inventory, increase quantity; for package/bandArtist, keep quantity at 1
        if (type === "inventory") {
          return prevCart.map((cartItem) =>
            cartItem.id === item._id && cartItem.type === type
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
        }
        return prevCart;
      } else {
        return [...prevCart, cartItem];
      }
    });
  };

  const removeFromCart = (itemId, type) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.id === itemId && item.type === type))
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

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId && item.type === type
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  // Booking functions
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      setError("Cart is empty. Please add items to book.");
      return;
    }

    if (!bookingData.bookingDate || !bookingData.bookingTime) {
      setError("Please select booking date and time.");
      return;
    }

    // Validate GCash payment requirements
    if (bookingData.paymentMethod === "gcash") {
      if (!bookingData.paymentReference || !bookingData.paymentImage) {
        setError(
          "Payment reference and image are required for GCash payments."
        );
        return;
      }
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
        bookingDate: bookingData.bookingDate,
        bookingTime: bookingData.bookingTime,
        duration: bookingData.duration,
        notes: bookingData.notes,
        contactInfo: bookingData.contactInfo,
        paymentMethod: bookingData.paymentMethod,
        paymentReference: bookingData.paymentReference,
        paymentImage: bookingData.paymentImage,
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
        setBookingData({
          bookingDate: "",
          bookingTime: "",
          duration: 1,
          notes: "",
          contactInfo: {
            phone: "",
            email: "",
            address: "",
          },
          paymentMethod: "cash",
          paymentReference: "",
          paymentImage: null,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBookingDataChange = (field, value) => {
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
      setBookingData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with user profile */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome to Harmony Hub
              </h1>
              {userData && (
                <div className="mb-4">
                  <p className="text-gray-300">
                    Welcome,{" "}
                    <span className="text-blue-400 font-semibold">
                      {userData.fullName || userData.username}
                    </span>
                  </p>
                  <p className="text-gray-400 text-sm">{userData.email}</p>
                </div>
              )}
            </div>

            {/* Cart and User Profile Section */}
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5 text-gray-300" />
                <span className="text-gray-300 font-medium">Cart</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>

              {/* User Profile Section */}
              {userData && (
                <div className="flex items-center space-x-3 bg-gray-800 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-300" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-300 font-medium text-sm">
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
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search instruments, packages, or services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 flex items-center gap-2 transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* Inventory Section */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredInventory.map((item) => (
                  <div
                    key={item._id}
                    className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-blue-500 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 group"
                  >
                    <div className="relative">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                          <ShoppingCart className="w-12 h-12 text-gray-500" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="bg-gray-800/80 hover:bg-gray-700/80 p-2 rounded-full">
                          <Heart className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      {item.quantity === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {item.name}
                      </h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-green-400 font-bold text-lg">
                          ₱{Number(item.price).toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {item.quantity} left
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addToCart(item, "inventory")}
                          disabled={item.quantity === 0}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                        >
                          {item.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                        </button>
                        <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBandArtists.map((artist) => (
                  <div
                    key={artist._id}
                    className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-purple-500 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 group"
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                          <Music className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg group-hover:text-purple-400 transition-colors">
                            {artist.name}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 text-purple-300 border border-purple-700">
                            {artist.genre}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-purple-400 font-bold text-xl">
                          ₱{Number(artist.booking_fee).toLocaleString()}
                        </span>
                        <div className="flex items-center text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="ml-1 text-sm">4.9</span>
                        </div>
                      </div>

                      {!artist.isAvailable && (
                        <div className="mb-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-300 border border-red-700">
                            Unavailable
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => addToCart(artist, "bandArtist")}
                        disabled={!artist.isAvailable}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded font-medium transition-colors"
                      >
                        {artist.isAvailable ? "Add to Cart" : "Unavailable"}
                      </button>
                    </div>
                  </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPackages.map((pkg) => (
                  <div
                    key={pkg._id}
                    className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-green-500 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 group"
                  >
                    <div className="relative">
                      {pkg.image ? (
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-500" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="bg-gray-800/80 hover:bg-gray-700/80 p-2 rounded-full">
                          <Heart className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      {!pkg.isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                            Unavailable
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-white mb-2 text-lg group-hover:text-green-400 transition-colors">
                        {pkg.name}
                      </h3>
                      {pkg.description && (
                        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                          {pkg.description}
                        </p>
                      )}

                      {/* Package Items */}
                      {pkg.items && pkg.items.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-gray-400 text-sm font-medium mb-2">
                            Includes:
                          </h4>
                          <div className="space-y-1">
                            {pkg.items.slice(0, 3).map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center text-sm text-gray-300"
                              >
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                                {item.inventoryItem?.name} (x{item.quantity})
                              </div>
                            ))}
                            {pkg.items.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{pkg.items.length - 3} more items
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-green-400 font-bold text-xl">
                          ₱{Number(pkg.price).toLocaleString()}
                        </span>
                        <div className="flex items-center text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="ml-1 text-sm">4.8</span>
                        </div>
                      </div>

                      <button
                        onClick={() => addToCart(pkg, "package")}
                        disabled={!pkg.isAvailable}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded font-medium transition-colors"
                      >
                        {pkg.isAvailable ? "Add to Cart" : "Unavailable"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
      />
    </Layout>
  );
};

export default UserHome;
