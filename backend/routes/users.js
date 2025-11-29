const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeOwner,
  authorizeAdmin,
  authorizeOwnerOrAdmin,
  authorizeStaffOrAdmin,
  authorizeOwnerAdminOrStaff,
  authorizeRoles,
} = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUser,
  deleteUserById,
  getAllUsers,
  getUsersByRole,
  updateUserRole,
  toggleUserStatus,
  getUserStats,
  getArtists,
  getArtistsPublic,
  updateArtistAvailability,
  updateArtistAvailabilityById,
  updateArtistBookingFee,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationCode);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes (require authentication)
router.get("/profile", authenticateToken, getUserProfile);
router.put("/profile", authenticateToken, updateUserProfile);
router.put("/change-password", authenticateToken, changePassword);
router.delete("/account", authenticateToken, deleteUser);

// Artist-specific routes
router.get(
  "/artists",
  authenticateToken,
  authorizeOwnerAdminOrStaff,
  getArtists
);
router.get("/artists/public", getArtistsPublic);
router.put(
  "/profile/availability",
  authenticateToken,
  updateArtistAvailability
);
router.put("/profile/booking-fee", authenticateToken, updateArtistBookingFee);
router.put(
  "/:userId/availability",
  authenticateToken,
  authorizeStaffOrAdmin,
  updateArtistAvailabilityById
);

// Owner/Admin routes (also allows clients to view users for deletion)
router.get("/all", authenticateToken, getAllUsers);
router.get("/stats", authenticateToken, authorizeOwnerOrAdmin, getUserStats);
router.get(
  "/by-role/:role",
  authenticateToken,
  authorizeStaffOrAdmin,
  getUsersByRole
);
router.put(
  "/:userId/role",
  authenticateToken,
  authorizeOwnerOrAdmin,
  updateUserRole
);
router.put(
  "/:userId/toggle-status",
  authenticateToken,
  authorizeOwnerOrAdmin,
  toggleUserStatus
);
router.delete(
  "/:userId",
  authenticateToken,
  deleteUserById
);

module.exports = router;
