import Layout from "../../components/Layout/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { FileText, Download } from "lucide-react";

const statusClasses = {
  pending: "bg-yellow-900/40 text-yellow-300 border border-yellow-700",
  confirmed: "bg-blue-900/40 text-blue-300 border border-blue-700",
  completed: "bg-green-900/40 text-green-300 border border-green-700",
  cancelled: "bg-red-900/40 text-red-300 border border-red-700",
};

const UserBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [downloadingAgreement, setDownloadingAgreement] = useState(null);

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

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setCancelling(bookingId);
      setError(null);
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/bookings/${bookingId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the booking status in the local state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );
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
                          onClick={() => handleCancelBooking(b._id)}
                          disabled={cancelling === b._id}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
                        >
                          {cancelling === b._id ? "Cancelling..." : "Cancel"}
                        </button>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserBooking;
