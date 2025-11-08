import Layout from "../../../components/Layout/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart3,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
} from "lucide-react";
import { API_BASE_URL } from "../../../config/api";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Report data states
  const [summaryData, setSummaryData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [packageData, setPackageData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    paymentMethod: "",
    role: "",
    isActive: "",
    filterBy: "month", // For earnings: day, month, or year
  });

  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab, filters]);

  const fetchReport = async (reportType) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      let url = `${API_BASE_URL}/reports/${reportType}`;
      const params = new URLSearchParams();

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.status) params.append("status", filters.status);
      if (filters.paymentMethod)
        params.append("paymentMethod", filters.paymentMethod);
      if (filters.role) params.append("role", filters.role);
      if (filters.isActive !== "") params.append("isActive", filters.isActive);
      if (filters.filterBy) params.append("filterBy", filters.filterBy);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        switch (reportType) {
          case "summary":
            setSummaryData(response.data.data);
            break;
          case "bookings":
            setBookingData(response.data.data);
            break;
          case "inventory":
            setInventoryData(response.data.data);
            break;
          case "packages":
            setPackageData(response.data.data);
            break;
          case "revenue":
            setRevenueData(response.data.data);
            break;
          case "earnings":
            setEarningsData(response.data.data);
            break;
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch report");
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDownloadPDF = async (reportType) => {
    try {
      setDownloadingPDF(true);
      setError(null);
      const token = localStorage.getItem("token");

      let url = `${API_BASE_URL}/reports/${reportType}/pdf`;
      const params = new URLSearchParams();

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.status) params.append("status", filters.status);
      if (filters.paymentMethod)
        params.append("paymentMethod", filters.paymentMethod);
      if (filters.role) params.append("role", filters.role);
      if (filters.isActive !== "") params.append("isActive", filters.isActive);
      if (filters.filterBy) params.append("filterBy", filters.filterBy);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      // Create blob and download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url_blob = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url_blob;
      link.download = `${reportType}-report-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url_blob);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to download PDF");
      console.error("Error downloading PDF:", err);
    } finally {
      setDownloadingPDF(false);
    }
  };

  const tabs = [
    { id: "summary", label: "Summary", icon: BarChart3 },
    { id: "bookings", label: "Bookings", icon: ShoppingCart },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "packages", label: "Packages", icon: Package },
    { id: "revenue", label: "Revenue", icon: DollarSign },
    { id: "earnings", label: "Earnings", icon: TrendingUp },
  ];

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
              <p className="text-gray-400">View and analyze system data</p>
            </div>
            <button
              onClick={() => handleDownloadPDF(activeTab)}
              disabled={downloadingPDF || loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {downloadingPDF ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF
                </>
              )}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-orange-500 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              {activeTab === "bookings" && (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="">All</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={filters.paymentMethod}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          paymentMethod: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="">All</option>
                      <option value="cash">Cash</option>
                      <option value="gcash">GCash</option>
                    </select>
                  </div>
                </>
              )}
              {activeTab === "earnings" && (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Filter By
                    </label>
                    <select
                      value={filters.filterBy}
                      onChange={(e) =>
                        setFilters({ ...filters, filterBy: e.target.value })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="day">Day</option>
                      <option value="month">Month</option>
                      <option value="year">Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={filters.paymentMethod}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          paymentMethod: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="">All</option>
                      <option value="cash">Cash</option>
                      <option value="gcash">GCash</option>
                    </select>
                  </div>
                </>
              )}
              <div className="flex items-end">
                <button
                  onClick={() => fetchReport(activeTab)}
                  className="w-full bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-4" />
              <p className="text-gray-400">Loading report...</p>
            </div>
          )}

          {/* Summary Report */}
          {!loading && activeTab === "summary" && summaryData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-400 text-sm">Total Bookings</h3>
                    <ShoppingCart className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-3xl font-bold">
                    {summaryData.summary.totalBookings}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-400 text-sm">Total Users</h3>
                    <User className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold">
                    {summaryData.summary.totalUsers}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-400 text-sm">Total Revenue</h3>
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">
                    {formatCurrency(summaryData.revenue.totalRevenue)}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-400 text-sm">Inventory Items</h3>
                    <Package className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-3xl font-bold">
                    {summaryData.summary.totalInventory}
                  </p>
                </div>
              </div>

              {/* Bookings by Status */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Bookings by Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {summaryData.bookings.byStatus.map((item) => (
                    <div key={item._id} className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1 capitalize">
                        {item._id}
                      </p>
                      <p className="text-2xl font-bold">{item.count}</p>
                      <p className="text-gray-500 text-sm">
                        {formatCurrency(item.totalRevenue)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Users by Role */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Users by Role</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {summaryData.users.byRole.map((item) => (
                    <div key={item._id} className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1 capitalize">
                        {item._id}
                      </p>
                      <p className="text-2xl font-bold">{item.count}</p>
                      <p className="text-gray-500 text-sm">
                        {item.active} active, {item.inactive} inactive
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Bookings</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-2">User</th>
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryData.bookings.recent.map((booking) => (
                        <tr
                          key={booking._id}
                          className="border-b border-gray-700"
                        >
                          <td className="p-2">
                            {booking.user?.fullName || "N/A"}
                          </td>
                          <td className="p-2">
                            {formatCurrency(booking.totalAmount)}
                          </td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                booking.status === "completed"
                                  ? "bg-green-500/20 text-green-400"
                                  : booking.status === "confirmed"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : booking.status === "pending"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="p-2">
                            {formatDate(booking.bookingDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Booking Report */}
          {!loading && activeTab === "bookings" && bookingData && (
            <div className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">Total Bookings</h3>
                  <p className="text-3xl font-bold">
                    {bookingData.statistics.totalBookings}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold">
                    {formatCurrency(bookingData.statistics.totalRevenue)}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">
                    Average Booking Value
                  </h3>
                  <p className="text-3xl font-bold">
                    {formatCurrency(bookingData.statistics.averageBookingValue)}
                  </p>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">All Bookings</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-2">User</th>
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Booking Date</th>
                        <th className="text-left p-2">Payment Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingData.bookings.map((booking) => (
                        <tr
                          key={booking._id}
                          className="border-b border-gray-700"
                        >
                          <td className="p-2">
                            {booking.user?.fullName || "N/A"}
                          </td>
                          <td className="p-2">
                            {formatCurrency(booking.totalAmount)}
                          </td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                booking.status === "completed"
                                  ? "bg-green-500/20 text-green-400"
                                  : booking.status === "confirmed"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : booking.status === "pending"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="p-2">
                            {formatDate(booking.bookingDate)}
                          </td>
                          <td className="p-2 capitalize">
                            {booking.paymentMethod}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Report */}
          {!loading && activeTab === "inventory" && inventoryData && (
            <div className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">Total Items</h3>
                  <p className="text-3xl font-bold">
                    {inventoryData.statistics.totalItems}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">Total Quantity</h3>
                  <p className="text-3xl font-bold">
                    {inventoryData.statistics.totalQuantity}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">Total Value</h3>
                  <p className="text-3xl font-bold">
                    {formatCurrency(inventoryData.statistics.totalValue)}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">
                    Items Needing Maintenance
                  </h3>
                  <p className="text-3xl font-bold text-yellow-400">
                    {inventoryData.maintenance.itemsNeedingMaintenance
                      ?.length || 0}
                  </p>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">
                  All Inventory Items
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Quantity</th>
                        <th className="text-left p-2">Price</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Condition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryData.inventory.map((item) => (
                        <tr key={item._id} className="border-b border-gray-700">
                          <td className="p-2">{item.name}</td>
                          <td className="p-2">{item.quantity}</td>
                          <td className="p-2">{formatCurrency(item.price)}</td>
                          <td className="p-2">
                            <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 capitalize">
                              {item.status}
                            </span>
                          </td>
                          <td className="p-2">
                            <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400 capitalize">
                              {item.condition}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Package Report */}
          {!loading && activeTab === "packages" && packageData && (
            <div className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">Total Packages</h3>
                  <p className="text-3xl font-bold">
                    {packageData.statistics.totalPackages}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">Available</h3>
                  <p className="text-3xl font-bold text-green-400">
                    {packageData.statistics.availablePackages}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">Unavailable</h3>
                  <p className="text-3xl font-bold text-red-400">
                    {packageData.statistics.unavailablePackages}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">Average Price</h3>
                  <p className="text-3xl font-bold">
                    {formatCurrency(packageData.statistics.averagePrice)}
                  </p>
                </div>
              </div>

              {/* Packages Table */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">All Packages</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Price</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Items Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packageData.packages.map((pkg) => (
                        <tr key={pkg._id} className="border-b border-gray-700">
                          <td className="p-2">{pkg.name}</td>
                          <td className="p-2">{formatCurrency(pkg.price)}</td>
                          <td className="p-2">
                            {pkg.isAvailable ? (
                              <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                                Available
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">
                                Unavailable
                              </span>
                            )}
                          </td>
                          <td className="p-2">{pkg.items?.length || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Report */}
          {!loading && activeTab === "revenue" && revenueData && (
            <div className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold text-green-400">
                    {formatCurrency(revenueData.statistics.totalRevenue)}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">
                    Total Downpayment
                  </h3>
                  <p className="text-3xl font-bold">
                    {formatCurrency(revenueData.statistics.totalDownpayment)}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">
                    Remaining Balance
                  </h3>
                  <p className="text-3xl font-bold text-yellow-400">
                    {formatCurrency(
                      revenueData.statistics.totalRemainingBalance
                    )}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">
                    Average Booking Value
                  </h3>
                  <p className="text-3xl font-bold">
                    {formatCurrency(revenueData.statistics.averageBookingValue)}
                  </p>
                </div>
              </div>

              {/* Revenue by Payment Method */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Revenue by Payment Method
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {revenueData.byPaymentMethod.map((item) => (
                    <div key={item._id} className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1 capitalize">
                        {item._id}
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(item.totalRevenue)}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {item.bookingCount} bookings
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue by Month */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Revenue by Month</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-2">Month</th>
                        <th className="text-left p-2">Revenue</th>
                        <th className="text-left p-2">Bookings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueData.byMonth.map((item) => (
                        <tr
                          key={`${item._id.year}-${item._id.month}`}
                          className="border-b border-gray-700"
                        >
                          <td className="p-2">
                            {new Date(
                              item._id.year,
                              item._id.month - 1
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-2">
                            {formatCurrency(item.totalRevenue)}
                          </td>
                          <td className="p-2">{item.bookingCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Earnings Report */}
          {!loading && activeTab === "earnings" && earningsData && (
            <div className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">Total Earnings</h3>
                  <p className="text-3xl font-bold text-green-400">
                    {formatCurrency(earningsData.statistics.totalEarnings)}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">
                    Total Downpayment
                  </h3>
                  <p className="text-3xl font-bold">
                    {formatCurrency(earningsData.statistics.totalDownpayment)}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">
                    Remaining Balance
                  </h3>
                  <p className="text-3xl font-bold text-yellow-400">
                    {formatCurrency(
                      earningsData.statistics.totalRemainingBalance
                    )}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-gray-400 text-sm mb-2">
                    Average Booking Value
                  </h3>
                  <p className="text-3xl font-bold">
                    {formatCurrency(
                      earningsData.statistics.averageBookingValue
                    )}
                  </p>
                </div>
              </div>

              {/* Earnings by Payment Method */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Earnings by Payment Method
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {earningsData.byPaymentMethod.map((item) => (
                    <div key={item._id} className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1 capitalize">
                        {item._id}
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(item.totalEarnings)}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {item.bookingCount} bookings
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Earnings by Period */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Earnings by{" "}
                  {earningsData.filterBy === "day"
                    ? "Day"
                    : earningsData.filterBy === "month"
                    ? "Month"
                    : "Year"}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-2">
                          {earningsData.filterBy === "day"
                            ? "Day"
                            : earningsData.filterBy === "month"
                            ? "Month"
                            : "Year"}
                        </th>
                        <th className="text-left p-2">Earnings</th>
                        <th className="text-left p-2">Bookings</th>
                        <th className="text-left p-2">Downpayment</th>
                        <th className="text-left p-2">Remaining Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earningsData.byPeriod.map((item, index) => {
                        let periodName = "";
                        if (earningsData.filterBy === "day") {
                          periodName = new Date(
                            item._id.year,
                            item._id.month - 1,
                            item._id.day
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          });
                        } else if (earningsData.filterBy === "month") {
                          periodName = new Date(
                            item._id.year,
                            item._id.month - 1
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          });
                        } else {
                          periodName = item._id.year.toString();
                        }

                        return (
                          <tr key={index} className="border-b border-gray-700">
                            <td className="p-2">{periodName}</td>
                            <td className="p-2">
                              {formatCurrency(item.totalEarnings)}
                            </td>
                            <td className="p-2">{item.bookingCount}</td>
                            <td className="p-2">
                              {formatCurrency(item.totalDownpayment)}
                            </td>
                            <td className="p-2">
                              {formatCurrency(item.totalRemainingBalance)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
