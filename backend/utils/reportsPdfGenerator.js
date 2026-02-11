const PDFDocument = require("pdfkit");

// Helper function to draw table cell
const drawCell = (doc, x, y, width, height, text, options = {}) => {
  const {
    bold = false,
    fontSize = 9,
    align = "left",
    fillColor = "#ffffff",
    textColor = "#000000",
    border = true,
  } = options;

  // Draw cell background
  if (fillColor !== "#ffffff") {
    doc.rect(x, y, width, height).fill(fillColor);
  }

  // Draw cell border
  if (border) {
    doc.rect(x, y, width, height).stroke("#000000");
  }

  // Draw text
  doc
    .fontSize(fontSize)
    .fillColor(textColor)
    .font(bold ? "Helvetica-Bold" : "Helvetica");

  const textY = y + height / 2 - fontSize / 2;
  const padding = 5;

  if (align === "center") {
    doc.text(text, x + padding, textY, {
      width: width - padding * 2,
      align: "center",
    });
  } else if (align === "right") {
    doc.text(text, x + padding, textY, {
      width: width - padding * 2,
      align: "right",
    });
  } else {
    doc.text(text, x + padding, textY, {
      width: width - padding * 2,
      align: "left",
    });
  }
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount || 0);
};

// Format date
const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Generate Summary Report PDF
const generateSummaryReportPDF = (reportData, filters, res) => {
  try {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=summary-report-${Date.now()}.pdf`
    );
    doc.pipe(res);

    let currentY = 60;
    const tableX = 40;
    const tableWidth = 515;
    const cellHeight = 20;

    // Header
    doc
      .fontSize(24)
      .fillColor("#ea580c")
      .font("Helvetica-Bold")
      .text("GUEVARRA LIGHTS AND SOUNDS", tableX, currentY, {
        align: "center",
        width: tableWidth,
      });

    currentY += 30;
    doc
      .fontSize(18)
      .fillColor("#000000")
      .text("SUMMARY REPORT", tableX, currentY, {
        align: "center",
        width: tableWidth,
      });

    currentY += 30;
    doc
      .fontSize(10)
      .fillColor("#666666")
      .text(
        `Generated: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        tableX,
        currentY,
        { align: "center", width: tableWidth }
      );

    currentY += 30;

    // Summary Statistics
    doc
      .fontSize(14)
      .fillColor("#000000")
      .font("Helvetica-Bold")
      .text("Summary Statistics", tableX, currentY);
    currentY += 25;

    const stats = [
      ["Total Bookings", reportData.summary.totalBookings.toString()],
      ["Total Users", reportData.summary.totalUsers.toString()],
      ["Total Inventory", reportData.summary.totalInventory.toString()],
      ["Total Packages", reportData.summary.totalPackages.toString()],
    ];

    stats.forEach(([label, value]) => {
      drawCell(doc, tableX, currentY, 250, cellHeight, label, {
        bold: true,
        fontSize: 10,
      });
      drawCell(doc, tableX + 250, currentY, 265, cellHeight, value, {
        fontSize: 10,
      });
      currentY += cellHeight;
    });

    currentY += 15;

    // Revenue Statistics
    doc
      .fontSize(14)
      .fillColor("#000000")
      .font("Helvetica-Bold")
      .text("Revenue Statistics", tableX, currentY);
    currentY += 25;

    const revenueStats = [
      ["Total Revenue", formatCurrency(reportData.revenue.totalRevenue)],
      [
        "Total Downpayment",
        formatCurrency(reportData.revenue.totalDownpayment),
      ],
      [
        "Remaining Balance",
        formatCurrency(reportData.revenue.totalRemainingBalance),
      ],
      [
        "Average Booking Value",
        formatCurrency(reportData.revenue.averageBookingValue),
      ],
    ];

    revenueStats.forEach(([label, value]) => {
      drawCell(doc, tableX, currentY, 250, cellHeight, label, {
        bold: true,
        fontSize: 10,
      });
      drawCell(doc, tableX + 250, currentY, 265, cellHeight, value, {
        fontSize: 10,
      });
      currentY += cellHeight;
    });

    currentY += 15;

    // Bookings by Status
    if (reportData.bookings.byStatus.length > 0) {
      doc
        .fontSize(14)
        .fillColor("#000000")
        .font("Helvetica-Bold")
        .text("Bookings by Status", tableX, currentY);
      currentY += 25;

      drawCell(doc, tableX, currentY, 200, cellHeight, "Status", {
        bold: true,
        fontSize: 10,
        fillColor: "#d1d5db",
      });
      drawCell(doc, tableX + 200, currentY, 157, cellHeight, "Count", {
        bold: true,
        fontSize: 10,
        fillColor: "#d1d5db",
        align: "center",
      });
      drawCell(doc, tableX + 357, currentY, 158, cellHeight, "Revenue", {
        bold: true,
        fontSize: 10,
        fillColor: "#d1d5db",
        align: "right",
      });
      currentY += cellHeight;

      reportData.bookings.byStatus.forEach((item) => {
        drawCell(
          doc,
          tableX,
          currentY,
          200,
          cellHeight,
          item._id.toUpperCase(),
          {
            fontSize: 9,
          }
        );
        drawCell(
          doc,
          tableX + 200,
          currentY,
          157,
          cellHeight,
          item.count.toString(),
          {
            fontSize: 9,
            align: "center",
          }
        );
        drawCell(
          doc,
          tableX + 357,
          currentY,
          158,
          cellHeight,
          formatCurrency(item.totalRevenue),
          {
            fontSize: 9,
            align: "right",
          }
        );
        currentY += cellHeight;
      });

      currentY += 15;
    }

    // Users by Role
    if (reportData.users.byRole.length > 0) {
      doc
        .fontSize(14)
        .fillColor("#000000")
        .font("Helvetica-Bold")
        .text("Users by Role", tableX, currentY);
      currentY += 25;

      drawCell(doc, tableX, currentY, 200, cellHeight, "Role", {
        bold: true,
        fontSize: 10,
        fillColor: "#d1d5db",
      });
      drawCell(doc, tableX + 200, currentY, 157, cellHeight, "Total", {
        bold: true,
        fontSize: 10,
        fillColor: "#d1d5db",
        align: "center",
      });
      drawCell(
        doc,
        tableX + 357,
        currentY,
        158,
        cellHeight,
        "Active/Inactive",
        {
          bold: true,
          fontSize: 10,
          fillColor: "#d1d5db",
          align: "center",
        }
      );
      currentY += cellHeight;

      reportData.users.byRole.forEach((item) => {
        drawCell(
          doc,
          tableX,
          currentY,
          200,
          cellHeight,
          item._id.toUpperCase(),
          {
            fontSize: 9,
          }
        );
        drawCell(
          doc,
          tableX + 200,
          currentY,
          157,
          cellHeight,
          item.count.toString(),
          {
            fontSize: 9,
            align: "center",
          }
        );
        drawCell(
          doc,
          tableX + 357,
          currentY,
          158,
          cellHeight,
          `${item.active}/${item.inactive}`,
          {
            fontSize: 9,
            align: "center",
          }
        );
        currentY += cellHeight;
      });
    }

    doc.end();
  } catch (error) {
    console.error("Error generating summary report PDF:", error);
    throw error;
  }
};

