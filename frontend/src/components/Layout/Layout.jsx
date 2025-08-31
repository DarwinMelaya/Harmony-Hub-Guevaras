import AdminSidebar from "../Sidebar/AdminSidebar";
import ClientSidebar from "../Sidebar/ClientSidebar";

const Layout = ({ children }) => {
  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = user?.role || "client";

  // Choose sidebar based on user role
  const SidebarComponent = userRole === "admin" ? AdminSidebar : ClientSidebar;

  return (
    <div className="flex min-h-screen">
      <div className="fixed left-0 top-0 h-screen z-50">
        <SidebarComponent />
      </div>
      <main className="flex-1 ml-64 min-h-screen">{children}</main>
    </div>
  );
};

export default Layout;
