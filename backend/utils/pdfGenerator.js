const PDFDocument = require("pdfkit");

const generateBookingAgreementPDF = (booking, res) => {
  try {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Pipe the PDF to the response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=booking-agreement-${booking._id}.pdf`
    );
    doc.pipe(res);

    // Add company logo or header
    doc
      .fontSize(24)
      .fillColor("#1e40af")
      .text("HARMONY HUB GUEVARA", { align: "center" })
      .moveDown(0.3);

    doc
      .fontSize(16)
      .fillColor("#3b82f6")
      .text("CLIENT BOOKING AGREEMENT", { align: "center" })
      .moveDown(1);

    // Agreement date
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text(
        `Agreement Date: ${new Date(booking.createdAt).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )}`,
        { align: "center" }
      )
      .moveDown(1);

    // Draw a separator line
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#cbd5e1")
      .stroke()
      .moveDown(1);

    // PARTIES Section
    doc.fontSize(14).fillColor("#1e40af").text("PARTIES", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor("#000000");

    // Provider Info
    doc.font("Helvetica-Bold").text("Service Provider:", { continued: true });
    doc.font("Helvetica").text(" Harmony Hub Guevara");
    doc.text("(hereinafter referred to as 'Provider')");
    doc.moveDown(0.5);

    // Client Info
    doc.font("Helvetica-Bold").text("Client:", { continued: true });
    doc
      .font("Helvetica")
      .text(` ${booking.agreement?.clientName || booking.user?.fullName || "N/A"}`);
    doc.text(
      `Email: ${booking.agreement?.clientEmail || booking.user?.email || "N/A"}`
    );
    doc.text("(hereinafter referred to as 'Client')");
    doc.moveDown(1);

    // Booking Details Section
    doc
      .fontSize(14)
      .fillColor("#1e40af")
      .text("I. BOOKING DETAILS", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor("#000000");

    doc.font("Helvetica-Bold").text("Booking Date:", { continued: true });
    doc
      .font("Helvetica")
      .text(
        ` ${new Date(booking.bookingDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`
      );

    doc.font("Helvetica-Bold").text("Event Time:", { continued: true });
    doc.font("Helvetica").text(` ${booking.bookingTime}`);

    doc.font("Helvetica-Bold").text("Setup Date:", { continued: true });
    doc
      .font("Helvetica")
      .text(
        ` ${new Date(booking.setupDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`
      );

    doc.font("Helvetica-Bold").text("Setup Time:", { continued: true });
    doc.font("Helvetica").text(` ${booking.setupTime}`);

    doc.font("Helvetica-Bold").text("Duration:", { continued: true });
    doc.font("Helvetica").text(` ${booking.duration} hour(s)`);

    doc.font("Helvetica-Bold").text("Venue Address:", { continued: true });
    doc
      .font("Helvetica")
      .text(` ${booking.contactInfo?.address || "N/A"}`, { width: 400 });

    doc.moveDown(1);

    // Services/Items Booked
    doc.font("Helvetica-Bold").text("Services/Items Booked:");
    doc.moveDown(0.3);

    booking.items.forEach((item, index) => {
      doc
        .font("Helvetica")
        .text(
          `${index + 1}. ${item.name} x${item.quantity} - ₱${(item.price * item.quantity).toLocaleString()}`,
          { indent: 20 }
        );
    });

    doc.moveDown(0.5);

    // Payment Details
    doc.font("Helvetica-Bold").text("Payment Details:");
    doc.moveDown(0.3);

    doc
      .font("Helvetica")
      .text(`Total Amount: ₱${booking.totalAmount.toLocaleString()}`, {
        indent: 20,
      });
    doc.text(
      `Payment Method: ${booking.paymentMethod === "gcash" ? "GCash" : "Cash"}`,
      { indent: 20 }
    );

    if (booking.paymentMethod === "gcash") {
      doc.text(
        `Payment Type: ${booking.downpaymentType === "full" ? "Full Payment" : "Partial Payment"}`,
        { indent: 20 }
      );
      if (booking.remainingBalance > 0) {
        doc
          .fillColor("#f97316")
          .text(
            `Remaining Balance: ₱${booking.remainingBalance.toLocaleString()}`,
            { indent: 20 }
          );
        doc.fillColor("#000000");
      }
    }

    doc.moveDown(1);

    // Add page break if needed
    if (doc.y > 650) {
      doc.addPage();
    }

    // Terms and Conditions Section
    doc
      .fontSize(14)
      .fillColor("#1e40af")
      .text("II. TERMS AND CONDITIONS", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(9).fillColor("#000000");

    const terms = [
      {
        title: "1. SCOPE OF SERVICES",
        content:
          "Provider agrees to provide the Client with the services and equipment listed in Section I on the specified date and time. Services include setup, operation, maintenance, technical support, and teardown of equipment.",
      },
      {
        title: "2. PAYMENT TERMS",
        content:
          "The total booking amount must be paid as per the agreed payment method. All payments are non-refundable unless stated otherwise. Failure to pay remaining balance may result in service cancellation.",
      },
      {
        title: "3. CANCELLATION & REFUND POLICY",
        content:
          "Client may cancel 7 days before the event for a 50% refund. Cancellations less than 7 days before are non-refundable. Provider may cancel due to unforeseen circumstances with full refund.",
      },
      {
        title: "4. EQUIPMENT CARE & LIABILITY",
        content:
          "Client is responsible for any loss, theft, or damage to equipment during rental period. Damaged equipment will be charged at replacement or repair cost.",
      },
      {
        title: "5. SETUP & VENUE ACCESS",
        content:
          "Client must ensure venue access and adequate space at specified setup time. Venue must have electrical power and required utilities. Delays may result in additional charges.",
      },
    ];

    if (booking.items.some((item) => item.type === "bandArtist")) {
      terms.push({
        title: "6. ARTIST/PERFORMER TERMS",
        content:
          "Client must provide adequate facilities for artists. Performance repertoire is mutually agreed. Client agrees not to record performances without consent.",
      });
    }

    terms.forEach((term, index) => {
      if (doc.y > 680) {
        doc.addPage();
      }
      doc.font("Helvetica-Bold").text(term.title);
      doc.font("Helvetica").text(term.content, { indent: 10 });
      doc.moveDown(0.5);
    });

    // Add page break for signature if needed
    if (doc.y > 600) {
      doc.addPage();
    }

    doc.moveDown(1);

    // Signature Section
    doc
      .fontSize(14)
      .fillColor("#1e40af")
      .text("III. CLIENT SIGNATURE", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor("#000000");

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

        // Draw signature box
        doc
          .rect(50, doc.y, 300, 100)
          .strokeColor("#cbd5e1")
          .stroke();

        // Add signature image
        doc.image(imageBuffer, 55, doc.y + 5, {
          fit: [290, 90],
          align: "center",
        });

        doc.y += 105;
      } catch (error) {
        console.error("Error adding signature to PDF:", error);
        doc.text("Signature: [Electronic Signature Captured]");
        doc.moveDown(3);
      }
    } else {
      doc.text("Signature: [Electronic Signature Captured]");
      doc.moveDown(3);
    }

    // Client name and date
    doc
      .font("Helvetica-Bold")
      .text(
        `Client Name: ${booking.agreement?.clientName || booking.user?.fullName || "N/A"}`
      );
    doc
      .font("Helvetica")
      .text(
        `Date Signed: ${booking.agreement?.agreedAt ? new Date(booking.agreement.agreedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}`
      );

    doc.moveDown(1);

    // Agreement Confirmation
    doc
      .fontSize(9)
      .fillColor("#059669")
      .text(
        "✓ Client has electronically agreed to all terms and conditions stated herein.",
        { align: "center" }
      );
    doc
      .text("✓ This digital signature is legally binding and equivalent to a handwritten signature.", { align: "center" })
      .fillColor("#000000");

    doc.moveDown(2);

    // Footer
    doc
      .fontSize(8)
      .fillColor("#6b7280")
      .text(
        "This agreement is governed by the laws of the Philippines. For inquiries, contact Harmony Hub Guevara.",
        { align: "center" }
      );
    doc.text(`Booking ID: ${booking._id}`, { align: "center" });
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}`,
      { align: "center" }
    );

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

module.exports = { generateBookingAgreementPDF };