// Generate Booking Report PDF
const generateBookingReportPDF = (reportData, filters, res) => {
  try {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=booking-report-${Date.now()}.pdf`
    );
    doc.pipe(res);

    let currentY = 60;
    const tableX = 40;
    const tableWidth = 515;
    const cellHeight = 20;

    // Header
    doc
      .fontSize(24)
      .fillColor("#ea580c")
      .font("Helvetica-Bold")
      .text("GUEVARRA LIGHTS AND SOUNDS", tableX, currentY, {
        align: "center",
        width: tableWidth,
      });

    currentY += 30;
    doc
      .fontSize(18)
      .fillColor("#000000")
      .text("BOOKING REPORT", tableX, currentY, {
        align: "center",
        width: tableWidth,
      });

    currentY += 30;
    doc
      .fontSize(10)
      .fillColor("#666666")
      .text(
        `Generated: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        tableX,
        currentY,
        { align: "center", width: tableWidth }
      );

    currentY += 30;

    // Statistics
    doc
      .fontSize(14)
      .fillColor("#000000")
      .font("Helvetica-Bold")
      .text("Statistics", tableX, currentY);
    currentY += 25;

    const stats = [
      ["Total Bookings", reportData.statistics.totalBookings.toString()],
      ["Total Revenue", formatCurrency(reportData.statistics.totalRevenue)],
      [
        "Total Downpayment",
        formatCurrency(reportData.statistics.totalDownpayment),
      ],
      [
        "Remaining Balance",
        formatCurrency(reportData.statistics.totalRemainingBalance),
      ],
      [
        "Average Booking Value",
        formatCurrency(reportData.statistics.averageBookingValue),
      ],
      [
        "Min Booking Value",
        formatCurrency(reportData.statistics.minBookingValue),
      ],
      [
        "Max Booking Value",
        formatCurrency(reportData.statistics.maxBookingValue),
      ],
    ];

    stats.forEach(([label, value]) => {
      drawCell(doc, tableX, currentY, 250, cellHeight, label, {
        bold: true,
        fontSize: 10,
      });
      drawCell(doc, tableX + 250, currentY, 265, cellHeight, value, {
        fontSize: 10,
      });
      currentY += cellHeight;
    });

    currentY += 15;

    // Bookings Table
    if (reportData.bookings.length > 0) {
      doc
        .fontSize(14)
        .fillColor("#000000")
        .font("Helvetica-Bold")
        .text("Bookings", tableX, currentY);
      currentY += 25;

      // Table Header
      drawCell(doc, tableX, currentY, 120, cellHeight, "User", {
        bold: true,
        fontSize: 9,
        fillColor: "#d1d5db",
      });
      drawCell(doc, tableX + 120, currentY, 100, cellHeight, "Amount", {
        bold: true,
        fontSize: 9,
        fillColor: "#d1d5db",
        align: "right",
      });
      drawCell(doc, tableX + 220, currentY, 100, cellHeight, "Status", {
        bold: true,
        fontSize: 9,
        fillColor: "#d1d5db",
        align: "center",
      });
      drawCell(doc, tableX + 320, currentY, 100, cellHeight, "Date", {
        bold: true,
        fontSize: 9,
        fillColor: "#d1d5db",
        align: "center",
      });
      drawCell(doc, tableX + 420, currentY, 95, cellHeight, "Payment", {
        bold: true,
        fontSize: 9,
        fillColor: "#d1d5db",
        align: "center",
      });
      currentY += cellHeight;

      // Limit to first 20 bookings to avoid PDF being too long
      const bookingsToShow = reportData.bookings.slice(0, 20);
      bookingsToShow.forEach((booking) => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 60;
        }

        drawCell(
          doc,
          tableX,
          currentY,
          120,
          cellHeight,
          booking.user?.fullName || "N/A",
          {
            fontSize: 8,
          }
        );
        drawCell(
          doc,
          tableX + 120,
          currentY,
          100,
          cellHeight,
          formatCurrency(booking.totalAmount),
          {
            fontSize: 8,
            align: "right",
          }
        );
        drawCell(
          doc,
          tableX + 220,
          currentY,
          100,
          cellHeight,
          booking.status.toUpperCase(),
          {
            fontSize: 8,
            align: "center",
          }
        );
        drawCell(
          doc,
          tableX + 320,
          currentY,
          100,
          cellHeight,
          formatDate(booking.bookingDate),
          {
            fontSize: 8,
            align: "center",
          }
        );
        drawCell(
          doc,
          tableX + 420,
          currentY,
          95,
          cellHeight,
          booking.paymentMethod?.toUpperCase() || "N/A",
          {
            fontSize: 8,
            align: "center",
          }
        );
        currentY += cellHeight;
      });

      if (reportData.bookings.length > 20) {
        currentY += 10;
        doc
          .fontSize(9)
          .fillColor("#666666")
          .text(
            `... and ${reportData.bookings.length - 20} more bookings`,
            tableX,
            currentY,
            { align: "center", width: tableWidth }
          );
      }
    }

    doc.end();
  } catch (error) {
    console.error("Error generating booking report PDF:", error);
    throw error;
  }
};

