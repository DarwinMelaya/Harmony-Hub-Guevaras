const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeOwnerOrAdmin,
} = require("../middleware/auth");
const {
  addUnit,
  getAllUnits,
  updateUnit,
  deleteUnit,
} = require("../controllers/unitsController");

// POST /api/units - Add new unit (owner/admin/staff only)
router.post("/", authenticateToken, authorizeOwnerOrAdmin, addUnit);

// GET /api/units - Get all units (owner/admin/staff only)
router.get("/", authenticateToken, authorizeOwnerOrAdmin, getAllUnits);

// PUT /api/units/:id - Update unit (owner/admin/staff only)
router.put("/:id", authenticateToken, authorizeOwnerOrAdmin, updateUnit);

// DELETE /api/units/:id - Delete unit (owner/admin/staff only)
router.delete("/:id", authenticateToken, authorizeOwnerOrAdmin, deleteUnit);

module.exports = router;

