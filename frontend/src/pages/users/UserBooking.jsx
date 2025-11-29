import Layout from "../../components/Layout/Layout";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FileText, Download } from "lucide-react";
import BookingAgreement from "../../components/Agreement/BookingAgreement";

const statusClasses = {
  pending: "bg-yellow-900/40 text-yellow-300 border border-yellow-700",
  confirmed: "bg-blue-900/40 text-blue-300 border border-blue-700",
  completed: "bg-green-900/40 text-green-300 border border-green-700",
  cancelled: "bg-red-900/40 text-red-300 border border-red-700",
  refunded: "bg-purple-900/40 text-purple-300 border border-purple-700",
};

const paymentStatusMeta = {
  awaiting_confirmation: {
    label: "Waiting for admin confirmation",
    className: "bg-gray-700 text-gray-300",
  },
  awaiting_selection: {
    label: "Awaiting payment selection",
    className: "bg-yellow-900/40 text-yellow-200 border border-yellow-600/60",
  },
  submitted: {
    label: "Payment submitted",
    className: "bg-blue-900/40 text-blue-200 border border-blue-700/60",
  },
  verified: {
    label: "Payment verified",
    className: "bg-green-900/40 text-green-200 border border-green-700/60",
  },
};

const DOWNPAYMENT_PRESETS = [20, 30, 50, 100];

const UserBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [downloadingAgreement, setDownloadingAgreement] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] =
    useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] =
    useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: "cash",
    downpaymentType: "percentage",
    downpaymentPercentage: 50,
    paymentReference: "",
    paymentImage: null,
  });
  const [paymentProofPreview, setPaymentProofPreview] = useState(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showAgreement, setShowAgreement] = useState(false);
  const [pendingPaymentPayload, setPendingPaymentPayload] = useState(null);
  const [paymentInfos, setPaymentInfos] = useState([]);
  const [paymentInfoError, setPaymentInfoError] = useState(null);
  const [copiedPaymentId, setCopiedPaymentId] = useState(null);

  const totalAmountForSelection = Number(
    selectedBookingForPayment?.totalAmount || 0
  );
  const downpaymentPercentageValueRaw =
    paymentForm.downpaymentType === "full"
      ? 100
      : Number(paymentForm.downpaymentPercentage);
  const downpaymentPercentageValue =
    Number.isFinite(downpaymentPercentageValueRaw) &&
    downpaymentPercentageValueRaw > 0
      ? Math.min(downpaymentPercentageValueRaw, 100)
      : 50;
  const downpaymentAmount = Math.round(
    (totalAmountForSelection * downpaymentPercentageValue) / 100
  );
  const remainingBalance = Math.max(
    totalAmountForSelection - downpaymentAmount,
    0
  );
  const fetchPaymentInfos = useCallback(async () => {
    try {
      setPaymentInfoError(null);
      const response = await axios.get(
        "http://localhost:5000/api/payment-info/public"
      );
      setPaymentInfos(response.data?.data || []);
    } catch (err) {
      console.error("Failed to load payment info:", err);
      setPaymentInfoError("Unable to load official GCash details right now.");
    }
  }, []);

  useEffect(() => {
    fetchPaymentInfos();
  }, [fetchPaymentInfos]);

  const bookingAgreementData = selectedBookingForPayment
    ? {
        bookingDate: selectedBookingForPayment.bookingDate,
        bookingTime: selectedBookingForPayment.bookingTime,
        contactInfo: selectedBookingForPayment.contactInfo || {},
        paymentMethod:
          pendingPaymentPayload?.paymentMethod ||
          selectedBookingForPayment.paymentMethod ||
          null,
        downpaymentType:
          pendingPaymentPayload?.downpaymentType ||
          selectedBookingForPayment.downpaymentType ||
          null,
        downpaymentPercentage:
          pendingPaymentPayload?.downpaymentPercentage ??
          selectedBookingForPayment.downpaymentPercentage ??
          null,
        downpaymentAmount:
          pendingPaymentPayload?.downpaymentAmount ??
          selectedBookingForPayment.downpaymentAmount ??
          0,
        remainingBalance:
          pendingPaymentPayload?.remainingBalance ??
          selectedBookingForPayment.remainingBalance ??
          selectedBookingForPayment.totalAmount ??
          0,
      }
    : null;

  const renderDownpaymentControls = () => {
    if (!selectedBookingForPayment) return null;
    return (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Payment Option
          </label>
          <div className="grid grid-cols-1 gap-3">
            <label
              className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                paymentForm.downpaymentType === "percentage"
                  ? "border-green-500 bg-green-500/10"
                  : "border-gray-600 bg-gray-700/50"
              }`}
            >
              <input
                type="radio"
                name="downpaymentType"
                value="percentage"
                checked={paymentForm.downpaymentType === "percentage"}
                onChange={(e) =>
                  handlePaymentFormChange("downpaymentType", e.target.value)
                }
                className="mr-3"
              />
              <div>
                <p className="text-white font-medium">Downpayment</p>
                <p className="text-gray-400 text-xs">
                  Pay a portion now, balance on event day
                </p>
              </div>
            </label>
            <label
              className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                paymentForm.downpaymentType === "full"
                  ? "border-green-500 bg-green-500/10"
                  : "border-gray-600 bg-gray-700/50"
              }`}
            >
              <input
                type="radio"
                name="downpaymentType"
                value="full"
                checked={paymentForm.downpaymentType === "full"}
                onChange={(e) =>
                  handlePaymentFormChange("downpaymentType", e.target.value)
                }
                className="mr-3"
              />
              <div>
                <p className="text-white font-medium">Full Payment</p>
                <p className="text-gray-400 text-xs">
                  Settle the entire amount now
                </p>
              </div>
            </label>
          </div>
        </div>

        {paymentForm.downpaymentType === "percentage" && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Downpayment Percentage
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DOWNPAYMENT_PRESETS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() =>
                    handlePaymentFormChange("downpaymentPercentage", pct)
                  }
                  className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                    Number(paymentForm.downpaymentPercentage) === pct
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-800/60 border border-gray-700 rounded-lg p-3 text-sm">
          <div>
            <p className="text-xs text-gray-400">Selected Option</p>
            <p className="text-white font-semibold">
              {paymentForm.downpaymentType === "full"
                ? "Full Payment"
                : `${downpaymentPercentageValue}% Downpayment`}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Downpayment Amount</p>
            <p className="text-green-400 font-semibold">
              ₱{downpaymentAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Remaining Balance</p>
            <p className="text-blue-300 font-semibold">
              ₱{remainingBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </>
    );
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/bookings/my-bookings",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBookings(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch {
        setUserData(null);
      }
    }

    fetchBookings();
  }, []);

  const handleCancelBooking = (booking) => {
    setSelectedBookingForCancel(booking);
    setCancellationReason("");
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellationReason.trim()) {
      setError("Please provide a reason for cancellation");
      return;
    }

    if (!selectedBookingForCancel) return;

    try {
      setCancelling(selectedBookingForCancel._id);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:5000/api/bookings/${selectedBookingForCancel._id}/cancel`,
        { cancellationReason: cancellationReason.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the booking status in the local state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === selectedBookingForCancel._id
            ? response.data.data
            : booking
        )
      );

      setShowCancelModal(false);
      setSelectedBookingForCancel(null);
      setCancellationReason("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setCancelling(null);
    }
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const openPaymentModal = (booking) => {
    setSelectedBookingForPayment(booking);
    setPaymentForm({
      paymentMethod: "cash",
      downpaymentType: "percentage",
      downpaymentPercentage: 50,
      paymentReference: "",
      paymentImage: null,
    });
    setPaymentProofPreview(null);
    setShowPaymentModal(true);
    setError(null);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedBookingForPayment(null);
    setPaymentProofPreview(null);
    setSubmittingPayment(false);
  };

  const handlePaymentFormChange = (field, value) => {
    setPaymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCopyMobileNumber = async (paymentId, mobileNumber) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(mobileNumber);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = mobileNumber;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedPaymentId(paymentId);
      setTimeout(() => setCopiedPaymentId(null), 2000);
    } catch (copyError) {
      console.error("Clipboard error:", copyError);
      setPaymentInfoError("Copy not supported. Please copy the number manually.");
    }
  };

  const handlePaymentProofChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      handlePaymentFormChange("paymentImage", base64);
      setPaymentProofPreview(base64);
    } catch (uploadErr) {
      setError("Failed to read payment proof file.");
    }
  };

  const submitPaymentToServer = async (payload) => {
    if (!selectedBookingForPayment) return;

    try {
      setSubmittingPayment(true);
      setError(null);
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `http://localhost:5000/api/bookings/${selectedBookingForPayment._id}/payment`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.success) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === selectedBookingForPayment._id
              ? response.data.data
              : booking
          )
        );
        closePaymentModal();
        setShowAgreement(false);
        setPendingPaymentPayload(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handlePaymentSubmitClick = () => {
    if (!selectedBookingForPayment) return;

    if (
      paymentForm.paymentMethod === "gcash" &&
      (!paymentForm.paymentReference?.trim() || !paymentForm.paymentImage)
    ) {
      setError("GCash payments require a reference number and screenshot.");
      return;
    }

    const normalizedDownpaymentType =
      paymentForm.downpaymentType === "full" ? "full" : "percentage";
    const normalizedDownpaymentPercentage =
      normalizedDownpaymentType === "full"
        ? 100
        : downpaymentPercentageValue || 50;

    const payload = {
      paymentMethod: paymentForm.paymentMethod,
      downpaymentType: normalizedDownpaymentType,
      downpaymentPercentage: normalizedDownpaymentPercentage,
      downpaymentAmount,
      remainingBalance,
    };

    if (paymentForm.paymentMethod === "gcash") {
      payload.paymentReference = paymentForm.paymentReference.trim();
      payload.paymentImage = paymentForm.paymentImage;
    }

    setPendingPaymentPayload(payload);
    setShowAgreement(true);
  };

  const handleDownloadAgreement = async (bookingId) => {
    try {
      setDownloadingAgreement(bookingId);
      setError(null);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/bookings/${bookingId}/agreement/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", // Important for file download
        }
      );

      // Create a blob URL and trigger download
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

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

          {error && (
            <div className="mb-6 bg-red-900/90 text-red-100 px-4 py-3 rounded-lg border border-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center text-gray-300 py-16">
              You have no bookings yet.
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => {
                const paymentMeta =
                  paymentStatusMeta[b.paymentStatus] ||
                  paymentStatusMeta.awaiting_confirmation;
                return (
                  <div
                    key={b._id}
                    className="bg-gray-800 rounded-lg border border-gray-700 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-medium ${
                            statusClasses[b.status] || statusClasses.pending
                          }`}
                        >
                          {b.status}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {new Date(b.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="text-green-400 font-semibold">
                          ₱{Number(b.totalAmount || 0).toLocaleString()}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${paymentMeta.className}`}
                        >
                          {paymentMeta.label}
                        </span>
                        {b.agreement && b.agreement.signature && (
                          <>
                            {b.agreement.adminSignature ? (
                              <button
                                onClick={() => handleDownloadAgreement(b._id)}
                                disabled={downloadingAgreement === b._id}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-xs rounded transition-colors flex items-center gap-1"
                                title="Download Agreement"
                              >
                                {downloadingAgreement === b._id ? (
                                  "Downloading..."
                                ) : (
                                  <>
                                    <FileText className="w-3 h-3" />
                                    Agreement
                                  </>
                                )}
                              </button>
                            ) : (
                              <div
                                className="px-3 py-1 bg-gray-600 text-gray-300 text-xs rounded flex items-center gap-1 cursor-not-allowed"
                                title="Waiting for admin signature"
                              >
                                <FileText className="w-3 h-3" />
                                Pending Admin Signature
                              </div>
                            )}
                          </>
                        )}
                        {(b.status === "pending" ||
                          b.status === "confirmed") && (
                          <button
                            onClick={() => handleCancelBooking(b)}
                            disabled={cancelling === b._id}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
                          >
                            {cancelling === b._id ? "Cancelling..." : "Cancel"}
                          </button>
                        )}
                        {(b.status === "cancelled" ||
                          b.status === "refunded") &&
                          b.cancellationReason && (
                            <div className="text-xs text-gray-400 mt-2">
                              <p className="font-medium text-gray-300">
                                Cancellation Reason:
                              </p>
                              <p className="italic">{b.cancellationReason}</p>
                              {b.refundAmount > 0 && (
                                <div className="mt-2">
                                  {b.refundStatus === "pending" && (
                                    <p className="text-yellow-400">
                                      Refund pending: ₱
                                      {Number(b.refundAmount).toLocaleString()}
                                    </p>
                                  )}
                                  {b.refundStatus === "processed" && (
                                    <>
                                      <p className="text-green-400 mb-2">
                                        Refund processed: ₱
                                        {Number(
                                          b.refundAmount
                                        ).toLocaleString()}
                                      </p>
                                      {b.refundedAt && (
                                        <p className="text-gray-400 text-xs">
                                          Processed on:{" "}
                                          {new Date(
                                            b.refundedAt
                                          ).toLocaleDateString()}
                                        </p>
                                      )}
                                      {b.refundProof && (
                                        <div className="mt-2">
                                          <p className="text-gray-300 text-xs mb-1">
                                            Refund Proof:
                                          </p>
                                          <img
                                            src={b.refundProof}
                                            alt="Refund proof"
                                            className="w-32 h-32 object-cover rounded-lg border border-gray-600 cursor-pointer"
                                            onClick={() =>
                                              window.open(
                                                b.refundProof,
                                                "_blank"
                                              )
                                            }
                                            title="Click to view full size"
                                          />
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="text-gray-300 text-sm">
                      <div className="mb-2">
                        <span className="text-gray-400">Booking Date:</span>{" "}
                        {b.bookingDate
                          ? new Date(b.bookingDate).toLocaleDateString()
                          : "-"}
                        {b.bookingTime ? ` • ${b.bookingTime}` : ""}
                      </div>
                      <div className="space-y-1">
                        <div className="text-gray-400">Items:</div>
                        {(b.items || []).map((it, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>
                              {it.name}{" "}
                              {it.type === "inventory"
                                ? `(x${it.quantity})`
                                : ""}
                            </span>
                            <span className="text-gray-400">
                              ₱{Number(it.price).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                      {(b.extensions?.length || b.extensionBalance) && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 font-medium">
                              Extension Charges
                            </span>
                            <span className="text-sm text-gray-400">
                              Outstanding: ₱
                              {Number(b.extensionBalance || 0).toLocaleString()}
                            </span>
                          </div>
                          {b.extensions && b.extensions.length > 0 ? (
                            <div className="mt-2 space-y-2">
                              {b.extensions.map((ext) => (
                                <div
                                  key={ext._id || ext.createdAt}
                                  className="bg-gray-700 rounded px-3 py-2 text-sm border border-gray-600"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-white font-medium">
                                      ₱
                                      {Number(ext.amount || 0).toLocaleString()}
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full border ${
                                        ext.status === "paid"
                                          ? "text-green-300 border-green-500/50"
                                          : "text-yellow-300 border-yellow-500/50"
                                      }`}
                                    >
                                      {ext.status === "paid"
                                        ? "Paid"
                                        : "Pending"}
                                    </span>
                                  </div>
                                  <p className="text-gray-300 mt-1">
                                    {ext.description || "Extension charge"}
                                  </p>
                                  <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-3">
                                    {ext.hours !== null &&
                                      ext.hours !== undefined && (
                                        <span>{ext.hours} hr(s)</span>
                                      )}
                                    {ext.rate !== null &&
                                      ext.rate !== undefined && (
                                        <span>
                                          @ ₱
                                          {Number(
                                            ext.rate || 0
                                          ).toLocaleString()}
                                          /hr
                                        </span>
                                      )}
                                    <span className="capitalize">
                                      Method: {ext.paymentMethod || "cash"}
                                    </span>
                                    {ext.paidAt && (
                                      <span>
                                        Paid:{" "}
                                        {new Date(
                                          ext.paidAt
                                        ).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  {ext.paymentProof && (
                                    <button
                                      onClick={() =>
                                        window.open(ext.paymentProof, "_blank")
                                      }
                                      className="text-xs text-blue-300 underline mt-2"
                                    >
                                      View Proof
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm mt-2">
                              No extension charges recorded.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Payment Call-to-action */}
                    <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <p className="text-white font-medium text-sm">
                            Payment Status
                          </p>
                          <p className="text-gray-300 text-xs">
                            {paymentMeta.label}
                          </p>
                        </div>
                        {b.status === "confirmed" &&
                          (b.paymentStatus === "awaiting_selection" ||
                            !b.paymentStatus) && (
                            <button
                              onClick={() => openPaymentModal(b)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                            >
                              Choose Payment Method
                            </button>
                          )}
                      </div>
                      {b.paymentStatus === "submitted" && (
                        <p className="text-xs text-blue-200 mt-3">
                          Thanks! Your payment details were sent. Please wait
                          for admin verification and signature.
                        </p>
                      )}
                      {b.paymentStatus === "verified" && (
                        <p className="text-xs text-green-200 mt-3">
                          Payment verified. A signed copy of the contract is now
                          available for download.
                        </p>
                      )}
                      {(!b.paymentStatus ||
                        b.paymentStatus === "awaiting_confirmation") && (
                        <p className="text-xs text-gray-300 mt-3">
                          Once an admin confirms your schedule, you can submit
                          your preferred payment method here.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Payment Selection Modal */}
      {showPaymentModal && selectedBookingForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-lg w-full p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Choose Payment Method
              </h2>
              <button
                onClick={closePaymentModal}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Booking for{" "}
              <span className="font-semibold text-white">
                {new Date(
                  selectedBookingForPayment.bookingDate
                ).toLocaleDateString()}
              </span>{" "}
              • ₱
              {Number(
                selectedBookingForPayment.totalAmount || 0
              ).toLocaleString()}
            </p>

            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["cash", "gcash"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() =>
                        handlePaymentFormChange("paymentMethod", method)
                      }
                      className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-colors ${
                        paymentForm.paymentMethod === method
                          ? "bg-blue-600 text-white border-blue-500"
                          : "bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      {method === "cash" ? "💵 Cash" : "📱 GCash"}
                    </button>
                  ))}
                </div>
              </div>

              {paymentForm.paymentMethod === "gcash" && (
                <>
                  {renderDownpaymentControls()}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      GCash Reference Number
                    </label>
                    <input
                      type="text"
                      value={paymentForm.paymentReference}
                      onChange={(e) =>
                        handlePaymentFormChange(
                          "paymentReference",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter 13-digit reference number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Payment Screenshot
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePaymentProofChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                    {paymentProofPreview && (
                      <img
                        src={paymentProofPreview}
                        alt="Payment proof"
                        className="w-full h-48 object-cover rounded-lg border border-gray-600 mt-3"
                      />
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Accepted formats: JPG/PNG, max 5MB
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-300">
                        Official GCash Accounts
                      </p>
                      <button
                        type="button"
                        onClick={fetchPaymentInfos}
                        className="text-xs px-3 py-1 rounded border border-gray-600 text-gray-200 hover:bg-gray-700 transition-colors"
                      >
                        Refresh
                      </button>
                    </div>
                    {paymentInfoError && (
                      <div className="bg-red-900/30 border border-red-700 text-red-200 text-xs px-3 py-2 rounded">
                        {paymentInfoError}
                      </div>
                    )}
                    {paymentInfos.length === 0 && !paymentInfoError ? (
                      <div className="text-xs text-gray-400 bg-gray-800/60 border border-gray-700 rounded-lg p-3">
                        No GCash details are available at the moment. Please
                        contact the admin for assistance.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {paymentInfos.map((info) => (
                          <div
                            key={info._id}
                            className="bg-gray-700/60 border border-gray-600 rounded-lg p-3 space-y-3"
                          >
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div>
                                <p className="text-[10px] uppercase tracking-wide text-gray-400">
                                  {info.label || "GCash"}
                                </p>
                                <p className="text-white font-semibold text-lg">
                                  {info.mobileNumber}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyMobileNumber(
                                    info._id,
                                    info.mobileNumber
                                  )
                                }
                                className="px-3 py-1 text-xs rounded bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-200 transition-colors"
                              >
                                {copiedPaymentId === info._id
                                  ? "Copied!"
                                  : "Copy Number"}
                              </button>
                            </div>
                            {info.qrImage && (
                              <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-3 flex items-center justify-center">
                                <img
                                  src={info.qrImage}
                                  alt={`${info.label || "GCash"} QR`}
                                  className="max-h-48 object-contain"
                                />
                              </div>
                            )}
                            <p className="text-xs text-gray-400">
                              Scan this QR or send to the number above before
                              uploading your proof.
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {paymentForm.paymentMethod === "cash" && (
                <>
                  <div className="p-3 bg-yellow-900/20 border border-yellow-700/60 rounded text-xs text-yellow-200">
                    Cash payments are collected on the event day. Selecting this
                    option lets the admin know you will settle on-site.
                  </div>
                  {renderDownpaymentControls()}
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closePaymentModal}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmitClick}
                disabled={submittingPayment}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                {submittingPayment ? "Submitting..." : "Review & Sign Contract"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Agreement (sign at payment time) */}
      <BookingAgreement
        isOpen={showAgreement && !!selectedBookingForPayment}
        onClose={() => setShowAgreement(false)}
        onAgree={async (agreementInfo) => {
          if (!pendingPaymentPayload || !selectedBookingForPayment) return;
          await submitPaymentToServer({
            ...pendingPaymentPayload,
            agreement: agreementInfo,
          });
        }}
        bookingData={bookingAgreementData || {}}
        cart={
          selectedBookingForPayment
            ? (selectedBookingForPayment.items || []).map((it) => ({
                name: it.name,
                quantity: it.quantity,
                type: it.type,
                // minimal fields; category/unit may be missing but component is tolerant
                category: it.category || null,
                unit: it.unit || null,
              }))
            : []
        }
        totalAmount={selectedBookingForPayment?.totalAmount || 0}
        userName={userData?.fullName || userData?.username || "Client"}
        userEmail={userData?.email || ""}
      />
      {/* Cancellation Reason Modal */}
      {showCancelModal && selectedBookingForCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Cancel Booking
            </h2>
            <p className="text-gray-300 mb-4">
              Are you sure you want to cancel this booking? Please provide a
              reason for cancellation.
            </p>
            {selectedBookingForCancel.paymentMethod === "gcash" && (
              <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <strong>Note:</strong> A refund of ₱
                  {Number(
                    selectedBookingForCancel.downpaymentAmount ||
                      selectedBookingForCancel.totalAmount ||
                      0
                  ).toLocaleString()}{" "}
                  will be processed for this cancellation.
                </p>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">
                Cancellation Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this booking..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows="4"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBookingForCancel(null);
                  setCancellationReason("");
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling === selectedBookingForCancel._id}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                {cancelling === selectedBookingForCancel._id
                  ? "Cancelling..."
                  : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserBooking;
