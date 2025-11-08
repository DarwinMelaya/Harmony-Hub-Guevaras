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
  Wrench,
  FileBarChart,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const AdminSidebar = ({ onNavigate }) => {
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
      icon: Gift,
      text: "Packages",
      path: "/admin-packages",
      isActive: location.pathname === "/admin-packages",
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
      icon: Wrench,
      text: "Maintenance",
      path: "/admin-maintenance",
      isActive: location.pathname === "/admin-maintenance",
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
    //   path: "/admin-schedule",
    //   isActive: location.pathname === "/admin-schedule",
    // },
    // {
    //   icon: HandCoins,
    //   text: "Refund",
    //   path: "/admin-refund",
    //   isActive: location.pathname === "/admin-refund",
    // },
    // {
    //   icon: MessageCircle,
    //   text: "Messages",
    //   path: "/admin-chat",
    //   isActive: location.pathname === "/admin-chat",
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

export default AdminSidebar;
