const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeOwnerOrAdmin,
} = require("../middleware/auth");
const {
  addPackage,
  getAllPackages,
  getPublicPackages,
  updatePackage,
  deletePackage,
} = require("../controllers/packagesController");

// POST /api/package - Add new package (owner/admin only)
router.post("/", authenticateToken, authorizeOwnerOrAdmin, addPackage);
// GET /api/packages - Get all packages (owner/admin only)
router.get("/", authenticateToken, authorizeOwnerOrAdmin, getAllPackages);
// GET /api/packages/public - Get all packages (public for clients)
router.get("/public", getPublicPackages);
// PUT /api/packages/:id - Update package (owner/admin only)
router.put("/:id", authenticateToken, authorizeOwnerOrAdmin, updatePackage);
// DELETE /api/packages/:id - Delete package (owner/admin only)
router.delete("/:id", authenticateToken, authorizeOwnerOrAdmin, deletePackage);

module.exports = router;
