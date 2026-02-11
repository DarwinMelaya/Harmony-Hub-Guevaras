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
  Gift,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const StaffSidebar = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      icon: LayoutDashboard,
      text: "Dashboard",
      path: "/staff-dashboard",
      isActive: location.pathname === "/staff-dashboard",
    },
    {
      icon: Package,
      text: "Inventory",
      path: "/staff-inventory",
      isActive: location.pathname === "/staff-inventory",
    },
    {
      icon: Gift,
      text: "Packages",
      path: "/staff-packages",
      isActive: location.pathname === "/staff-packages",
    },
    {
      icon: BarChart3,
      text: "Musician Artist",
      path: "/staff-musician",
      isActive: location.pathname === "/staff-musician",
    },
    {
      icon: FileText,
      text: "Booking Details",
      path: "/staff-booking",
      isActive: location.pathname === "/staff-booking",
    },
    // {
    //   icon: Calendar,
    //   text: "Schedule",
    //   path: "/staff-schedule",
    //   isActive: location.pathname === "/staff-schedule",
    // },
    // {
    //   icon: MessageCircle,
    //   text: "Message",
    //   path: "/admin-message",
    //   isActive: location.pathname === "/admin-message",
    // },
    // {
    //   icon: HelpCircle,
    //   text: "Help",
    //   path: "/admin-help",
    //   isActive: location.pathname === "/admin-help",
    // },
    // {
    //   icon: Settings,
    //   text: "Setting",
    //   path: "/admin-setting",
    //   isActive: location.pathname === "/admin-setting",
    // },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (typeof onNavigate === "function") onNavigate();
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to login page
    navigate("/login");
    if (typeof onNavigate === "function") onNavigate();
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
        <style>{`
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

export default StaffSidebar;
