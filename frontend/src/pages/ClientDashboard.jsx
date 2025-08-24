import Layout from "../components/Layout/Layout";

const ClientDashboard = () => {
  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Client Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
              <p className="text-gray-300">
                This is your client dashboard. You can view your bookings, manage your profile, and more.
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
              <p className="text-gray-300">
                No recent activity to display.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClientDashboard;
