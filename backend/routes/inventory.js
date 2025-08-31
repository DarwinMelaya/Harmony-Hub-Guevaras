const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");
const {
  addInventory,
  getAllInventory,
} = require("../controllers/inventoryController");

// POST /api/inventory - Add new inventory item (admin only)
router.post("/", authenticateToken, authorizeAdmin, addInventory);
// GET /api/inventory - Get all inventory items
router.get("/", authenticateToken, authorizeAdmin, getAllInventory);

module.exports = router;
