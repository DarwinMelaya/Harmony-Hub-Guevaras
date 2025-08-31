import Layout from "../../components/Layout/Layout";
import { useState, useEffect } from "react";
import { User, ChevronDown } from "lucide-react";

const AdminDashboard = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      setUserData(JSON.parse(user));
    }
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
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-blue-400">1,234</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Active Bookings</h3>
              <p className="text-3xl font-bold text-green-400">89</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Revenue</h3>
              <p className="text-3xl font-bold text-yellow-400">$12,345</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Staff Members</h3>
              <p className="text-3xl font-bold text-purple-400">15</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg">
                  Manage Users
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg">
                  View Reports
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg">
                  System Settings
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">New user registration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Booking confirmed</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-300">Payment received</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
