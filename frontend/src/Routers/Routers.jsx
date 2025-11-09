import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  Login,
  Home,
  Signup,
  GoogleVerify,
  AdminDashboard,
  Inventory,
  User,
  Musician,
  Packages,
  UserHome,
  UserBooking,
  Booking,
  OwnerDashboard,
  OwnerInventory,
  OwnerPackages,
  OwnerUser,
  OwnerMusician,
  OwnerBooking,
  StaffDashboard,
  StaffInventory,
  StaffPackages,
  StaffMusician,
  StaffBooking,
  ArtistDashboard,
  ArtistBooking,
  UserChat,
  OwnerChat,
  Policy,
  Maintenance,
  Reports,
  UserFeedback,
  OwnerFeedback,
} from "../pages";
import ProtectedRoute from "../components/Security/ProtectedRoute";
import GoogleOAuthCallback from "../components/Security/GoogleOAuthCallback";

export const Routers = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/policy" element={<Policy />} />
        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/google-verify" element={<GoogleVerify />} />
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
            <ProtectedRoute requiredRole={["admin", "owner"]}>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-packages"
          element={
            <ProtectedRoute requiredRole={["admin", "owner"]}>
              <Packages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-user"
          element={
            <ProtectedRoute requiredRole={["admin", "owner"]}>
              <User />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-musician"
          element={
            <ProtectedRoute requiredRole={["admin", "owner"]}>
              <Musician />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-booking"
          element={
            <ProtectedRoute requiredRole={["admin", "owner"]}>
              <Booking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-maintenance"
          element={
            <ProtectedRoute requiredRole={["admin"]}>
              <Maintenance />
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
        <Route
          path="/my-chat"
          element={
            <ProtectedRoute>
              <UserChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-feedback"
          element={
            <ProtectedRoute>
              <UserFeedback />
            </ProtectedRoute>
          }
        />
        {/* Protected Owner Pages */}
        <Route
          path="/owner-dashboard"
          element={
            <ProtectedRoute requiredRole="owner">
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner-inventory"
          element={
            <ProtectedRoute requiredRole={["owner"]}>
              <OwnerInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner-packages"
          element={
            <ProtectedRoute requiredRole={["owner"]}>
              <OwnerPackages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner-user"
          element={
            <ProtectedRoute requiredRole={["owner"]}>
              <OwnerUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner-musician"
          element={
            <ProtectedRoute requiredRole={["owner"]}>
              <OwnerMusician />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner-booking"
          element={
            <ProtectedRoute requiredRole={["owner"]}>
              <OwnerBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner-chat"
          element={
            <ProtectedRoute requiredRole={["owner"]}>
              <OwnerChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner-feedback"
          element={
            <ProtectedRoute requiredRole={["owner", "admin"]}>
              <OwnerFeedback />
            </ProtectedRoute>
          }
        />
        {/* Protected Staff Pages */}
        <Route
          path="/staff-dashboard"
          element={
            <ProtectedRoute requiredRole="staff">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-inventory"
          element={
            <ProtectedRoute requiredRole={["staff"]}>
              <StaffInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-packages"
          element={
            <ProtectedRoute requiredRole={["staff"]}>
              <StaffPackages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-musician"
          element={
            <ProtectedRoute requiredRole={["staff"]}>
              <StaffMusician />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-booking"
          element={
            <ProtectedRoute requiredRole={["staff"]}>
              <StaffBooking />
            </ProtectedRoute>
          }
        />
        {/* Protected Artist Pages */}
        <Route
          path="/artist-dashboard"
          element={
            <ProtectedRoute requiredRole="artist">
              <ArtistDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artist-bookings"
          element={
            <ProtectedRoute requiredRole="artist">
              <ArtistBooking />
            </ProtectedRoute>
          }
        />
        {/* Protected Public Pages */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredRole={["admin", "owner"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};
