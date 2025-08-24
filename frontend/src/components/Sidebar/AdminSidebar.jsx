import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Image,
  Calendar,
  HandCoins,
  MessageCircle,
  HelpCircle,
  Settings,
  LogOut,
  Package,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      icon: LayoutDashboard,
      text: "Dashboard",
      path: "/admin-dashboard",
      isActive: location.pathname === "/admin-dashboard",
    },
    {
      icon: Package,
      text: "Inventory",
      path: "/admin-inventory",
      isActive: location.pathname === "/admin-inventory",
    },
    {
      icon: BarChart3,
      text: "User",
      path: "/admin-user",
      isActive: location.pathname === "/admin-user",
    },
    {
      icon: FileText,
      text: "Musician Artist",
      path: "/admin-musician",
      isActive: location.pathname === "/admin-musician",
    },
    {
      icon: Image,
      text: "Booking Details",
      path: "/admin-booking",
      isActive: location.pathname === "/admin-booking",
    },
    {
      icon: Calendar,
      text: "Schedule",
      path: "/admin-schedule",
      isActive: location.pathname === "/admin-schedule",
    },
    {
      icon: HandCoins,
      text: "Refund",
      path: "/admin-refund",
      isActive: location.pathname === "/admin-refund",
    },
    {
      icon: MessageCircle,
      text: "Message",
      path: "/admin-message",
      isActive: location.pathname === "/admin-message",
    },
    {
      icon: HelpCircle,
      text: "Help",
      path: "/admin-help",
      isActive: location.pathname === "/admin-help",
    },
    {
      icon: Settings,
      text: "Setting",
      path: "/admin-setting",
      isActive: location.pathname === "/admin-setting",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Redirect to login page
    navigate("/login");
  };

  return (
    <div className="bg-[#282c34] h-screen w-64 flex flex-col">
      {/* Logo - Fixed at top */}
      <div className="p-6 border-b border-gray-700 flex-shrink-0">
        <h1 className="text-xl font-semibold">
          <span className="text-white">HARMONY</span>
          <span className="text-red-500"> HUB</span>
        </h1>
      </div>

      {/* Navigation Items - Scrollable */}
      <nav
        className="flex-1 overflow-y-auto p-6 space-y-4"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#4B5563 #1F2937",
        }}
      >
        <style jsx>{`
          nav::-webkit-scrollbar {
            width: 6px;
          }
          nav::-webkit-scrollbar-track {
            background: #1f2937;
            border-radius: 3px;
          }
          nav::-webkit-scrollbar-thumb {
            background: #4b5563;
            border-radius: 3px;
            transition: background 0.2s ease;
          }
          nav::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }
          nav::-webkit-scrollbar-corner {
            background: #1f2937;
          }
        `}</style>

        {navigationItems.map((item, index) => (
          <div
            key={index}
            onClick={() => handleNavigation(item.path)}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors relative ${
              item.isActive
                ? "text-blue-500 bg-blue-500/10"
                : "text-white hover:bg-white/10"
            }`}
          >
            <div className="flex items-center space-x-3">
              <item.icon
                size={20}
                className={item.isActive ? "text-blue-500" : "text-white"}
              />
              <span
                className={
                  item.isActive ? "text-blue-500 font-medium" : "text-white"
                }
              >
                {item.text}
              </span>
            </div>

            {/* Active indicator bar */}
            {item.isActive && (
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-full"></div>
            )}
          </div>
        ))}
      </nav>

      {/* Logout Button - Fixed at bottom */}
      <div className="p-6 border-t border-gray-700 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
