import Layout from "../../components/Layout/Layout";
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Package,
  Music,
  ShoppingCart,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Filter,
  Search,
  RefreshCw,
  AlertTriangle,
  FileText,
  Download,
} from "lucide-react";
import axios from "axios";
import CompletionModal from "../../components/Modals/Admin/CompletionModal";
import AdminSignatureModal from "../../components/Modals/Admin/AdminSignatureModal";
import BookingDetailsModal from "../../components/Modals/Admin/Booking/BookingDetailsModal";
import BookingCalendarModal from "../../components/Modals/Admin/Booking/BookingCalendarModal";
import RemainingBalanceModal from "../../components/Modals/Admin/Booking/RemainingBalanceModal";
import RemoveItemModal from "../../components/Modals/Admin/Booking/RemoveItemModal";
import CancellationModal from "../../components/Modals/Admin/Booking/CancellationModal";
import RefundProcessingModal from "../../components/Modals/Admin/Booking/RefundProcessingModal";
import ExtensionChargeModal from "../../components/Modals/Admin/Booking/ExtensionChargeModal";
import ExtensionPaymentModal from "../../components/Modals/Admin/Booking/ExtensionPaymentModal";
import AddItemModal from "../../components/Modals/Admin/Booking/AddItemModal";

const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionStep, setCompletionStep] = useState("confirm");
  const [issueType, setIssueType] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [downloadingAgreement, setDownloadingAgreement] = useState(null);
  const [showAdminSignModal, setShowAdminSignModal] = useState(false);
  const [signingBooking, setSigningBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundProof, setRefundProof] = useState("");
  const [refundProofPreview, setRefundProofPreview] = useState(null);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionTargetBooking, setExtensionTargetBooking] = useState(null);
  const [extensionForm, setExtensionForm] = useState({
    hours: "",
    rate: "",
    amount: "",
    paymentMethod: "cash",
    description: "",
  });
  const [savingExtension, setSavingExtension] = useState(false);
  const [showExtensionPaymentModal, setShowExtensionPaymentModal] =
    useState(false);
  const [selectedExtensionForPayment, setSelectedExtensionForPayment] =
    useState(null);
  const [extensionPaymentProof, setExtensionPaymentProof] = useState(null);
  const [processingExtensionPayment, setProcessingExtensionPayment] =
    useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [savingNewItem, setSavingNewItem] = useState(false);
  const [addItemTab, setAddItemTab] = useState("inventory"); // inventory | package | bandArtist
  const [inventoryOptions, setInventoryOptions] = useState([]);
  const [packageOptions, setPackageOptions] = useState([]);
  const [artistOptions, setArtistOptions] = useState([]);
  const [loadingAddOptions, setLoadingAddOptions] = useState(false);
  const [showRemoveItemModal, setShowRemoveItemModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  const canAdminSign =
    selectedBooking &&
    selectedBooking.paymentStatus === "submitted" &&
    selectedBooking.agreement &&
    selectedBooking.agreement.signature &&
    !selectedBooking.agreement.adminSignature;

  const hasIssues = (booking) => {
    return (
      booking.issueType &&
      booking.affectedItems &&
      booking.affectedItems.length > 0
    );
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const url =
        statusFilter === "all" || statusFilter === "with-issues"
          ? "http://localhost:5000/api/bookings"
          : `http://localhost:5000/api/bookings?status=${statusFilter}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        let bookingsData = response.data.data;

        // Filter for bookings with issues if needed
        if (statusFilter === "with-issues") {
          bookingsData = bookingsData.filter((booking) => hasIssues(booking));
        }

        setBookings(bookingsData);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  // Map bookings to schedules by date string for the calendar component
  const schedulesByDate = bookings.reduce((acc, booking) => {
    const date = new Date(booking.bookingDate);
    const dateKey = date.toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    // Compose schedule object expected by AdminCalendar
    acc[dateKey].push({
      id: booking._id,
      event_name: booking.items?.map((i) => i.name).join(", ") || "Booking",
      department: booking.user?.fullName || booking.user?.username || "User",
      start_time: booking.bookingTime,
      completed: booking.status === "completed",
      status: booking.status, // Add status for color coding
      venues: { name: "Booking" },
    });
    return acc;
  }, {});

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const syncBookingState = (updatedBooking) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking._id === updatedBooking._id ? updatedBooking : booking
      )
    );
    setSelectedBooking((prevSelected) =>
      prevSelected && prevSelected._id === updatedBooking._id
        ? updatedBooking
        : prevSelected
    );
  };

  const fetchAddItemOptions = async (type) => {
    try {
      setLoadingAddOptions(true);
      const token = localStorage.getItem("token");

      if (type === "inventory") {
        const res = await axios.get("http://localhost:5000/api/inventory", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInventoryOptions(res.data.inventory || []);
      } else if (type === "package") {
        const res = await axios.get("http://localhost:5000/api/packages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPackageOptions(res.data || []);
      } else if (type === "bandArtist") {
        const res = await axios.get("http://localhost:5000/api/users/artists", {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 100 },
        });
        setArtistOptions(res.data.data || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load items for adding"
      );
    } finally {
      setLoadingAddOptions(false);
    }
  };

  const quickAddItemToBooking = async (sourceItem, type) => {
    if (!selectedBooking?._id || !sourceItem?._id) return;

    let payloadItem = null;

    if (type === "inventory") {
      payloadItem = {
        type: "inventory",
        itemId: sourceItem._id,
        name: sourceItem.name,
        quantity: 1,
        price: Number(sourceItem.price) || 0,
      };
    } else if (type === "package") {
      payloadItem = {
        type: "package",
        itemId: sourceItem._id,
        name: sourceItem.name,
        quantity: 1,
        price: Number(sourceItem.price) || 0,
      };
    } else if (type === "bandArtist") {
      payloadItem = {
        type: "bandArtist",
        itemId: sourceItem._id,
        name: sourceItem.fullName || sourceItem.name,
        quantity: 1,
        price: Number(sourceItem.booking_fee) || 0,
      };
    }

    if (!payloadItem || !payloadItem.price || payloadItem.price <= 0) {
      setError("Selected item has invalid price configuration.");
      return;
    }

    try {
      setSavingNewItem(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/bookings/${selectedBooking._id}/items`,
        { items: [payloadItem] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        syncBookingState(response.data.data);
        // Refresh options list so quantities / availability update in the UI
        await fetchAddItemOptions(type);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to add item to booking"
      );
    } finally {
      setSavingNewItem(false);
    }
  };

  const openAddItemModal = (booking) => {
    setSelectedBooking(booking);
    setAddItemTab("inventory");
    setShowAddItemModal(true);
    fetchAddItemOptions("inventory");
  };

  const closeAddItemModal = () => {
    setShowAddItemModal(false);
    setSavingNewItem(false);
  };

  const handleMonthChange = (forward) => {
    let month = calendarMonth + (forward ? 1 : -1);
    let year = calendarYear;
    if (month > 11) {
      month = 0;
      year += 1;
    } else if (month < 0) {
      month = 11;
      year -= 1;
    }
    setCalendarMonth(month);
    setCalendarYear(year);
  };

  const handleDateClick = () => {};
  const handleScheduleClick = (e, schedule) => {
    e.stopPropagation();
    const booking = bookings.find((b) => b._id === schedule.id);
    if (booking) {
      setSelectedBooking(booking);
      setShowDetailsModal(true);
      setShowCalendar(false);
    }
  };

  const updateBookingStatus = async (
    bookingId,
    newStatus,
    issueData = {},
    cancellationReason = ""
  ) => {
    try {
      setUpdatingStatus(bookingId);
      const token = localStorage.getItem("token");

      const body = {
        status: newStatus,
        issueType: issueData.issueType || null,
        affectedItems: issueData.affectedItems || [],
      };

      // Add cancellation reason if cancelling
      if (newStatus === "cancelled" && cancellationReason) {
        body.cancellationReason = cancellationReason;
      }

      const response = await axios.patch(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        syncBookingState(response.data.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update booking status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "refunded":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "refunded":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPaymentStatusMeta = (status) => {
    switch (status) {
      case "awaiting_selection":
        return {
          label: "Awaiting customer payment selection",
          classes: "bg-yellow-900/40 text-yellow-200 border-yellow-600/40",
        };
      case "submitted":
        return {
          label: "Payment submitted (awaiting review)",
          classes: "bg-blue-900/40 text-blue-200 border-blue-600/40",
        };
      case "verified":
        return {
          label: "Payment verified",
          classes: "bg-green-900/40 text-green-200 border-green-600/40",
        };
      case "awaiting_confirmation":
      default:
        return {
          label: "Pending admin confirmation",
          classes: "bg-gray-700 text-gray-300 border-gray-600",
        };
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case "inventory":
        return <ShoppingCart className="w-4 h-4" />;
      case "package":
        return <Package className="w-4 h-4" />;
      case "bandArtist":
        return <Music className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getIssueIcon = (issueType) => {
    switch (issueType) {
      case "lost":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "damaged":
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.user?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleMarkAsCompleted = (booking) => {
    setSelectedBooking(booking);

    // Check if there's a remaining balance
    if (booking.remainingBalance && booking.remainingBalance > 0) {
      setShowBalanceModal(true);
      setBalanceAmount("");
    } else {
      setShowCompleteModal(true);
      setCompletionStep("confirm");
      setIssueType("");
      setSelectedItems([]);
    }
  };

  const handleBalanceSubmit = () => {
    const enteredAmount = parseFloat(balanceAmount);
    const expectedBalance = selectedBooking.remainingBalance;

    if (!balanceAmount || isNaN(enteredAmount)) {
      alert("Please enter a valid amount");
      return;
    }

    if (enteredAmount !== expectedBalance) {
      alert(
        `Please enter the exact remaining balance amount: ₱${expectedBalance.toLocaleString()}`
      );
      return;
    }

    // Close balance modal and open completion modal
    setShowBalanceModal(false);
    setShowCompleteModal(true);
    setCompletionStep("confirm");
    setIssueType("");
    setSelectedItems([]);
  };

  const handleCompletionSubmit = (issueData = {}) => {
    if (completionStep === "confirm") {
      updateBookingStatus(selectedBooking._id, "completed");
      setShowCompleteModal(false);
    } else if (completionStep === "details") {
      updateBookingStatus(selectedBooking._id, "completed", issueData);
      setShowCompleteModal(false);
    }
  };

  const handleConfirmRemoveItem = async () => {
    if (!selectedBooking?._id || !itemToRemove?._id) {
      setShowRemoveItemModal(false);
      setItemToRemove(null);
      return;
    }

    try {
      setSavingNewItem(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5000/api/bookings/${selectedBooking._id}/items/${itemToRemove._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        syncBookingState(response.data.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to remove item from booking"
      );
    } finally {
      setSavingNewItem(false);
      setShowRemoveItemModal(false);
      setItemToRemove(null);
    }
  };

  const handleDownloadAgreement = async (bookingId) => {
    try {
      setDownloadingAgreement(bookingId);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/bookings/${bookingId}/agreement/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `booking-agreement-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to download agreement"
      );
    } finally {
      setDownloadingAgreement(null);
    }
  };

  const handleAdminSign = async (signatureData) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `http://localhost:5000/api/bookings/${signingBooking._id}/agreement/admin-sign`,
        signatureData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        syncBookingState(response.data.data);
        setShowAdminSignModal(false);
        setSigningBooking(null);
      }
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to sign agreement"
      );
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedBooking) return;

    // For GCash, require refund proof
    if (selectedBooking.paymentMethod === "gcash" && !refundProof) {
      setError("Please upload refund proof for GCash refunds");
      return;
    }

    try {
      setProcessingRefund(true);
      setError(null);
      const token = localStorage.getItem("token");

      const body = {};
      if (selectedBooking.paymentMethod === "gcash") {
        body.refundProof = refundProof;
      }

      const response = await axios.patch(
        `http://localhost:5000/api/bookings/${selectedBooking._id}/refund/process`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        syncBookingState(response.data.data);
        setShowRefundModal(false);
        setRefundProof("");
        setRefundProofPreview(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to process refund"
      );
    } finally {
      setProcessingRefund(false);
    }
  };

  const openExtensionModal = (booking) => {
    setExtensionTargetBooking(booking);
    setExtensionForm({
      hours: "",
      rate: "",
      amount: "",
      paymentMethod: booking?.paymentMethod === "gcash" ? "gcash" : "cash",
      description: "",
    });
    setShowExtensionModal(true);
  };

  const closeExtensionModal = () => {
    setShowExtensionModal(false);
    setExtensionTargetBooking(null);
    setExtensionForm({
      hours: "",
      rate: "",
      amount: "",
      paymentMethod: "cash",
      description: "",
    });
    setSavingExtension(false);
  };

  const handleExtensionFieldChange = (field, value) => {
    setExtensionForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submitExtensionCharge = async () => {
    if (!extensionTargetBooking?._id) return;
    try {
      setSavingExtension(true);
      setError(null);
      const token = localStorage.getItem("token");
      const payload = {
        description: extensionForm.description?.trim() || undefined,
        paymentMethod: extensionForm.paymentMethod,
      };
      if (extensionForm.hours) payload.hours = Number(extensionForm.hours);
      if (extensionForm.rate) payload.rate = Number(extensionForm.rate);
      if (extensionForm.amount) payload.amount = Number(extensionForm.amount);

      const response = await axios.post(
        `http://localhost:5000/api/bookings/${extensionTargetBooking._id}/extensions`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        syncBookingState(response.data.data);
        closeExtensionModal();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to add extension charge"
      );
    } finally {
      setSavingExtension(false);
    }
  };

  const openExtensionPaymentModal = (booking, extension) => {
    setSelectedExtensionForPayment({
      bookingId: booking?._id,
      extension,
    });
    setExtensionPaymentProof(null);
    setShowExtensionPaymentModal(true);
  };

  const closeExtensionPaymentModal = () => {
    setShowExtensionPaymentModal(false);
    setSelectedExtensionForPayment(null);
    setExtensionPaymentProof(null);
    setProcessingExtensionPayment(false);
  };

  const handleExtensionProofChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setExtensionPaymentProof(base64);
    } catch (readErr) {
      setError("Failed to read payment proof file.");
    }
  };

  const confirmExtensionPayment = async () => {
    if (
      !selectedExtensionForPayment?.bookingId ||
      !selectedExtensionForPayment.extension?._id
    ) {
      return;
    }
    if (
      selectedExtensionForPayment.extension.paymentMethod === "gcash" &&
      !extensionPaymentProof
    ) {
      setError("Please upload a payment proof for GCash extensions.");
      return;
    }
    try {
      setProcessingExtensionPayment(true);
      setError(null);
      const token = localStorage.getItem("token");
      const body = {};
      if (extensionPaymentProof) {
        body.paymentProof = extensionPaymentProof;
      }
      const response = await axios.patch(
        `http://localhost:5000/api/bookings/${selectedExtensionForPayment.bookingId}/extensions/${selectedExtensionForPayment.extension._id}/pay`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        syncBookingState(response.data.data);
        closeExtensionPaymentModal();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to mark extension as paid"
      );
    } finally {
      setProcessingExtensionPayment(false);
    }
  };

  const handleRefundProofChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setRefundProof(reader.result);
      setRefundProofPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Booking Management</h1>
              <p className="text-gray-400">
                Manage all customer bookings and reservations
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCalendar(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </button>
              <button
                onClick={fetchBookings}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, or item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                  <option value="with-issues">With Issues</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-900/90 text-red-100 px-4 py-3 rounded-lg border border-red-700 flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-300 hover:text-red-100"
              >
                ×
              </button>
            </div>
          )}

          {/* Bookings Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-lg">
                  {searchTerm || statusFilter !== "all"
                    ? "No bookings match your search criteria"
                    : "No bookings found"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                        Items
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                        Setup Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredBookings.map((booking) => (
                      <tr
                        key={booking._id}
                        className="hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-300" />
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {booking.user?.fullName ||
                                  booking.user?.username}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {booking.user?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {booking.items.slice(0, 2).map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2 text-sm"
                              >
                                {getItemIcon(item.type)}
                                <span className="text-gray-300">
                                  {item.name} x{item.quantity}
                                </span>
                              </div>
                            ))}
                            {booking.items.length > 2 && (
                              <p className="text-gray-500 text-xs">
                                +{booking.items.length - 2} more items
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">
                              {formatDate(booking.bookingDate)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm mt-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">
                              {formatTime(booking.bookingTime)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="w-4 h-4 text-purple-400" />
                            <span className="text-gray-300">
                              {booking.setupDate
                                ? formatDate(booking.setupDate)
                                : "-"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm mt-1">
                            <Clock className="w-4 h-4 text-purple-400" />
                            <span className="text-gray-400">
                              {booking.setupTime || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-green-400 font-bold text-lg">
                            ₱{Number(booking.totalAmount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize">
                                {booking.status}
                              </span>
                            </span>
                            {hasIssues(booking) && (
                              <div
                                className="flex items-center space-x-1"
                                title={`${booking.issueType} items reported`}
                              >
                                {getIssueIcon(booking.issueType)}
                                <span className="text-xs text-red-400 font-medium">
                                  {booking.issueType}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowDetailsModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">View Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        selectedBooking={selectedBooking}
        canAdminSign={canAdminSign}
        downloadingAgreement={downloadingAgreement}
        onDownloadAgreement={handleDownloadAgreement}
        onSignAsAdmin={() => {
          if (canAdminSign) {
            setSigningBooking(selectedBooking);
            setShowAdminSignModal(true);
          }
        }}
        onOpenExtensionModal={openExtensionModal}
        onOpenExtensionPaymentModal={openExtensionPaymentModal}
        onOpenAddItemModal={openAddItemModal}
        onRemoveItem={(item) => {
          setItemToRemove(item);
          setShowRemoveItemModal(true);
        }}
        onOpenCancelModal={() => {
          setShowCancelModal(true);
          setCancellationReason("");
        }}
        onOpenRefundModal={() => {
          setShowRefundModal(true);
          setRefundProof("");
          setRefundProofPreview(null);
          setError(null);
        }}
        onConfirmBooking={() => {
          updateBookingStatus(selectedBooking._id, "confirmed");
          setShowDetailsModal(false);
        }}
        onMarkAsCompleted={() => {
          setShowDetailsModal(false);
          handleMarkAsCompleted(selectedBooking);
        }}
        updatingStatus={updatingStatus}
      />

      {/* Calendar Modal */}
      <BookingCalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        bookings={bookings}
        calendarMonth={calendarMonth}
        calendarYear={calendarYear}
        onMonthChange={handleMonthChange}
        onScheduleClick={(e, schedule) => {
          e.stopPropagation();
          const booking = bookings.find((b) => b._id === schedule.id);
          if (booking) {
            setSelectedBooking(booking);
            setShowDetailsModal(true);
            setShowCalendar(false);
          }
        }}
      />

      {/* Remaining Balance Modal */}
      <RemainingBalanceModal
        isOpen={showBalanceModal}
        onClose={() => {
          setShowBalanceModal(false);
          setBalanceAmount("");
        }}
        selectedBooking={selectedBooking}
        balanceAmount={balanceAmount}
        onBalanceAmountChange={setBalanceAmount}
        onSubmit={handleBalanceSubmit}
      />

      {/* Remove Item Modal */}
      <RemoveItemModal
        isOpen={showRemoveItemModal}
        onClose={() => {
          setShowRemoveItemModal(false);
          setItemToRemove(null);
        }}
        itemToRemove={itemToRemove}
        onConfirm={handleConfirmRemoveItem}
        isRemoving={savingNewItem}
      />

      {/* Cancellation Modal */}
      <CancellationModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancellationReason("");
          setError(null);
        }}
        selectedBooking={selectedBooking}
        cancellationReason={cancellationReason}
        onCancellationReasonChange={setCancellationReason}
        onConfirm={async () => {
          if (!cancellationReason.trim()) {
            setError("Please provide a reason for cancellation");
            return;
          }
          await updateBookingStatus(
            selectedBooking._id,
            "cancelled",
            {},
            cancellationReason.trim()
          );
          setShowCancelModal(false);
          setShowDetailsModal(false);
          setCancellationReason("");
        }}
        isCancelling={updatingStatus === selectedBooking?._id}
        error={error}
      />

      {/* Refund Processing Modal */}
      <RefundProcessingModal
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          setRefundProof("");
          setRefundProofPreview(null);
          setError(null);
        }}
        selectedBooking={selectedBooking}
        refundProof={refundProof}
        refundProofPreview={refundProofPreview}
        onRefundProofChange={handleRefundProofChange}
        onProcess={handleProcessRefund}
        isProcessing={processingRefund}
        error={error}
      />

      {/* Extension Charge Modal */}
      <ExtensionChargeModal
        isOpen={showExtensionModal}
        onClose={closeExtensionModal}
        extensionForm={extensionForm}
        onFieldChange={handleExtensionFieldChange}
        onSubmit={submitExtensionCharge}
        isSaving={savingExtension}
      />

      {/* Extension Payment Modal */}
      <ExtensionPaymentModal
        isOpen={showExtensionPaymentModal}
        onClose={closeExtensionPaymentModal}
        selectedExtension={selectedExtensionForPayment}
        extensionPaymentProof={extensionPaymentProof}
        onProofChange={handleExtensionProofChange}
        onConfirm={confirmExtensionPayment}
        isProcessing={processingExtensionPayment}
        error={error}
      />

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddItemModal}
        onClose={closeAddItemModal}
        selectedBooking={selectedBooking}
        addItemTab={addItemTab}
        onTabChange={(tab) => {
          setAddItemTab(tab);
          if (tab === "inventory" && inventoryOptions.length === 0)
            fetchAddItemOptions("inventory");
          if (tab === "package" && packageOptions.length === 0)
            fetchAddItemOptions("package");
          if (tab === "bandArtist" && artistOptions.length === 0)
            fetchAddItemOptions("bandArtist");
        }}
        inventoryOptions={inventoryOptions}
        packageOptions={packageOptions}
        artistOptions={artistOptions}
        loadingAddOptions={loadingAddOptions}
        onAddItem={quickAddItemToBooking}
        isSaving={savingNewItem}
      />

      {/* Completion Modal */}
      <CompletionModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        selectedBooking={selectedBooking}
        onCompletionSubmit={handleCompletionSubmit}
        completionStep={completionStep}
        setCompletionStep={setCompletionStep}
        issueType={issueType}
        setIssueType={setIssueType}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      />

      {/* Admin Signature Modal */}
      <AdminSignatureModal
        isOpen={showAdminSignModal}
        onClose={() => {
          setShowAdminSignModal(false);
          setSigningBooking(null);
        }}
        booking={signingBooking}
        onSign={handleAdminSign}
      />
    </Layout>
  );
};

export default Booking;
