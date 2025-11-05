const express = require("express");
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getArtistBookings,
  checkArtistAvailability,
  getPublicCalendarBookings,
  downloadBookingAgreement,
  adminSignAgreement,
} = require("../controllers/bookingController");
const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../utils/roles");

// Public endpoints (no auth required)
// Check artist availability for specific date
router.get("/check-availability", checkArtistAvailability);

// Get all bookings for calendar view (limited info for privacy)
router.get("/calendar", getPublicCalendarBookings);

// All other routes require authentication
router.use(authenticateToken);

// Create a new booking (client only)
router.post("/", requireRole(["client"]), createBooking);

// Get user's own bookings (client)
router.get("/my-bookings", requireRole(["client"]), getUserBookings);

// Get artist's bookings (artist only)
router.get("/artist-bookings", requireRole(["artist"]), getArtistBookings);

// Get all bookings (owner/admin/staff only)
router.get("/", requireRole(["owner", "admin", "staff"]), getAllBookings);

// Get booking by ID (user can get their own, admin can get any)
router.get("/:id", getBookingById);

// Update booking status (owner/admin/staff only)
router.patch(
  "/:id/status",
  requireRole(["owner", "admin", "staff"]),
  updateBookingStatus
);

// Cancel booking (user can cancel their own)
router.patch("/:id/cancel", cancelBooking);

// Download booking agreement PDF (user can download their own, admin can download any)
router.get("/:id/agreement/download", downloadBookingAgreement);

// Admin sign booking agreement (owner/admin/staff only)
router.patch(
  "/:id/agreement/admin-sign",
  requireRole(["owner", "admin", "staff"]),
  adminSignAgreement
);

module.exports = router;
