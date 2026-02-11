import Layout from "../../../components/Layout/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart3,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { API_BASE_URL } from "../../../config/api";
import SummaryReport from "../../../components/Reports/SummaryReport";
import BookingsReport from "../../../components/Reports/BookingsReport";
import InventoryReport from "../../../components/Reports/InventoryReport";
import PackagesReport from "../../../components/Reports/PackagesReport";
import RevenueReport from "../../../components/Reports/RevenueReport";
import EarningsReport from "../../../components/Reports/EarningsReport";
import DamageReport from "../../../components/Reports/DamageReport";

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
  const [damageData, setDamageData] = useState(null);
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
          case "damage":
            setDamageData(response.data.data);
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
    { id: "damage", label: "Damage Items", icon: AlertCircle },
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
            <SummaryReport data={summaryData} />
          )}

          {/* Booking Report */}
          {!loading && activeTab === "bookings" && bookingData && (
            <BookingsReport data={bookingData} />
          )}

          {/* Inventory Report */}
          {!loading && activeTab === "inventory" && inventoryData && (
            <InventoryReport data={inventoryData} />
          )}

          {/* Package Report */}
          {!loading && activeTab === "packages" && packageData && (
            <PackagesReport data={packageData} />
          )}

          {/* Revenue Report */}
          {!loading && activeTab === "revenue" && revenueData && (
            <RevenueReport data={revenueData} />
          )}

          {/* Earnings Report */}
          {!loading && activeTab === "earnings" && earningsData && (
            <EarningsReport data={earningsData} />
          )}

          {/* Damage Items Report */}
          {!loading && activeTab === "damage" && damageData && (
            <DamageReport data={damageData} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
