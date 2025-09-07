const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeAdmin,
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

// Admin only routes
router.post("/", authenticateToken, authorizeAdmin, addBandArtist);
router.put("/:id", authenticateToken, authorizeAdmin, updateBandArtist);
router.delete("/:id", authenticateToken, authorizeAdmin, deleteBandArtist);
router.put(
  "/:id/toggle-status",
  authenticateToken,
  authorizeAdmin,
  toggleBandArtistStatus
);

// Public route (no auth required)
router.get("/public", getAllBandArtistsPublic);

// Staff and Admin routes
router.get("/", authenticateToken, authorizeStaffOrAdmin, getAllBandArtists);
router.get("/:id", authenticateToken, authorizeStaffOrAdmin, getBandArtistById);

module.exports = router;
