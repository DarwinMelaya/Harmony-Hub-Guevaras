import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  // If no token, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If role is required and user doesn't have it, redirect to appropriate page
  if (
    requiredRole &&
    !(Array.isArray(requiredRole)
      ? requiredRole.includes(user.role)
      : user.role === requiredRole)
  ) {
    // Redirect based on user role
    switch (user.role) {
      case "owner":
        return <Navigate to="/owner-dashboard" replace />;
      case "admin":
        return <Navigate to="/admin-dashboard" replace />;
      case "client":
        return <Navigate to="/user-home" replace />;
      case "staff":
        return <Navigate to="/staff-dashboard" replace />;
      case "artist":
        return <Navigate to="/artist-dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  // If all checks pass, render the protected component
  return children;
};

export default ProtectedRoute;
