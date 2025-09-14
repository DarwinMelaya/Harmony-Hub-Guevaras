const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeOwner,
  authorizeAdmin,
  authorizeOwnerOrAdmin,
  authorizeStaffOrAdmin,
  authorizeRoles,
} = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUser,
  getAllUsers,
  getUsersByRole,
  updateUserRole,
  toggleUserStatus,
  getUserStats,
} = require("../controllers/userController");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes (require authentication)
router.get("/profile", authenticateToken, getUserProfile);
router.put("/profile", authenticateToken, updateUserProfile);
router.put("/change-password", authenticateToken, changePassword);
router.delete("/account", authenticateToken, deleteUser);

// Owner/Admin routes
router.get("/all", authenticateToken, authorizeOwnerOrAdmin, getAllUsers);
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

module.exports = router;
