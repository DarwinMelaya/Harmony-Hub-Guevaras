const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeOwnerOrAdmin,
  authorizeStaffOrAdmin,
  authorizeOwnerAdminOrStaff,
} = require("../middleware/auth");
const {
  addBandArtist,
  getAllBandArtists,
  getAllBandArtistsPublic,
  getBandArtistById,
  updateBandArtist,
  deleteBandArtist,
  toggleBandArtistStatus,
} = require("../controllers/bandArtistController");

// Owner/Admin/Staff routes
router.post("/", authenticateToken, authorizeOwnerOrAdmin, addBandArtist);
router.put("/:id", authenticateToken, authorizeOwnerOrAdmin, updateBandArtist);
router.delete(
  "/:id",
  authenticateToken,
  authorizeOwnerOrAdmin,
  deleteBandArtist
);
router.put(
  "/:id/toggle-status",
  authenticateToken,
  authorizeOwnerOrAdmin,
  toggleBandArtistStatus
);

// Public route (no auth required)
router.get("/public", getAllBandArtistsPublic);

// Staff, Admin, and Owner routes
router.get(
  "/",
  authenticateToken,
  authorizeOwnerAdminOrStaff,
  getAllBandArtists
);
router.get(
  "/:id",
  authenticateToken,
  authorizeOwnerAdminOrStaff,
  getBandArtistById
);

module.exports = router;
