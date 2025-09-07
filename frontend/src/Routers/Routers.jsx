import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  Login,
  Home,
  Signup,
  AdminDashboard,
  Inventory,
  User,
  Musician,
  Packages,
  UserHome,
  UserBooking,
  Booking,
} from "../pages";
import ProtectedRoute from "../components/Security/ProtectedRoute";
import GoogleOAuthCallback from "../components/Security/GoogleOAuthCallback";

export const Routers = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Google OAuth Callback */}
        <Route path="/google-callback" element={<GoogleOAuthCallback />} />
        {/* Protected Admin Pages */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-inventory"
          element={
            <ProtectedRoute requiredRole="admin">
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-packages"
          element={
            <ProtectedRoute requiredRole="admin">
              <Packages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-user"
          element={
            <ProtectedRoute requiredRole="admin">
              <User />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-musician"
          element={
            <ProtectedRoute requiredRole="admin">
              <Musician />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-booking"
          element={
            <ProtectedRoute requiredRole="admin">
              <Booking />
            </ProtectedRoute>
          }
        />
        {/* Protected Client Pages */}
        <Route
          path="/user-home"
          element={
            <ProtectedRoute>
              <UserHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <UserBooking />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};
