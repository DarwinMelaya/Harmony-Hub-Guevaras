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
  FileBarChart,
  MessageSquare,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const OwnerSidebar = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      icon: LayoutDashboard,
      text: "Dashboard",
      path: "/owner-dashboard",
      isActive: location.pathname === "/owner-dashboard",
    },
    {
      icon: Package,
      text: "Inventory",
      path: "/owner-inventory",
      isActive: location.pathname === "/owner-inventory",
    },
    {
      icon: Gift,
      text: "Packages",
      path: "/owner-packages",
      isActive: location.pathname === "/owner-packages",
    },
    {
      icon: BarChart3,
      text: "User",
      path: "/owner-user",
      isActive: location.pathname === "/owner-user",
    },
    {
      icon: FileText,
      text: "Musician Artist",
      path: "/owner-musician",
      isActive: location.pathname === "/owner-musician",
    },
    {
      icon: Image,
      text: "Booking Details",
      path: "/owner-booking",
      isActive: location.pathname === "/owner-booking",
    },
    {
      icon: FileBarChart,
      text: "Reports",
      path: "/reports",
      isActive: location.pathname === "/reports",
    },
    // {
    //   icon: Calendar,
    //   text: "Schedule",
    //   path: "/owner-schedule",
    //   isActive: location.pathname === "/owner-schedule",
    // },
    // {
    //   icon: HandCoins,
    //   text: "Refund",
    //   path: "/admin-refund",
    //   isActive: location.pathname === "/admin-refund",
    // },
    {
      icon: MessageCircle,
      text: "Messages",
      path: "/owner-chat",
      isActive: location.pathname === "/owner-chat",
    },
    {
      icon: MessageSquare,
      text: "Feedback",
      path: "/owner-feedback",
      isActive: location.pathname === "/owner-feedback",
    },
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
    <div className="bg-[#282c34] h-screen w-64 flex flex-col border-r border-gray-700">
      {/* Logo - Fixed at top */}
      <div className="px-6 py-5 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold tracking-tight">
            <span className="text-white">HARMONY</span>
            <span className="text-red-500"> HUB</span>
          </h1>
        </div>
      </div>

      {/* Navigation Items - Scrollable */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navigationItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleNavigation(item.path)}
            className={`group relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              item.isActive
                ? "bg-blue-500/10 text-blue-500 shadow-sm"
                : "text-white hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.icon
              size={18}
              className={`shrink-0 transition-colors ${
                item.isActive
                  ? "text-blue-500"
                  : "text-gray-400 group-hover:text-white"
              }`}
            />
            <span className="flex-1 text-left">{item.text}</span>
            {item.isActive && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-l-full bg-blue-500"></div>
            )}
          </button>
        ))}
      </nav>

      {/* Logout Button - Fixed at bottom */}
      <div className="border-t border-gray-700 px-3 py-4 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="group relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} className="shrink-0 text-red-400 group-hover:text-red-400" />
          <span className="flex-1 text-left">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default OwnerSidebar;
