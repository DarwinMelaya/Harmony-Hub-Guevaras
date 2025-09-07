import { useState } from "react";
import AdminSidebar from "../Sidebar/AdminSidebar";
import ClientSidebar from "../Sidebar/ClientSidebar";

const Layout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = user?.role || "client";

  // Choose sidebar based on user role
  const SidebarComponent = userRole === "admin" ? AdminSidebar : ClientSidebar;

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <div className="flex min-h-screen bg-[#0b0d12]">
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#0b0d12] md:hidden">
        <button
          aria-label="Open menu"
          className="text-white focus:outline-none"
          onClick={() => setIsMobileOpen(true)}
        >
          {/* simple hamburger */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <h1 className="text-white font-semibold">Harmony Hub</h1>
        <div className="w-6" />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-screen z-50">
        <SidebarComponent />
      </div>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={closeMobile}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 md:hidden">
            <SidebarComponent onNavigate={closeMobile} />
          </div>
        </>
      )}

      <main className="flex-1 min-h-screen md:ml-64 pt-14 md:pt-0 px-4 md:px-0 w-full">{children}</main>
    </div>
  );
};

export default Layout;
