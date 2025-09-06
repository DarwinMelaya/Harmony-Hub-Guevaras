import Layout from "../components/Layout/Layout";
import { useState, useEffect } from "react";
import {
  User,
  ChevronDown,
  ShoppingCart,
  Package,
  Star,
  Heart,
  Eye,
} from "lucide-react";
import axios from "axios";

const HomePage = () => {
  const [userData, setUserData] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      setUserData(JSON.parse(user));
    }

    // Fetch inventory and packages
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryResponse, packagesResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/inventory/public"),
        axios.get("http://localhost:5000/api/packages/public"),
      ]);

      setInventory(inventoryResponse.data.inventory || []);
      setPackages(packagesResponse.data.packages || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with user profile */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Client Dashboard</h1>
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
                {inventory.length} items available
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
              </div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-lg">
                  No inventory items available
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {inventory.map((item) => (
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
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors">
                          Add to Cart
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

          {/* Packages Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Package className="w-6 h-6 text-green-400" />
                Service Packages
              </h2>
              <span className="text-gray-400 text-sm">
                {packages.length} packages available
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-lg">No packages available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
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

                      <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded font-medium transition-colors">
                        Book Package
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
