const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");
const {
  addPackage,
  getAllPackages,
  getPublicPackages,
} = require("../controllers/packagesController");

// POST /api/package - Add new package (admin only)
router.post("/", authenticateToken, authorizeAdmin, addPackage);
// GET /api/packages - Get all packages (admin only)
router.get("/", authenticateToken, authorizeAdmin, getAllPackages);
// GET /api/packages/public - Get all packages (public for clients)
router.get("/public", getPublicPackages);

module.exports = router;