// Generate Inventory Report PDF
const generateInventoryReportPDF = (reportData, filters, res) => {
  try {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=inventory-report-${Date.now()}.pdf`
    );
    doc.pipe(res);

    let currentY = 60;
    const tableX = 40;
    const tableWidth = 515;
    const cellHeight = 20;

    // Header
    doc
      .fontSize(24)
      .fillColor("#ea580c")
      .font("Helvetica-Bold")
      .text("GUEVARRA LIGHTS AND SOUNDS", tableX, currentY, {
        align: "center",
        width: tableWidth,
      });

    currentY += 30;
    doc
      .fontSize(18)
      .fillColor("#000000")
      .text("INVENTORY REPORT", tableX, currentY, {
        align: "center",
        width: tableWidth,
      });

    currentY += 30;
    doc
      .fontSize(10)
      .fillColor("#666666")
      .text(
        `Generated: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        tableX,
        currentY,
        { align: "center", width: tableWidth }
      );

    currentY += 30;

    // Statistics
    doc
      .fontSize(14)
      .fillColor("#000000")
      .font("Helvetica-Bold")
      .text("Statistics", tableX, currentY);
    currentY += 25;

    const stats = [
      ["Total Items", reportData.statistics.totalItems.toString()],
      ["Total Quantity", reportData.statistics.totalQuantity.toString()],
      ["Total Value", formatCurrency(reportData.statistics.totalValue)],
      ["Average Price", formatCurrency(reportData.statistics.averagePrice)],
    ];

    stats.forEach(([label, value]) => {
      drawCell(doc, tableX, currentY, 250, cellHeight, label, {
        bold: true,
        fontSize: 10,
      });
      drawCell(doc, tableX + 250, currentY, 265, cellHeight, value, {
        fontSize: 10,
      });
      currentY += cellHeight;
    });

    currentY += 15;

    // Inventory Table
    if (reportData.inventory.length > 0) {
      doc
        .fontSize(14)
        .fillColor("#000000")
        .font("Helvetica-Bold")
        .text("Inventory Items", tableX, currentY);
      currentY += 25;

      // Table Header
      drawCell(doc, tableX, currentY, 200, cellHeight, "Name", {
        bold: true,
        fontSize: 9,
        fillColor: "#d1d5db",
      });
      drawCell(doc, tableX + 200, currentY, 80, cellHeight, "Quantity", {
        bold: true,
        fontSize: 9,
        fillColor: "#d1d5db",
        align: "center",
      });
      drawCell(doc, tableX + 280, currentY, 100, cellHeight, "Price", {
        bold: true,
        fontSize: 9,
        fillColor: "#d1d5db",
        align: "right",
      });
      drawCell(doc, tableX + 380, currentY, 70, cellHeight, "Status", {
        bold: true,
        fontSize: 9,
        fillColor: "#d1d5db",
        align: "center",
      });
      drawCell(doc, tableX + 450, currentY, 65, cellHeight, "Condition", {
        bold: true,
        fontSize: 9,
        fillColor: "#d1d5db",
        align: "center",
      });
      currentY += cellHeight;

      // Limit to first 25 items
      const itemsToShow = reportData.inventory.slice(0, 25);
      itemsToShow.forEach((item) => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 60;
        }

        drawCell(doc, tableX, currentY, 200, cellHeight, item.name || "N/A", {
          fontSize: 8,
        });
        drawCell(
          doc,
          tableX + 200,
          currentY,
          80,
          cellHeight,
          item.quantity.toString(),
          {
            fontSize: 8,
            align: "center",
          }
        );
        drawCell(
          doc,
          tableX + 280,
          currentY,
          100,
          cellHeight,
          formatCurrency(item.price),
          {
            fontSize: 8,
            align: "right",
          }
        );
        drawCell(
          doc,
          tableX + 380,
          currentY,
          70,
          cellHeight,
          item.status.toUpperCase(),
          {
            fontSize: 8,
            align: "center",
          }
        );
        drawCell(
          doc,
          tableX + 450,
          currentY,
          65,
          cellHeight,
          item.condition.toUpperCase(),
          {
            fontSize: 8,
            align: "center",
          }
        );
        currentY += cellHeight;
      });

      if (reportData.inventory.length > 25) {
        currentY += 10;
        doc
          .fontSize(9)
          .fillColor("#666666")
          .text(
            `... and ${reportData.inventory.length - 25} more items`,
            tableX,
            currentY,
            { align: "center", width: tableWidth }
          );
      }
    }

    doc.end();
  } catch (error) {
    console.error("Error generating inventory report PDF:", error);
    throw error;
  }
};

