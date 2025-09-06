const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");
const {
  addInventory,
  getAllInventory,
  getPublicInventory,
} = require("../controllers/inventoryController");

// POST /api/inventory - Add new inventory item (admin only)
router.post("/", authenticateToken, authorizeAdmin, addInventory);
// GET /api/inventory - Get all inventory items (admin only)
router.get("/", authenticateToken, authorizeAdmin, getAllInventory);
// GET /api/inventory/public - Get all inventory items (public for clients)
router.get("/public", getPublicInventory);

module.exports = router;
