const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");
const {
  addPackage,
  getAllPackages,
  getPublicPackages,
  updatePackage,
  deletePackage,
} = require("../controllers/packagesController");

// POST /api/package - Add new package (admin only)
router.post("/", authenticateToken, authorizeAdmin, addPackage);
// GET /api/packages - Get all packages (admin only)
router.get("/", authenticateToken, authorizeAdmin, getAllPackages);
// GET /api/packages/public - Get all packages (public for clients)
router.get("/public", getPublicPackages);
// PUT /api/packages/:id - Update package (admin only)
router.put("/:id", authenticateToken, authorizeAdmin, updatePackage);
// DELETE /api/packages/:id - Delete package (admin only)
router.delete("/:id", authenticateToken, authorizeAdmin, deletePackage);

module.exports = router;