// Generate Package Report PDF
const generatePackageReportPDF = (reportData, filters, res) => {
  try {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=package-report-${Date.now()}.pdf`
    );
    doc.pipe(res);

    let currentY = 60;
    const tableX = 40;
    const tableWidth = 515;
    const cellHeight = 20;

    // Header
    doc
      .fontSize(24)
      .fillColor("#ea580c")
      .font("Helvetica-Bold")
      .text("GUEVARRA LIGHTS AND SOUNDS", tableX, currentY, {
        align: "center",
        width: tableWidth,
      });

    currentY += 30;
    doc
      .fontSize(18)
      .fillColor("#000000")
      .text("PACKAGE REPORT", tableX, currentY, {
        align: "center",
        width: tableWidth,
      });

    currentY += 30;
    doc
      .fontSize(10)
      .fillColor("#666666")
      .text(
        `Generated: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        tableX,
        currentY,
        { align: "center", width: tableWidth }
      );

    currentY += 30;

    // Statistics
    doc
      .fontSize(14)
      .fillColor("#000000")
      .font("Helvetica-Bold")
      .text("Statistics", tableX, currentY);
    currentY += 25;

    const stats = [
      ["Total Packages", reportData.statistics.totalPackages.toString()],
      ["Available", reportData.statistics.availablePackages.toString()],
      ["Unavailable", reportData.statistics.unavailablePackages.toString()],
      ["Average Price", formatCurrency(reportData.statistics.averagePrice)],
      ["Min Price", formatCurrency(reportData.statistics.minPrice)],
      ["Max Price", formatCurrency(reportData.statistics.maxPrice)],
    ];

    stats.forEach(([label, value]) => {
      drawCell(doc, tableX, currentY, 250, cellHeight, label, {
        bold: true,
        fontSize: 10,
      });
      drawCell(doc, tableX + 250, currentY, 265, cellHeight, value, {
        fontSize: 10,
      });
      currentY += cellHeight;
    });

    currentY += 15;

    // Packages Table
    if (reportData.packages.length > 0) {
      doc
        .fontSize(14)
        .fillColor("#000000")
        .font("Helvetica-Bold")
        .text("Packages", tableX, currentY);
      currentY += 25;

      // Table Header
      drawCell(doc, tableX, currentY, 300, cellHeight, "Name", {
        bold: true,
        fontSize: 9,
        fillColor: "#d1d5db",
      });
      drawCell(doc, tableX + 300, currentY, 100, cellHeight, "Price", {
        bold: true,
        fontSize: 9,
        fillColor: "#d1d5db",
        align: "right",
      });
      drawCell(doc, tableX + 400, currentY, 115, cellHeight, "Status", {
        bold: true,
        fontSize: 9,
        fillColor: "#d1d5db",
        align: "center",
      });
      currentY += cellHeight;

      reportData.packages.forEach((pkg) => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 60;
        }

        drawCell(doc, tableX, currentY, 300, cellHeight, pkg.name || "N/A", {
          fontSize: 8,
        });
        drawCell(
          doc,
          tableX + 300,
          currentY,
          100,
          cellHeight,
          formatCurrency(pkg.price),
          {
            fontSize: 8,
            align: "right",
          }
        );
        drawCell(
          doc,
          tableX + 400,
          currentY,
          115,
          cellHeight,
          pkg.isAvailable ? "AVAILABLE" : "UNAVAILABLE",
          {
            fontSize: 8,
            align: "center",
          }
        );
        currentY += cellHeight;
      });
    }

    doc.end();
  } catch (error) {
    console.error("Error generating package report PDF:", error);
    throw error;
  }
};

