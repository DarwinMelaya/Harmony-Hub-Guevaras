const express = require("express");
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} = require("../controllers/bookingController");
const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../utils/roles");

// All routes require authentication
router.use(authenticateToken);

// Create a new booking (client only)
router.post("/", requireRole(["client"]), createBooking);

// Get user's own bookings (client)
router.get("/my-bookings", requireRole(["client"]), getUserBookings);

// Get all bookings (owner/admin only)
router.get("/", requireRole(["owner", "admin"]), getAllBookings);

// Get booking by ID (user can get their own, admin can get any)
router.get("/:id", getBookingById);

// Update booking status (owner/admin only)
router.patch(
  "/:id/status",
  requireRole(["owner", "admin"]),
  updateBookingStatus
);

// Cancel booking (user can cancel their own)
router.patch("/:id/cancel", cancelBooking);

module.exports = router;
