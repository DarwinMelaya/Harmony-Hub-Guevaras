import { useState, useEffect } from "react";
import { X, Menu } from "lucide-react";
import AdminSidebar from "../Sidebar/AdminSidebar";
import ArtistSidebar from "../Sidebar/ArtistSidebar";
import ClientSidebar from "../Sidebar/ClientSidebar";
import OwnerSidebar from "../Sidebar/OwnerSidebar";
import StaffSidebar from "../Sidebar/StaffSidebar";

const Layout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = user?.role || "client";

  // Choose sidebar based on user role
  const SidebarComponent =
    userRole === "owner"
      ? OwnerSidebar
      : userRole === "admin"
      ? AdminSidebar
      : userRole === "staff"
      ? StaffSidebar
      : userRole === "artist"
      ? ArtistSidebar
      : ClientSidebar;

  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isMobileOpen) {
        closeMobile();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  return (
    <div className="flex min-h-screen bg-[#0b0d12]">
      {/* Mobile top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#0b0d12] md:hidden">
        <button
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          className="text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1 transition-colors"
          onClick={toggleMobile}
        >
          {isMobileOpen ? (
            <X size={24} className="shrink-0" />
          ) : (
            <Menu size={24} className="shrink-0" />
          )}
        </button>
        <h1 className="text-white font-semibold text-lg">Harmony Hub</h1>
        <div className="w-10" />
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen z-30">
        <SidebarComponent />
      </aside>

      {/* Mobile drawer overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Mobile drawer sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 md:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarComponent onNavigate={closeMobile} />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen w-full md:ml-64 pt-14 md:pt-0">
        <div className="h-full w-full">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
