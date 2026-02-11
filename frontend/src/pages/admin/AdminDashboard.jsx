import Layout from "../../components/Layout/Layout";
import { useState, useEffect } from "react";
import {
  User,
  ChevronDown,
  Box,
  CalendarCheck2,
  Wallet,
  Package,
} from "lucide-react";
import axios from "axios";

const AdminDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    activeBookings: 0,
    completedRevenue: 0,
    inventoryCount: 0,
    packagesCount: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    // Get user data from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      setUserData(JSON.parse(user));
    }
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [
          usersStatsRes,
          invRes,
          pkgRes,
          pendingRes,
          confirmedRes,
          completedRes,
          recentRes,
        ] = await Promise.all([
          axios.get("http://localhost:5000/api/users/stats", { headers }),
          axios.get("http://localhost:5000/api/inventory", { headers }),
          axios.get("http://localhost:5000/api/packages", { headers }),
          axios.get(
            "http://localhost:5000/api/bookings?status=pending&limit=1",
            { headers }
          ),
          axios.get(
            "http://localhost:5000/api/bookings?status=confirmed&limit=1",
            { headers }
          ),
          axios.get(
            "http://localhost:5000/api/bookings?status=completed&limit=100",
            { headers }
          ),
          axios.get("http://localhost:5000/api/bookings?limit=5", { headers }),
        ]);

        const totalUsers = usersStatsRes.data?.data?.total || 0;
        const activeUsers = usersStatsRes.data?.data?.active || 0;
        const invList = invRes.data?.inventory || invRes.data?.data || [];
        const inventoryCount = invList.length || 0;
        const packagesCount =
          pkgRes.data?.packages?.length || pkgRes.data?.data?.length || 0;
        const pendingTotal = pendingRes.data?.pagination?.total || 0;
        const confirmedTotal = confirmedRes.data?.pagination?.total || 0;
        const activeBookings = pendingTotal + confirmedTotal;

        // Approx revenue: sum completed bookings on first page (limit 100)
        const completedList = completedRes.data?.data || [];
        const completedRevenue = completedList
          .filter((b) => b.status === "completed")
          .reduce(
            (sum, b) => sum + (Number(b.totalAmount) || 0),
            0
          );

        setStats({
          totalUsers,
          activeUsers,
          activeBookings,
          completedRevenue,
          inventoryCount,
          packagesCount,
        });

        setRecentBookings(recentRes.data?.data || []);
        const low = invList
          .filter((i) => (i.quantity ?? 0) <= 3)
          .sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0))
          .slice(0, 5);
        setLowStock(low);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with user profile */}
          <div className="flex items-center justify-between mb-8">
            <div>
              {userData && (
                <div className="mt-2">
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
              <div className="flex items-center space-x-4">
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
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300">
                  Total Users
                </h3>
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <p className="mt-2 text-3xl font-bold text-blue-400">
                {stats.totalUsers}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Active: {stats.activeUsers}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300">
                  Active Bookings
                </h3>
                <CalendarCheck2 className="w-5 h-5 text-green-400" />
              </div>
              <p className="mt-2 text-3xl font-bold text-green-400">
                {stats.activeBookings}
              </p>
              <p className="mt-1 text-xs text-gray-400">Pending + Confirmed</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300">
                  Completed Revenue
                </h3>
                <Wallet className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="mt-2 text-3xl font-bold text-yellow-400">
                ₱{Number(stats.completedRevenue).toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                From latest 100 completed
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300">
                  Inventory / Packages
                </h3>
                <Box className="w-5 h-5 text-purple-400" />
              </div>
              <p className="mt-2 text-3xl font-bold text-purple-400">
                {stats.inventoryCount}
              </p>
              <div className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                <Package className="w-3 h-3" /> {stats.packagesCount} packages
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">
                Low Stock Inventory
              </h2>
              {loading ? (
                <div className="text-gray-400">Loading...</div>
              ) : lowStock.length === 0 ? (
                <div className="text-gray-400">
                  All inventory levels look good.
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStock.map((it) => (
                    <div
                      key={it._id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-3">
                        {it.image ? (
                          <img
                            src={it.image}
                            alt={it.name}
                            className="h-8 w-8 object-cover rounded border border-gray-700"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-gray-700" />
                        )}
                        <span className="text-gray-200">{it.name}</span>
                      </div>
                      <span className="text-red-300">
                        {it.quantity ?? 0} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
              {error && (
                <div className="mb-3 text-sm text-red-300">{error}</div>
              )}
              {loading ? (
                <div className="text-gray-400">Loading...</div>
              ) : recentBookings.length === 0 ? (
                <div className="text-gray-400">No recent bookings</div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((b) => (
                    <div
                      key={b._id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="text-gray-200">
                          {b.user?.fullName || b.user?.username || "Client"}
                        </span>
                        <span className="text-gray-500">
                          ₱{Number(b.totalAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-xs border border-gray-600 capitalize">
                          {b.status}
                        </span>
                        <div className="text-gray-500 text-xs">
                          {new Date(b.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
