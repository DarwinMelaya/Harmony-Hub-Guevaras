import {
  LayoutDashboard,
  Music,
  Calendar,
  DollarSign,
  MessageCircle,
  HelpCircle,
  Settings,
  LogOut,
  User,
  Clock,
  Star,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  BookOpen,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const ArtistSidebar = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAvailable, setIsAvailable] = useState(true);

  // Load availability status from server on component mount
  useEffect(() => {
    fetchArtistProfile();
  }, []);

  const fetchArtistProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No authentication token found");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setIsAvailable(response.data.data.isAvailable);
        // Update localStorage with the server value
        localStorage.setItem(
          "artistAvailability",
          response.data.data.isAvailable.toString()
        );
        console.log("Artist profile loaded successfully");
      }
    } catch (error) {
      console.error("Error fetching artist profile:", error);
      // Fallback to localStorage if server request fails
      const savedStatus = localStorage.getItem("artistAvailability");
      if (savedStatus !== null) {
        setIsAvailable(savedStatus === "true");
      }
    }
  };

  const navigationItems = [
    {
      icon: LayoutDashboard,
      text: "Dashboard",
      path: "/artist-dashboard",
      isActive: location.pathname === "/artist-dashboard",
    },
    {
      icon: BookOpen,
      text: "Bookings",
      path: "/artist-bookings",
      isActive: location.pathname === "/artist-bookings",
    },
    {
      icon: isAvailable ? ToggleRight : ToggleLeft,
      text: `Status: ${isAvailable ? "Available" : "Not Available"}`,
      path: "/artist-status",
      isActive: location.pathname === "/artist-status",
      isStatusToggle: true,
    },
  ];

  const handleStatusToggle = async () => {
    const newStatus = !isAvailable;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        "http://localhost:5000/api/users/profile/availability",
        { isAvailable: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setIsAvailable(newStatus);
        localStorage.setItem("artistAvailability", newStatus.toString());
        console.log(
          `Status updated to: ${newStatus ? "Available" : "Not Available"}`
        );
      }
    } catch (error) {
      console.error("Error updating artist availability:", error);
      // Show user-friendly error message
      if (error.response?.status === 401) {
        alert("Authentication failed. Please log in again.");
      } else if (error.response?.status === 403) {
        const errorMessage =
          error.response?.data?.message ||
          "Access denied. Artist role required.";
        alert(`Access denied: ${errorMessage}`);
      } else {
        alert("Failed to update availability status. Please try again.");
      }
    }
  };

  const handleNavigation = (path, isStatusToggle = false) => {
    if (isStatusToggle) {
      handleStatusToggle();
    } else {
      navigate(path);
      if (typeof onNavigate === "function") onNavigate();
    }
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
        <p className="text-xs text-gray-400 mt-1">Artist Portal</p>
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
            onClick={() => handleNavigation(item.path, item.isStatusToggle)}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors relative ${
              item.isActive
                ? "text-blue-500 bg-blue-500/10"
                : item.isStatusToggle
                ? isAvailable
                  ? "text-green-400 hover:bg-green-500/10"
                  : "text-red-400 hover:bg-red-500/10"
                : "text-white hover:bg-white/10"
            }`}
          >
            <div className="flex items-center space-x-3">
              <item.icon
                size={20}
                className={
                  item.isActive
                    ? "text-blue-500"
                    : item.isStatusToggle
                    ? isAvailable
                      ? "text-green-400"
                      : "text-red-400"
                    : "text-white"
                }
              />
              <span
                className={
                  item.isActive
                    ? "text-blue-500 font-medium"
                    : item.isStatusToggle
                    ? isAvailable
                      ? "text-green-400 font-medium"
                      : "text-red-400 font-medium"
                    : "text-white"
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

export default ArtistSidebar;
