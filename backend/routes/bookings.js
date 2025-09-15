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
} = require("../controllers/bookingController");
const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../utils/roles");

// Check artist availability for specific date (public endpoint - no auth required)
router.get("/check-availability", checkArtistAvailability);

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

module.exports = router;
