const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeOwnerOrAdmin,
} = require("../middleware/auth");
const {
  getPublicPaymentInfos,
  createPaymentInfo,
  getPaymentInfos,
  updatePaymentInfo,
  deletePaymentInfo,
} = require("../controllers/paymentInfoController");

// Public route for clients to view active payment info
router.get("/public", getPublicPaymentInfos);

router.get("/", authenticateToken, authorizeOwnerOrAdmin, getPaymentInfos);
router.post("/", authenticateToken, authorizeOwnerOrAdmin, createPaymentInfo);
router.put("/:id", authenticateToken, authorizeOwnerOrAdmin, updatePaymentInfo);
router.delete(
  "/:id",
  authenticateToken,
  authorizeOwnerOrAdmin,
  deletePaymentInfo
);

module.exports = router;

