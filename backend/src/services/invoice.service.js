const PDFDocument = require('pdfkit');

class InvoiceService {
  /**
   * Generates a PDF invoice as a buffer
   * @param {Object} order - The order document from MongoDB
   * @param {Object} user - The user document
   * @returns {Promise<Buffer>}
   */
  async generateInvoice(order, user) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Add Header
        doc
          .fillColor('#153d2b')
          .fontSize(28)
          .text('Organic Store', 50, 50)
          .fontSize(10)
          .fillColor('#64748b')
          .text('Farm to Door', 50, 80);

        // Invoice title
        doc
          .fillColor('#1b4332')
          .fontSize(20)
          .text('INVOICE', 400, 50, { align: 'right' })
          .fontSize(10)
          .text(`Order Number: ${order.orderNumber}`, { align: 'right' })
          .text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`, { align: 'right' });

        doc.moveDown(3);

        // Billing / Shipping Details
        doc.fillColor('#1b4332').fontSize(14).text('Bill To:', 50);
        doc.fillColor('#334155').fontSize(10)
           .text(order.shippingAddress.fullName || user.name)
           .text(order.shippingAddress.address)
           .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`)
           .text(`Phone: ${order.shippingAddress.phone}`)
           .text(`Email: ${user.email}`);

        doc.moveDown(2);

        // Table Header
        const tableTop = doc.y;
        doc
          .fillColor('#1b4332')
          .fontSize(12)
          .text('Item', 50, tableTop, { width: 250 })
          .text('Qty', 300, tableTop, { width: 50, align: 'center' })
          .text('Price', 350, tableTop, { width: 100, align: 'right' })
          .text('Amount', 450, tableTop, { width: 100, align: 'right' });

        doc
          .moveTo(50, doc.y + 5)
          .lineTo(550, doc.y + 5)
          .stroke('#e7e5e4');

        doc.moveDown(1);

        // Table Rows
        let currentY = doc.y;
        order.items.forEach((item) => {
          doc
            .fillColor('#334155')
            .fontSize(10)
            .text(item.name, 50, currentY, { width: 250 })
            .text(item.quantity.toString(), 300, currentY, { width: 50, align: 'center' })
            .text(`Rs. ${item.price.toFixed(2)}`, 350, currentY, { width: 100, align: 'right' })
            .text(`Rs. ${(item.price * item.quantity).toFixed(2)}`, 450, currentY, { width: 100, align: 'right' });
          
          currentY += 20;
        });

        // Totals
        const summaryTop = currentY + 20;
        doc
          .moveTo(50, summaryTop - 10)
          .lineTo(550, summaryTop - 10)
          .stroke('#e7e5e4');

        doc
          .fillColor('#1b4332')
          .text('Subtotal:', 350, summaryTop, { width: 100, align: 'right' })
          .fillColor('#334155')
          .text(`Rs. ${order.pricing.subtotal.toFixed(2)}`, 450, summaryTop, { width: 100, align: 'right' });

        doc
          .fillColor('#1b4332')
          .text('Shipping:', 350, summaryTop + 20, { width: 100, align: 'right' })
          .fillColor('#334155')
          .text(`Rs. ${order.pricing.shipping.toFixed(2)}`, 450, summaryTop + 20, { width: 100, align: 'right' });

        doc
          .fillColor('#1b4332')
          .text('Tax:', 350, summaryTop + 40, { width: 100, align: 'right' })
          .fillColor('#334155')
          .text(`Rs. ${order.pricing.tax.toFixed(2)}`, 450, summaryTop + 40, { width: 100, align: 'right' });

        doc
          .moveTo(350, summaryTop + 65)
          .lineTo(550, summaryTop + 65)
          .stroke('#16a34a');

        doc
          .fillColor('#16a34a')
          .fontSize(14)
          .text('Total:', 350, summaryTop + 75, { width: 100, align: 'right' })
          .text(`Rs. ${order.pricing.total.toFixed(2)}`, 450, summaryTop + 75, { width: 100, align: 'right' });

        // Footer
        doc
          .fillColor('#64748b')
          .fontSize(10)
          .text('Thank you for choosing Organic Store!', 50, 700, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new InvoiceService();
