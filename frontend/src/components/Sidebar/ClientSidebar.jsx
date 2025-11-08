import {
  LayoutDashboard,
  Calendar,
  User,
  Settings,
  LogOut,
  MessageCircle,
  MessageSquare,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const ClientSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      icon: LayoutDashboard,
      text: "Home",
      path: "/user-home",
      isActive: location.pathname === "/user-home",
    },
    {
      icon: Calendar,
      text: "My Bookings",
      path: "/my-bookings",
      isActive: location.pathname === "/my-bookings",
    },
    {
      icon: MessageCircle,
      text: "Messages",
      path: "/my-chat",
      isActive: location.pathname === "/my-chat",
    },
    {
      icon: MessageSquare,
      text: "Feedback",
      path: "/my-feedback",
      isActive: location.pathname === "/my-feedback",
    },
    // {
    //   icon: User,
    //   text: "Profile",
    //   path: "/profile",
    //   isActive: location.pathname === "/profile",
    // },
    // {
    //   icon: Settings,
    //   text: "Settings",
    //   path: "/settings",
    //   isActive: location.pathname === "/settings",
    // },
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
    <div className="bg-[#282c34] h-screen w-64 flex flex-col border-r border-gray-700">
      {/* Logo - Fixed at top */}
      <div className="px-6 py-5 border-b border-gray-700 flex-shrink-0">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold tracking-tight">
            <span className="text-white">HARMONY</span>
            <span className="text-red-500"> HUB</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1.5 font-normal">Client Portal</p>
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

export default ClientSidebar;
