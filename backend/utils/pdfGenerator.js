const PDFDocument = require("pdfkit");

const generateBookingAgreementPDF = (booking, res) => {
  try {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    // Pipe the PDF to the response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=contract-${booking._id}.pdf`
    );
    doc.pipe(res);

    // Helper function to draw table cell
    const drawCell = (x, y, width, height, text, options = {}) => {
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

    // Company Header
    let currentY = 60;
    doc
      .fontSize(32)
      .fillColor("#ea580c")
      .font("Helvetica-Bold")
      .text("GUEVARRA", 40, currentY, { align: "center", width: 515 });

    currentY += 35;
    doc
      .fontSize(10)
      .fillColor("#ea580c")
      .text("LIGHTS AND SOUNDS", 40, currentY, { align: "center", width: 515 });

    currentY += 25;
    doc
      .fontSize(18)
      .fillColor("#000000")
      .font("Helvetica-Bold")
      .text("CONTRACT", 40, currentY, { align: "center", width: 515 });

    currentY += 35;

    // Client Info Table
    const tableX = 40;
    const tableWidth = 515;
    const cellHeight = 20;

    // Row 1: Client
    drawCell(tableX, currentY, 50, cellHeight, "Client:", {
      bold: true,
      fontSize: 9,
    });
    drawCell(
      tableX + 50,
      currentY,
      tableWidth - 50,
      cellHeight,
      booking.agreement?.clientName || booking.user?.fullName || "N/A",
      {
        fontSize: 9,
      }
    );

    // Subject row
    currentY += cellHeight;
    drawCell(tableX, currentY, 50, cellHeight, "Subject:", {
      bold: true,
      fontSize: 9,
    });

    const subject = booking.items
      .map((item) =>
        item.type === "bandArtist" ? "BAND/ARTIST" : item.name.toUpperCase()
      )
      .slice(0, 3)
      .join(" / ");

    drawCell(tableX + 50, currentY, 190, cellHeight, subject, {
      fontSize: 8,
    });

    // Venue
    drawCell(tableX + 240, currentY, 50, cellHeight, "Venue:", {
      bold: true,
      fontSize: 9,
    });
    drawCell(
      tableX + 290,
      currentY,
      100,
      cellHeight,
      booking.contactInfo?.address?.split(",")[0] || "N/A",
      {
        fontSize: 8,
      }
    );

    // Date
    drawCell(tableX + 390, currentY, 40, cellHeight, "Date:", {
      bold: true,
      fontSize: 9,
    });
    drawCell(
      tableX + 430,
      currentY,
      75,
      cellHeight,
      new Date(booking.bookingDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      {
        fontSize: 8,
      }
    );

    // Time row (only on the right side)
    currentY += cellHeight;
    // Fill left side to keep grid but leave space on the right margin
    drawCell(tableX, currentY, 430, cellHeight, "", { border: false });
    drawCell(tableX + 390, currentY, 40, cellHeight, "Time:", {
      bold: true,
      fontSize: 9,
    });
    drawCell(
      tableX + 430,
      currentY,
      75,
      cellHeight,
      booking.bookingTime,
      {
        fontSize: 8,
      }
    );

    currentY += cellHeight + 10;

    // Equipment Quotation Header
    const itemRowHeight = 18;
    drawCell(
      tableX,
      currentY,
      tableWidth,
      itemRowHeight,
      "Equipment Quotation",
      {
        bold: true,
        fontSize: 11,
        align: "center",
        fillColor: "#4b5563",
        textColor: "#ffffff",
      }
    );

    currentY += itemRowHeight;

    // Group items by category
    const audioItems = booking.items.filter((item) =>
      item.itemId?.category?.name?.toLowerCase().includes("audio")
    );
    const lightItems = booking.items.filter((item) =>
      item.itemId?.category?.name?.toLowerCase().includes("light")
    );
    const otherInventory = booking.items.filter(
      (item) =>
        item.type === "inventory" &&
        !item.itemId?.category?.name?.toLowerCase().includes("audio") &&
        !item.itemId?.category?.name?.toLowerCase().includes("light")
    );
    const bandArtists = booking.items.filter(
      (item) => item.type === "bandArtist"
    );
    const packages = booking.items.filter((item) => item.type === "package");
    const additionalItems = booking.items.filter((item) => item.isAdditional);
    const extensionCharges = Array.isArray(booking.extensions)
      ? booking.extensions
      : [];

    // AUDIO Section
    if (audioItems.length > 0) {
      drawCell(tableX, currentY, tableWidth, itemRowHeight, "AUDIO", {
        bold: true,
        fontSize: 10,
        align: "center",
        fillColor: "#d1d5db",
      });
      currentY += itemRowHeight;

      audioItems.forEach((item) => {
        drawCell(tableX, currentY, 350, itemRowHeight, item.name, {
          fontSize: 9,
        });
        drawCell(
          tableX + 350,
          currentY,
          80,
          itemRowHeight,
          item.quantity.toString(),
          {
            fontSize: 9,
            align: "center",
          }
        );
        drawCell(tableX + 430, currentY, 85, itemRowHeight, "Units", {
          fontSize: 9,
          align: "center",
        });
        currentY += itemRowHeight;
      });
    }

    // LIGHTS Section
    if (lightItems.length > 0) {
      drawCell(tableX, currentY, tableWidth, itemRowHeight, "LIGHTS", {
        bold: true,
        fontSize: 10,
        align: "center",
        fillColor: "#d1d5db",
      });
      currentY += itemRowHeight;

      lightItems.forEach((item) => {
        drawCell(tableX, currentY, 350, itemRowHeight, item.name, {
          fontSize: 9,
        });
        drawCell(
          tableX + 350,
          currentY,
          80,
          itemRowHeight,
          item.quantity.toString(),
          {
            fontSize: 9,
            align: "center",
          }
        );
        drawCell(tableX + 430, currentY, 85, itemRowHeight, "Units", {
          fontSize: 9,
          align: "center",
        });
        currentY += itemRowHeight;
      });
    }

    // Other inventory items
    otherInventory.forEach((item) => {
      drawCell(tableX, currentY, 350, itemRowHeight, item.name, {
        fontSize: 9,
      });
      drawCell(
        tableX + 350,
        currentY,
        80,
        itemRowHeight,
        item.quantity.toString(),
        {
          fontSize: 9,
          align: "center",
        }
      );
      drawCell(tableX + 430, currentY, 85, itemRowHeight, "Units", {
        fontSize: 9,
        align: "center",
      });
      currentY += itemRowHeight;
    });

    // BAND/ARTIST Section
    if (bandArtists.length > 0) {
      drawCell(tableX, currentY, tableWidth, itemRowHeight, "VIDEOMAN", {
        bold: true,
        fontSize: 10,
        align: "center",
        fillColor: "#d1d5db",
      });
      currentY += itemRowHeight;

      bandArtists.forEach((item) => {
        drawCell(tableX, currentY, 350, itemRowHeight, item.name, {
          fontSize: 9,
        });
        drawCell(tableX + 350, currentY, 165, itemRowHeight, "1", {
          fontSize: 9,
          align: "center",
        });
        currentY += itemRowHeight;
      });
    }

    // PACKAGE Section
    if (packages.length > 0) {
      packages.forEach((item) => {
        drawCell(tableX, currentY, 350, itemRowHeight, item.name, {
          fontSize: 9,
        });
        drawCell(tableX + 350, currentY, 165, itemRowHeight, "1", {
          fontSize: 9,
          align: "center",
        });
        currentY += itemRowHeight;
      });
    }

    // Additional Items Section
    if (additionalItems.length > 0) {
      drawCell(
        tableX,
        currentY,
        tableWidth,
        itemRowHeight,
        "ADDITIONAL ITEMS ADDED BY ADMIN",
        {
          bold: true,
          fontSize: 10,
          align: "center",
          fillColor: "#bfdbfe",
        }
      );
      currentY += itemRowHeight;

      additionalItems.forEach((item) => {
        drawCell(tableX, currentY, 240, itemRowHeight, item.name, {
          fontSize: 9,
        });
        drawCell(
          tableX + 240,
          currentY,
          70,
          itemRowHeight,
          `x${item.quantity}`,
          {
            fontSize: 9,
            align: "center",
          }
        );
        drawCell(
          tableX + 310,
          currentY,
          120,
          itemRowHeight,
          `₱${Number(item.price || 0).toLocaleString()}`,
          {
            fontSize: 9,
            align: "center",
          }
        );
        drawCell(
          tableX + 430,
          currentY,
          85,
          itemRowHeight,
          new Date(item.addedAt || booking.updatedAt || booking.createdAt)
            .toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          {
            fontSize: 8,
            align: "center",
          }
        );
        currentY += itemRowHeight;
      });
    }

    // Technical Staff & Transport Vehicle
    drawCell(
      tableX,
      currentY,
      tableWidth,
      itemRowHeight,
      "TECHNICAL STAFF & TRANSPORT VEHICLE",
      {
        bold: true,
        fontSize: 10,
        align: "center",
        fillColor: "#d1d5db",
      }
    );
    currentY += itemRowHeight;

    // Technical Staff row
    const techStaff = booking.technicalStaff || {};
    drawCell(tableX, currentY, 175, itemRowHeight, "Technical Staff", {
      fontSize: 9,
    });
    drawCell(
      tableX + 175,
      currentY,
      80,
      itemRowHeight,
      String(techStaff.count || 6),
      {
        fontSize: 9,
        align: "center",
      }
    );
    drawCell(tableX + 255, currentY, 100, itemRowHeight, "Driver", {
      fontSize: 9,
    });
    drawCell(
      tableX + 355,
      currentY,
      160,
      itemRowHeight,
      String(techStaff.drivers || 2),
      {
        fontSize: 9,
        align: "center",
      }
    );
    currentY += itemRowHeight;

    // Total Crew row
    drawCell(tableX, currentY, 175, itemRowHeight, "Total no. of Crew", {
      fontSize: 9,
    });
    drawCell(
      tableX + 175,
      currentY,
      80,
      itemRowHeight,
      String(techStaff.totalCrew || 8),
      {
        fontSize: 9,
        align: "center",
      }
    );
    drawCell(tableX + 255, currentY, 100, itemRowHeight, "Transport Vehicle", {
      fontSize: 9,
    });
    drawCell(
      tableX + 355,
      currentY,
      160,
      itemRowHeight,
      String(techStaff.vehicles || 1),
      {
        fontSize: 9,
        align: "center",
      }
    );
    currentY += itemRowHeight;

    // Total Price Section (Dark box)
    const priceRowHeight = 25;
    drawCell(
      tableX,
      currentY,
      tableWidth,
      priceRowHeight,
      `TOTAL PRICE: Php. ${booking.totalAmount.toLocaleString()}.00`,
      {
        bold: true,
        fontSize: 12,
        align: "left",
        fillColor: "#374151",
        textColor: "#ffffff",
      }
    );
    currentY += priceRowHeight;

    const totalAmountNumber = Number(booking.totalAmount || 0);
    const downpaymentPct = booking.downpaymentPercentage || 0;
    const isFullPayment = booking.downpaymentType === "full";
    const recordedDownpayment = Number(booking.downpaymentAmount ?? 0);
    const recordedRemainingBalance = Number(booking.remainingBalance ?? 0);
    const inferredDownpayment = Math.max(
      0,
      totalAmountNumber - recordedRemainingBalance
    );
    const calculatedDownpayment = isFullPayment
      ? totalAmountNumber
      : recordedDownpayment > 0
      ? recordedDownpayment
      : inferredDownpayment;
    const remainingBalance = isFullPayment
      ? 0
      : Math.max(0, recordedRemainingBalance);
    const paymentMethodLabel = (booking.paymentMethod || "N/A").toUpperCase();
    const effectiveDownpaymentPercentage =
      isFullPayment || totalAmountNumber === 0
        ? 100
        : downpaymentPct ||
          Math.round((calculatedDownpayment / totalAmountNumber) * 100);
    const paymentOptionLabel = isFullPayment
      ? "Full Payment"
      : `${effectiveDownpaymentPercentage}% Downpayment`;

    const paymentInfoRowHeight = 18;
    drawCell(
      tableX,
      currentY,
      tableWidth / 2,
      paymentInfoRowHeight,
      `Payment Method: ${paymentMethodLabel}`,
      { fontSize: 9 }
    );
    drawCell(
      tableX + tableWidth / 2,
      currentY,
      tableWidth / 2,
      paymentInfoRowHeight,
      `Payment Option: ${paymentOptionLabel}`,
      { fontSize: 9 }
    );
    currentY += paymentInfoRowHeight;

    drawCell(
      tableX,
      currentY,
      tableWidth / 2,
      paymentInfoRowHeight,
      `${isFullPayment ? "Total Paid" : "Downpayment Paid"}: Php ${Number(
        calculatedDownpayment || 0
      ).toLocaleString()}`,
      {
        fontSize: 9,
      }
    );
    drawCell(
      tableX + tableWidth / 2,
      currentY,
      tableWidth / 2,
      paymentInfoRowHeight,
      `Remaining Balance: Php ${Number(remainingBalance).toLocaleString()}`,
      {
        fontSize: 9,
        textColor: isFullPayment ? "#16a34a" : "#f97316",
      }
    );
    currentY += paymentInfoRowHeight;

    // Down payment section (if applicable)
    if (booking.paymentMethod === "gcash") {
      const paymentTimestamp = booking.paymentSubmittedAt || booking.createdAt;
      const remainingBalanceLabel =
        remainingBalance > 0
          ? `BALANCE ₱${Number(remainingBalance).toLocaleString()}`
          : "BALANCE ₱0 (PAID)";

      drawCell(
        tableX,
        currentY,
        130,
        cellHeight,
        `Downpayment Paid: ₱${Number(
          calculatedDownpayment || 0
        ).toLocaleString()}`,
        {
          fontSize: 9,
        }
      );
      drawCell(tableX + 130, currentY, 135, cellHeight, "VIA G-CASH", {
        fontSize: 9,
        bold: true,
      });
      drawCell(tableX + 265, currentY, 80, cellHeight, "Date:", {
        fontSize: 9,
      });
      drawCell(
        tableX + 345,
        currentY,
        85,
        cellHeight,
        new Date(paymentTimestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        {
          fontSize: 9,
        }
      );
      drawCell(tableX + 430, currentY, 85, cellHeight, remainingBalanceLabel, {
        fontSize: 9,
        bold: true,
      });
      currentY += cellHeight;
    }

    currentY += 5;

    // NOTE Section
    const downpaymentPercentage = booking.downpaymentPercentage || 20;
    const noteRowHeight = 20;

    // NOTE header
    drawCell(
      tableX,
      currentY,
      tableWidth,
      noteRowHeight,
      "NOTE; ONLY 20 PERCENT IS NON REFUNDABLE IF CLIENT CHOOSE TO CANCEL",
      {
        bold: true,
        fontSize: 9,
        align: "left",
        fillColor: "#fef3c7",
      }
    );
    currentY += noteRowHeight;

    // NOTE label row
    drawCell(tableX, currentY, 80, noteRowHeight, "NOTE:", {
      bold: true,
      fontSize: 9,
      fillColor: "#d1d5db",
    });
    drawCell(tableX + 80, currentY, tableWidth - 80, noteRowHeight, "", {
      fillColor: "#f9fafb",
    });
    currentY += noteRowHeight;

    // Note items (multi-line)
    const noteTexts = [
      `*${downpaymentPercentage}% Down payment should be given at the time of signing this contract. After the event, remaining balance must be paid.`,
      "*In case of cancellation, only 20% of the total amount paid (including full payments) is refundable; the remainder is forfeited.",
      "*Please ensure the safety and security of the supplier at the venue.",
      "*Power supply should be stable at 220v.",
      "*The client is responsible for paying for any damage that event attendees may have caused to the equipment.",
      "*Please follow to the time constraints; excess time will result in additional charges.",
      "*Crew meals should be provided by the client. LUNCH & DINNER",
      "*This agreement contains the entire understanding between the Supplier and the Client.",
      "*Kindly sign on the space provided below",
    ];

    noteTexts.forEach((noteText, index) => {
      const isLunchDinner = noteText.includes("LUNCH & DINNER");
      const rowH = index === 0 || index === 5 ? 25 : noteRowHeight;

      doc.fontSize(8).fillColor(isLunchDinner ? "#dc2626" : "#000000");
      doc.font(isLunchDinner ? "Helvetica-Bold" : "Helvetica");
      doc.rect(tableX + 80, currentY, tableWidth - 80, rowH).stroke("#000000");
      doc.text(noteText, tableX + 85, currentY + 5, {
        width: tableWidth - 90,
        height: rowH - 10,
      });
      currentY += rowH;
    });

    currentY += 10;

    // Signature Section
    const signatureHeight = 80;
    const clientNameWidth = 200;
    const providerNameWidth = 200;
    const gap = (tableWidth - clientNameWidth - providerNameWidth) / 3;

    // Client signature on left
    doc
      .rect(tableX + gap, currentY, clientNameWidth, signatureHeight)
      .stroke("#000000");

    // Check if signature exists and is valid
    if (
      booking.agreement &&
      booking.agreement.signature &&
      booking.agreement.signature.startsWith("data:image")
    ) {
      try {
        // Convert base64 to buffer
        const base64Data = booking.agreement.signature.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        const imageBuffer = Buffer.from(base64Data, "base64");

        // Add signature image
        doc.image(imageBuffer, tableX + gap + 5, currentY + 5, {
          fit: [clientNameWidth - 10, signatureHeight - 10],
          align: "center",
        });
      } catch (error) {
        console.error("Error adding signature to PDF:", error);
      }
    }

    // Provider/Admin signature on right
    doc
      .rect(
        tableX + clientNameWidth + gap * 2,
        currentY,
        providerNameWidth,
        signatureHeight
      )
      .stroke("#000000");

    // Check if admin signature exists
    if (
      booking.agreement &&
      booking.agreement.adminSignature &&
      booking.agreement.adminSignature.startsWith("data:image")
    ) {
      try {
        // Convert base64 to buffer
        const base64Data = booking.agreement.adminSignature.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        const imageBuffer = Buffer.from(base64Data, "base64");

        // Add admin signature image
        doc.image(
          imageBuffer,
          tableX + clientNameWidth + gap * 2 + 5,
          currentY + 5,
          {
            fit: [providerNameWidth - 10, signatureHeight - 35],
            align: "center",
          }
        );
      } catch (error) {
        console.error("Error adding admin signature to PDF:", error);
      }
    }

    doc
      .fontSize(9)
      .fillColor("#000000")
      .font("Helvetica-Oblique")
      .text(
        "Signed by:",
        tableX + clientNameWidth + gap * 2 + 10,
        currentY + signatureHeight - 45,
        {
          width: providerNameWidth - 20,
        }
      );
    doc
      .font("Helvetica-Bold")
      .text(
        booking.agreement?.adminSignerName || "AMAYA SANTOS",
        tableX + clientNameWidth + gap * 2 + 10,
        currentY + signatureHeight - 30,
        {
          width: providerNameWidth - 20,
        }
      );
    doc
      .font("Helvetica")
      .fontSize(8)
      .text(
        "Proprietor",
        tableX + clientNameWidth + gap * 2 + 10,
        currentY + signatureHeight - 15,
        {
          width: providerNameWidth - 20,
        }
      );

    currentY += signatureHeight + 5;

    // Extension Charges Section
    if (extensionCharges.length > 0) {
      drawCell(
        tableX,
        currentY,
        tableWidth,
        itemRowHeight,
        "EXTENSION CHARGES",
        {
          bold: true,
          fontSize: 10,
          align: "center",
          fillColor: "#fde68a",
        }
      );
      currentY += itemRowHeight;

      extensionCharges.forEach((extension) => {
        drawCell(
          tableX,
          currentY,
          220,
          itemRowHeight,
          extension.description || "Extension Charge",
          {
            fontSize: 9,
          }
        );
        drawCell(
          tableX + 220,
          currentY,
          80,
          itemRowHeight,
          extension.hours ? `${extension.hours} hr(s)` : "-",
          {
            fontSize: 9,
            align: "center",
          }
        );
        drawCell(
          tableX + 300,
          currentY,
          80,
          itemRowHeight,
          extension.paymentMethod
            ? extension.paymentMethod.toUpperCase()
            : "CASH",
          {
            fontSize: 9,
            align: "center",
          }
        );
        drawCell(
          tableX + 380,
          currentY,
          80,
          itemRowHeight,
          extension.status
            ? extension.status.toUpperCase()
            : "PENDING",
          {
            fontSize: 9,
            align: "center",
          }
        );
        drawCell(
          tableX + 460,
          currentY,
          55,
          itemRowHeight,
          `₱${Number(extension.amount || 0).toLocaleString()}`,
          {
            fontSize: 9,
            align: "right",
          }
        );
        currentY += itemRowHeight;
      });

      currentY += 5;
    }

    // Client label under signature
    doc
      .fontSize(9)
      .fillColor("#000000")
      .font("Helvetica")
      .text("Client", tableX + gap, currentY, {
        width: clientNameWidth,
        align: "center",
      });

    currentY += 20;

    // Date line
    doc
      .fontSize(8)
      .fillColor("#000000")
      .font("Helvetica")
      .text(
        `Date: ${
          booking.agreement?.agreedAt
            ? new Date(booking.agreement.agreedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
        }`,
        tableX,
        currentY,
        { width: tableWidth, align: "center" }
      );

    currentY += 15;

    // Footer
    doc
      .fontSize(7)
      .fillColor("#6b7280")
      .text("Contract ID: " + booking._id, tableX, currentY, {
        width: tableWidth,
        align: "center",
      });

    currentY += 10;

    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      tableX,
      currentY,
      { width: tableWidth, align: "center" }
    );

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

module.exports = { generateBookingAgreementPDF };
