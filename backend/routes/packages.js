const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");
const {
  addPackage,
  getAllPackages,
} = require("../controllers/packagesController");

// POST /api/package - Add new package (admin only)
router.post("/", authenticateToken, authorizeAdmin, addPackage);
// GET /api/packages - Get all packages
router.get("/", authenticateToken, authorizeAdmin, getAllPackages);

module.exports = router;
