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

// Staff and Admin routes
router.get("/", authenticateToken, authorizeStaffOrAdmin, getAllBandArtists);
router.get("/:id", authenticateToken, authorizeStaffOrAdmin, getBandArtistById);

module.exports = router;
