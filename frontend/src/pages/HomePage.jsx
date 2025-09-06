import Layout from "../components/Layout/Layout";
import { useState, useEffect } from "react";
import { User, ChevronDown } from "lucide-react";

const HomePage = () => {
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
              <p className="text-gray-300">
                This is your client dashboard. You can view your bookings,
                manage your profile, and more.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
                  View Bookings
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
                  Update Profile
                </button>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <p className="text-gray-300">No recent activity to display.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
