const express = require("express");
const router = express.Router();
const {
  getSummaryReport,
  getBookingReport,
  getInventoryReport,
  getPackageReport,
  getRevenueReport,
  getEarningsReport,
  downloadSummaryReportPDF,
  downloadBookingReportPDF,
  downloadInventoryReportPDF,
  downloadPackageReportPDF,
  downloadRevenueReportPDF,
  downloadEarningsReportPDF,
} = require("../controllers/reportsController");
const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../utils/roles");

// All routes require authentication
router.use(authenticateToken);

// All routes require owner or admin role
router.use(requireRole(["owner", "admin"]));

// Get summary/dashboard report
router.get("/summary", getSummaryReport);

// Get booking reports
router.get("/bookings", getBookingReport);

// Get inventory reports
router.get("/inventory", getInventoryReport);

// Get package reports
router.get("/packages", getPackageReport);

// Get revenue reports
router.get("/revenue", getRevenueReport);

// Get earnings reports
router.get("/earnings", getEarningsReport);

// PDF Download Routes
router.get("/summary/pdf", downloadSummaryReportPDF);
router.get("/bookings/pdf", downloadBookingReportPDF);
router.get("/inventory/pdf", downloadInventoryReportPDF);
router.get("/packages/pdf", downloadPackageReportPDF);
router.get("/revenue/pdf", downloadRevenueReportPDF);
router.get("/earnings/pdf", downloadEarningsReportPDF);

module.exports = router;

