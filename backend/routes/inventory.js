const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeOwnerOrAdmin,
} = require("../middleware/auth");
const {
  addInventory,
  getAllInventory,
  getPublicInventory,
  updateInventory,
  deleteInventory,
} = require("../controllers/inventoryController");

// POST /api/inventory - Add new inventory item (owner/admin only)
router.post("/", authenticateToken, authorizeOwnerOrAdmin, addInventory);
// GET /api/inventory - Get all inventory items (owner/admin only)
router.get("/", authenticateToken, authorizeOwnerOrAdmin, getAllInventory);
// GET /api/inventory/public - Get all inventory items (public for clients)
router.get("/public", getPublicInventory);
// PUT /api/inventory/:id - Update inventory item (owner/admin only)
router.put("/:id", authenticateToken, authorizeOwnerOrAdmin, updateInventory);
// DELETE /api/inventory/:id - Delete inventory item (owner/admin only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeOwnerOrAdmin,
  deleteInventory
);

module.exports = router;
