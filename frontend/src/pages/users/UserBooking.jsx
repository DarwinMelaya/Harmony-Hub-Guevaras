import Layout from "../../components/Layout/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { FileText, Download } from "lucide-react";

const statusClasses = {
  pending: "bg-yellow-900/40 text-yellow-300 border border-yellow-700",
  confirmed: "bg-blue-900/40 text-blue-300 border border-blue-700",
  completed: "bg-green-900/40 text-green-300 border border-green-700",
  cancelled: "bg-red-900/40 text-red-300 border border-red-700",
  refunded: "bg-purple-900/40 text-purple-300 border border-purple-700",
};

const UserBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [downloadingAgreement, setDownloadingAgreement] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");

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
              {bookings.map((b) => (
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
                    <div className="flex items-center gap-3">
                      <div className="text-green-400 font-semibold">
                        ₱{Number(b.totalAmount || 0).toLocaleString()}
                      </div>
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
                      {(b.status === "pending" || b.status === "confirmed") && (
                        <button
                          onClick={() => handleCancelBooking(b)}
                          disabled={cancelling === b._id}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
                        >
                          {cancelling === b._id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                      {(b.status === "cancelled" || b.status === "refunded") && b.cancellationReason && (
                        <div className="text-xs text-gray-400 mt-2">
                          <p className="font-medium text-gray-300">Cancellation Reason:</p>
                          <p className="italic">{b.cancellationReason}</p>
                          {b.refundAmount > 0 && (
                            <div className="mt-2">
                              {b.refundStatus === "pending" && (
                                <p className="text-yellow-400">
                                  Refund pending: ₱{Number(b.refundAmount).toLocaleString()}
                                </p>
                              )}
                              {b.refundStatus === "processed" && (
                                <>
                                  <p className="text-green-400 mb-2">
                                    Refund processed: ₱{Number(b.refundAmount).toLocaleString()}
                                  </p>
                                  {b.refundedAt && (
                                    <p className="text-gray-400 text-xs">
                                      Processed on: {new Date(b.refundedAt).toLocaleDateString()}
                                    </p>
                                  )}
                                  {b.refundProof && (
                                    <div className="mt-2">
                                      <p className="text-gray-300 text-xs mb-1">Refund Proof:</p>
                                      <img
                                        src={b.refundProof}
                                        alt="Refund proof"
                                        className="w-32 h-32 object-cover rounded-lg border border-gray-600 cursor-pointer"
                                        onClick={() => window.open(b.refundProof, '_blank')}
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
                            {it.type === "inventory" ? `(x${it.quantity})` : ""}
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
                                  ₱{Number(ext.amount || 0).toLocaleString()}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full border ${
                                    ext.status === "paid"
                                      ? "text-green-300 border-green-500/50"
                                      : "text-yellow-300 border-yellow-500/50"
                                  }`}
                                >
                                  {ext.status === "paid" ? "Paid" : "Pending"}
                                </span>
                              </div>
                              <p className="text-gray-300 mt-1">
                                {ext.description || "Extension charge"}
                              </p>
                              <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-3">
                                {ext.hours !== null && ext.hours !== undefined && (
                                  <span>{ext.hours} hr(s)</span>
                                )}
                                {ext.rate !== null && ext.rate !== undefined && (
                                  <span>
                                    @ ₱{Number(ext.rate || 0).toLocaleString()}/hr
                                  </span>
                                )}
                                <span className="capitalize">
                                  Method: {ext.paymentMethod || "cash"}
                                </span>
                                {ext.paidAt && (
                                  <span>
                                    Paid: {new Date(ext.paidAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              {ext.paymentProof && (
                                <button
                                  onClick={() => window.open(ext.paymentProof, "_blank")}
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Reason Modal */}
      {showCancelModal && selectedBookingForCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Cancel Booking
            </h2>
            <p className="text-gray-300 mb-4">
              Are you sure you want to cancel this booking? Please provide a reason for cancellation.
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
