const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeOwnerOrAdmin,
  authorizeStaffOrAdmin,
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

// Owner/Admin only routes
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

// Staff and Admin routes
router.get("/", authenticateToken, authorizeStaffOrAdmin, getAllBandArtists);
router.get("/:id", authenticateToken, authorizeStaffOrAdmin, getBandArtistById);

module.exports = router;