// Generate Revenue Report PDF
const generateRevenueReportPDF = (reportData, filters, res) => {
  try {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=revenue-report-${Date.now()}.pdf`
    );
    doc.pipe(res);

    let currentY = 60;
    const tableX = 40;
    const tableWidth = 515;
    const cellHeight = 20;

    // Header
    doc
      .fontSize(24)
      .fillColor("#ea580c")
      .font("Helvetica-Bold")
      .text("GUEVARRA LIGHTS AND SOUNDS", tableX, currentY, {
        align: "center",
        width: tableWidth,
      });

    currentY += 30;
    doc
      .fontSize(18)
      .fillColor("#000000")
      .text("REVENUE REPORT", tableX, currentY, {
        align: "center",
        width: tableWidth,
      });

    currentY += 30;
    doc
      .fontSize(10)
      .fillColor("#666666")
      .text(
        `Generated: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        tableX,
        currentY,
        { align: "center", width: tableWidth }
      );

    currentY += 30;

    // Statistics
    doc
      .fontSize(14)
      .fillColor("#000000")
      .font("Helvetica-Bold")
      .text("Statistics", tableX, currentY);
    currentY += 25;

    const stats = [
      ["Total Revenue", formatCurrency(reportData.statistics.totalRevenue)],
      [
        "Total Downpayment",
        formatCurrency(reportData.statistics.totalDownpayment),
      ],
      [
        "Remaining Balance",
        formatCurrency(reportData.statistics.totalRemainingBalance),
      ],
      ["Total Bookings", reportData.statistics.totalBookings.toString()],
      [
        "Average Booking Value",
        formatCurrency(reportData.statistics.averageBookingValue),
      ],
    ];

    stats.forEach(([label, value]) => {
      drawCell(doc, tableX, currentY, 250, cellHeight, label, {
        bold: true,
        fontSize: 10,
      });
      drawCell(doc, tableX + 250, currentY, 265, cellHeight, value, {
        fontSize: 10,
      });
      currentY += cellHeight;
    });

    currentY += 15;

    // Revenue by Payment Method
    if (reportData.byPaymentMethod.length > 0) {
      doc
        .fontSize(14)
        .fillColor("#000000")
        .font("Helvetica-Bold")
        .text("Revenue by Payment Method", tableX, currentY);
      currentY += 25;

      drawCell(doc, tableX, currentY, 200, cellHeight, "Payment Method", {
        bold: true,
        fontSize: 10,
        fillColor: "#d1d5db",
      });
      drawCell(doc, tableX + 200, currentY, 150, cellHeight, "Revenue", {
        bold: true,
        fontSize: 10,
        fillColor: "#d1d5db",
        align: "right",
      });
      drawCell(doc, tableX + 350, currentY, 165, cellHeight, "Bookings", {
        bold: true,
        fontSize: 10,
        fillColor: "#d1d5db",
        align: "center",
      });
      currentY += cellHeight;

      reportData.byPaymentMethod.forEach((item) => {
        drawCell(
          doc,
          tableX,
          currentY,
          200,
          cellHeight,
          item._id.toUpperCase(),
          {
            fontSize: 9,
          }
        );
        drawCell(
          doc,
          tableX + 200,
          currentY,
          150,
          cellHeight,
          formatCurrency(item.totalRevenue),
          {
            fontSize: 9,
            align: "right",
          }
        );
        drawCell(
          doc,
          tableX + 350,
          currentY,
          165,
          cellHeight,
          item.bookingCount.toString(),
          {
            fontSize: 9,
            align: "center",
          }
        );
        currentY += cellHeight;
      });

      currentY += 15;
    }

    // Revenue by Month
    if (reportData.byMonth.length > 0) {
      doc
        .fontSize(14)
        .fillColor("#000000")
        .font("Helvetica-Bold")
        .text("Revenue by Month", tableX, currentY);
      currentY += 25;

      drawCell(doc, tableX, currentY, 200, cellHeight, "Month", {
        bold: true,
        fontSize: 10,
        fillColor: "#d1d5db",
      });
      drawCell(doc, tableX + 200, currentY, 150, cellHeight, "Revenue", {
        bold: true,
        fontSize: 10,
        fillColor: "#d1d5db",
        align: "right",
      });
      drawCell(doc, tableX + 350, currentY, 165, cellHeight, "Bookings", {
        bold: true,
        fontSize: 10,
        fillColor: "#d1d5db",
        align: "center",
      });
      currentY += cellHeight;

      reportData.byMonth.forEach((item) => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 60;
        }

        const monthName = new Date(
          item._id.year,
          item._id.month - 1
        ).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });

        drawCell(doc, tableX, currentY, 200, cellHeight, monthName, {
          fontSize: 9,
        });
        drawCell(
          doc,
          tableX + 200,
          currentY,
          150,
          cellHeight,
          formatCurrency(item.totalRevenue),
          {
            fontSize: 9,
            align: "right",
          }
        );
        drawCell(
          doc,
          tableX + 350,
          currentY,
          165,
          cellHeight,
          item.bookingCount.toString(),
          {
            fontSize: 9,
            align: "center",
          }
        );
        currentY += cellHeight;
      });
    }

    doc.end();
  } catch (error) {
    console.error("Error generating revenue report PDF:", error);
    throw error;
  }
};

