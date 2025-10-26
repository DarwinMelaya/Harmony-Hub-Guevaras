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
  logMaintenance,
  getMaintenanceDue,
  getMaintenanceHistory,
} = require("../controllers/inventoryController");

// POST /api/inventory - Add new inventory item (owner/admin/staff only)
router.post("/", authenticateToken, authorizeOwnerOrAdmin, addInventory);
// GET /api/inventory - Get all inventory items (owner/admin/staff only)
router.get("/", authenticateToken, authorizeOwnerOrAdmin, getAllInventory);
// GET /api/inventory/public - Get all inventory items (public for clients)
router.get("/public", getPublicInventory);
// GET /api/inventory/maintenance-due - Get items needing maintenance (owner/admin/staff only)
router.get(
  "/maintenance-due",
  authenticateToken,
  authorizeOwnerOrAdmin,
  getMaintenanceDue
);
// PUT /api/inventory/:id - Update inventory item (owner/admin/staff only)
router.put("/:id", authenticateToken, authorizeOwnerOrAdmin, updateInventory);
// DELETE /api/inventory/:id - Delete inventory item (owner/admin/staff only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeOwnerOrAdmin,
  deleteInventory
);
// POST /api/inventory/:id/maintenance - Log maintenance for item (owner/admin/staff only)
router.post(
  "/:id/maintenance",
  authenticateToken,
  authorizeOwnerOrAdmin,
  logMaintenance
);
// GET /api/inventory/:id/maintenance - Get maintenance history for item (owner/admin/staff only)
router.get(
  "/:id/maintenance",
  authenticateToken,
  authorizeOwnerOrAdmin,
  getMaintenanceHistory
);

module.exports = router;
