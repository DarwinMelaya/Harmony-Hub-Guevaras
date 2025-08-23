import AdminSidebar from "../Sidebar/AdminSidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <div className="fixed left-0 top-0 h-screen z-50">
        <AdminSidebar />
      </div>
      <main className="flex-1 ml-64 min-h-screen">{children}</main>
    </div>
  );
};

export default Layout;
