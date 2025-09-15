import Layout from "../../components/Layout/Layout";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  ToggleLeft,
  ToggleRight,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Music,
} from "lucide-react";

const ArtistDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [profile, setProfile] = useState({
    isAvailable: true,
    booking_fee: 0,
    fullName: "",
    genre: "",
  });

  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, bookingsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users/profile", { headers }),
          axios.get("http://localhost:5000/api/bookings/artist-bookings", {
            headers,
          }),
        ]);

        if (profileRes.data?.success) {
          const p = profileRes.data.data || {};
          setProfile((prev) => ({
            ...prev,
            isAvailable: p.isAvailable !== false,
            booking_fee: Number(p.booking_fee) || 0,
            fullName: p.fullName || p.username || "",
            genre: p.genre || "",
          }));
        }

        if (bookingsRes.data?.success) {
          setBookings(bookingsRes.data.data || []);
        }
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const total = bookings.length;
    const upcoming = bookings.filter((b) => {
      const d = new Date(b.bookingDate);
      return ["pending", "confirmed"].includes(b.status) && d >= now;
    }).length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const estEarnings = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => {
        // artistItem comes from backend formatter; fallback to first matching item
        const artistItem =
          b.artistItem || b.items?.find((i) => i.type === "bandArtist");
        const price =
          Number(artistItem?.price) || Number(profile.booking_fee) || 0;
        return sum + price;
      }, 0);
    return { total, upcoming, completed, estEarnings };
  }, [bookings, profile.booking_fee]);

  const toggleAvailability = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const newStatus = !profile.isAvailable;
      const res = await axios.put(
        "http://localhost:5000/api/users/profile/availability",
        { isAvailable: newStatus },
        { headers }
      );
      if (res.data?.success) {
        setProfile((p) => ({ ...p, isAvailable: newStatus }));
        localStorage.setItem("artistAvailability", newStatus.toString());
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const saveBookingFee = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const res = await axios.put(
        "http://localhost:5000/api/users/profile/booking-fee",
        { booking_fee: Number(profile.booking_fee) },
        { headers }
      );
      if (!res.data?.success) {
        throw new Error("Failed to update booking fee");
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-blue-400" />
              Artist Dashboard
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAvailability}
                disabled={saving}
                className={`px-3 py-2 rounded border text-sm flex items-center gap-2 ${
                  profile.isAvailable
                    ? "bg-green-600 border-green-500 text-white"
                    : "bg-gray-700 border-gray-600 text-gray-300"
                }`}
              >
                {profile.isAvailable ? (
                  <ToggleRight className="w-4 h-4" />
                ) : (
                  <ToggleLeft className="w-4 h-4" />
                )}
                <span>
                  {profile.isAvailable
                    ? "Status: Available"
                    : "Status: Not Available"}
                </span>
              </button>
            </div>
          </div>

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

          {/* Profile card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="md:col-span-2 bg-gray-800 rounded-lg border border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Profile</h2>
                  <p className="text-gray-400 text-sm">
                    {profile.fullName} {profile.genre && `• ${profile.genre}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Booking Fee (₱)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={profile.booking_fee}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          booking_fee: e.target.value,
                        }))
                      }
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={saveBookingFee}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-white"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Status
                  </label>
                  <div className="flex items-center gap-2">
                    {profile.isAvailable ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" /> Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700/50 text-gray-300 border border-gray-600">
                        <Clock className="w-3 h-3 mr-1" /> Not Available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
              <h2 className="text-lg font-semibold text-white mb-4">
                Quick Stats
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total Bookings</span>
                  <span className="font-bold">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Upcoming</span>
                  <span className="font-bold">{stats.upcoming}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Completed</span>
                  <span className="font-bold">{stats.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Est. Earnings</span>
                  <span className="font-bold flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {Number(stats.estEarnings).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming bookings list */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" /> Upcoming
                Bookings
              </h2>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {bookings
                  .filter((b) => ["pending", "confirmed"].includes(b.status))
                  .sort(
                    (a, b) => new Date(a.bookingDate) - new Date(b.bookingDate)
                  )
                  .map((b) => {
                    const artistItem =
                      b.artistItem ||
                      b.items?.find((i) => i.type === "bandArtist");
                    const price =
                      Number(artistItem?.price) ||
                      Number(profile.booking_fee) ||
                      0;
                    return (
                      <div
                        key={b._id}
                        className="py-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            <Music className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {new Date(b.bookingDate).toLocaleDateString()} •{" "}
                              {b.bookingTime}
                            </div>
                            <div className="text-gray-400 text-sm">
                              Duration: {b.duration}h
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-300 text-sm capitalize">
                            {b.status}
                          </div>
                          <div className="text-green-400 font-semibold">
                            ₱{price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {bookings.filter((b) =>
                  ["pending", "confirmed"].includes(b.status)
                ).length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    No upcoming bookings
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ArtistDashboard;