// Generate Earnings Report PDF
const generateEarningsReportPDF = (reportData, filters, res) => {
  try {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=earnings-report-${Date.now()}.pdf`
    );
    doc.pipe(res);

    let currentY = 60;
    const tableX = 40;
    const tableWidth = 515;
    const cellHeight = 20;

    // Header
    doc
      .fontSize(24)
      .fillColor("#ea580c")
      .font("Helvetica-Bold")
      .text("GUEVARRA LIGHTS AND SOUNDS", tableX, currentY, {
        align: "center",
        width: tableWidth,
      });

    currentY += 30;
    doc
      .fontSize(18)
      .fillColor("#000000")
      .text("EARNINGS REPORT", tableX, currentY, {
        align: "center",
        width: tableWidth,
      });

    currentY += 30;
    doc
      .fontSize(10)
      .fillColor("#666666")
      .text(
        `Generated: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        tableX,
        currentY,
        { align: "center", width: tableWidth }
      );

    currentY += 30;

    // Statistics
    doc
      .fontSize(14)
      .fillColor("#000000")
      .font("Helvetica-Bold")
      .text("Statistics", tableX, currentY);
    currentY += 25;

    const stats = [
      ["Total Earnings", formatCurrency(reportData.statistics.totalEarnings)],
      [
        "Total Downpayment",
        formatCurrency(reportData.statistics.totalDownpayment),
      ],
      [
        "Remaining Balance",
        formatCurrency(reportData.statistics.totalRemainingBalance),
      ],
      ["Total Bookings", reportData.statistics.totalBookings.toString()],
      [
        "Average Booking Value",
        formatCurrency(reportData.statistics.averageBookingValue),
      ],
    ];

    stats.forEach(([label, value]) => {
      drawCell(doc, tableX, currentY, 250, cellHeight, label, {
        bold: true,
        fontSize: 10,
      });
      drawCell(doc, tableX + 250, currentY, 265, cellHeight, value, {
        fontSize: 10,
      });
      currentY += cellHeight;
    });

    currentY += 15;

    // Earnings by Payment Method
    if (reportData.byPaymentMethod.length > 0) {
      doc
        .fontSize(14)
        .fillColor("#000000")
        .font("Helvetica-Bold")
        .text("Earnings by Payment Method", tableX, currentY);
      currentY += 25;

      drawCell(doc, tableX, currentY, 200, cellHeight, "Payment Method", {
        bold: true,
        fontSize: 10,
        fillColor: "#d1d5db",
      });
      drawCell(doc, tableX + 200, currentY, 150, cellHeight, "Earnings", {
        bold: true,
        fontSize: 10,
        fillColor: "#d1d5db",
        align: "right",
      });
      drawCell(doc, tableX + 350, currentY, 165, cellHeight, "Bookings", {
        bold: true,
        fontSize: 10,
        fillColor: "#d1d5db",
        align: "center",
      });
      currentY += cellHeight;

      reportData.byPaymentMethod.forEach((item) => {
        drawCell(
          doc,
          tableX,
          currentY,
          200,
          cellHeight,
          item._id.toUpperCase(),
          {
            fontSize: 9,
          }
        );
        drawCell(
          doc,
          tableX + 200,
          currentY,
          150,
          cellHeight,
          formatCurrency(item.totalEarnings),
          {
            fontSize: 9,
            align: "right",
          }
        );
        drawCell(
          doc,
          tableX + 350,
          currentY,
          165,
          cellHeight,
          item.bookingCount.toString(),
          {
            fontSize: 9,
            align: "center",
          }
        );
        currentY += cellHeight;
      });

      currentY += 15;
    }

    // Earnings by Period (Day/Month/Year)
    if (reportData.byPeriod.length > 0) {
      const periodLabel =
        reportData.filterBy === "day"
          ? "Day"
          : reportData.filterBy === "month"
          ? "Month"
          : "Year";
      doc
        .fontSize(14)
        .fillColor("#000000")
        .font("Helvetica-Bold")
        .text(`Earnings by ${periodLabel}`, tableX, currentY);
      currentY += 25;

      drawCell(doc, tableX, currentY, 200, cellHeight, periodLabel, {
        bold: true,
        fontSize: 10,
        fillColor: "#d1d5db",
      });
      drawCell(doc, tableX + 200, currentY, 150, cellHeight, "Earnings", {
        bold: true,
        fontSize: 10,
        fillColor: "#d1d5db",
        align: "right",
      });
      drawCell(doc, tableX + 350, currentY, 165, cellHeight, "Bookings", {
        bold: true,
        fontSize: 10,
        fillColor: "#d1d5db",
        align: "center",
      });
      currentY += cellHeight;

      reportData.byPeriod.forEach((item) => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 60;
        }

        let periodName = "";
        if (reportData.filterBy === "day") {
          periodName = new Date(
            item._id.year,
            item._id.month - 1,
            item._id.day
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        } else if (reportData.filterBy === "month") {
          periodName = new Date(
            item._id.year,
            item._id.month - 1
          ).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          });
        } else {
          periodName = item._id.year.toString();
        }

        drawCell(doc, tableX, currentY, 200, cellHeight, periodName, {
          fontSize: 9,
        });
        drawCell(
          doc,
          tableX + 200,
          currentY,
          150,
          cellHeight,
          formatCurrency(item.totalEarnings),
          {
            fontSize: 9,
            align: "right",
          }
        );
        drawCell(
          doc,
          tableX + 350,
          currentY,
          165,
          cellHeight,
          item.bookingCount.toString(),
          {
            fontSize: 9,
            align: "center",
          }
        );
        currentY += cellHeight;
      });
    }

    doc.end();
  } catch (error) {
    console.error("Error generating earnings report PDF:", error);
    throw error;
  }
};

module.exports = {
  generateSummaryReportPDF,
  generateBookingReportPDF,
  generateInventoryReportPDF,
  generatePackageReportPDF,
  generateRevenueReportPDF,
  generateEarningsReportPDF,
};
