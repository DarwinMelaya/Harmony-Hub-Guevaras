import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const GoogleOAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleGoogleCallback = () => {
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get("token");
      const userData = urlParams.get("user");

      if (token && userData) {
        try {
          // Store token and user data in localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("user", userData);

          // Parse user data to get role
          const user = JSON.parse(userData);
          const userRole = user.role;

          // Redirect based on user role
          switch (userRole) {
            case "admin":
              navigate("/admin-dashboard");
              break;
            case "client":
              navigate("/user-home");
              break;
            case "staff":
              navigate("/staff-dashboard");
              break;
            case "artist":
              navigate("/artist-dashboard");
              break;
            default:
              navigate("/user-home");
          }
        } catch (error) {
          console.error("Error handling Google OAuth callback:", error);
          navigate("/login?error=oauth_failed");
        }
      } else {
        // No token or user data, redirect to login
        navigate("/login?error=oauth_failed");
      }
    };

    handleGoogleCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Processing Google login...</p>
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;
