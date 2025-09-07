const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");
const {
  addInventory,
  getAllInventory,
  getPublicInventory,
  updateInventory,
  deleteInventory,
} = require("../controllers/inventoryController");

// POST /api/inventory - Add new inventory item (admin only)
router.post("/", authenticateToken, authorizeAdmin, addInventory);
// GET /api/inventory - Get all inventory items (admin only)
router.get("/", authenticateToken, authorizeAdmin, getAllInventory);
// GET /api/inventory/public - Get all inventory items (public for clients)
router.get("/public", getPublicInventory);
// PUT /api/inventory/:id - Update inventory item (admin only)
router.put("/:id", authenticateToken, authorizeAdmin, updateInventory);
// DELETE /api/inventory/:id - Delete inventory item (admin only)
router.delete("/:id", authenticateToken, authorizeAdmin, deleteInventory);

module.exports = router;
