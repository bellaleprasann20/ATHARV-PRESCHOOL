/**
 * services/pdfService.js
 *
 * Generates professional A4 fee receipt PDFs using PDFKit.
 * Called by receiptController.createReceipt() and downloadReceipt().
 *
 * Exports:
 *   generateReceiptPDF(receipt, outputPath) → Promise<string>  (returns outputPath)
 */

const PDFDocument = require('pdfkit');
const fs          = require('fs');
const path        = require('path');
const { formatCurrencyRaw } = require('../utils/formatCurrency');

const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ── Palette ──────────────────────────────────────────────────
const C = {
  primary:   '#4F46E5',   // indigo
  accent:    '#FF6B6B',   // coral
  success:   '#10B981',   // green
  bg:        '#F8FAFC',   // near-white
  text:      '#1E293B',   // slate-900
  muted:     '#64748B',   // slate-500
  border:    '#E2E8F0',   // slate-200
  white:     'white',
};

// ── Amount in words (Indian system) ──────────────────────────
const amountToWords = (amount) => {
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convert = (n) => {
    if (!n) return '';
    if (n < 20)     return ones[n];
    if (n < 100)    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000)   return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
  };

  const [rupees, paise] = String(Number(amount).toFixed(2)).split('.').map(Number);
  return `Rupees ${convert(rupees)}${paise ? ` and ${convert(paise)} Paise` : ''} Only`;
};

// ── Layout helpers ────────────────────────────────────────────
const drawHRule = (doc, y, color = C.border) =>
  doc.moveTo(50, y).lineTo(545, y).strokeColor(color).lineWidth(0.5).stroke();

const drawLabel = (doc, text, x, y) =>
  doc.font('Helvetica').fontSize(8).fillColor(C.muted).text(text.toUpperCase(), x, y);

const drawValue = (doc, text, x, y, opts = {}) =>
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(C.text).text(text || '—', x, y, opts);

// ── Main export ───────────────────────────────────────────────
const generateReceiptPDF = (receipt, outputPath) =>
  new Promise((resolve, reject) => {
    // Ensure output directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    const doc    = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const W = 595, M = 50, IW = W - 2 * M; // page width, margin, inner width

    // ── HEADER ───────────────────────────────────────────────
    doc.rect(0, 0, W, 130).fill(C.primary);

    // School name
    doc.font('Helvetica-Bold').fontSize(22).fillColor(C.white)
       .text(process.env.SCHOOL_NAME || 'Atharv Preschool & Daycare', M, 28, { width: IW, align: 'center' });

    // Address line
    doc.font('Helvetica').fontSize(9.5).fillColor('rgba(255,255,255,0.80)')
       .text(process.env.SCHOOL_ADDRESS || '123 Education Lane, Pune, Maharashtra – 411001', M, 56, { width: IW, align: 'center' })
       .text(`☎ ${process.env.SCHOOL_PHONE || '+91 98765 43210'}   ✉ ${process.env.SCHOOL_EMAIL || 'info@atharvpreschool.in'}`, M, 72, { width: IW, align: 'center' });

    // FEE RECEIPT badge
    const badgeW = 130, badgeH = 24, badgeX = (W - badgeW) / 2;
    doc.rect(badgeX, 100, badgeW, badgeH).fill(C.accent);
    doc.font('Helvetica-Bold').fontSize(11).fillColor(C.white)
       .text('FEE RECEIPT', badgeX, 107, { width: badgeW, align: 'center' });

    // ── RECEIPT META ROW ─────────────────────────────────────
    let Y = 148;
    doc.rect(M, Y, IW, 52).fill(C.bg).stroke(C.border);

    const metaItems = [
      { label: 'Receipt No.',    value: receipt.receiptNo,           x: M + 12 },
      { label: 'Date',           value: new Date(receipt.issuedAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), x: M + 155 },
      { label: 'Academic Year',  value: receipt.academicYear || '—', x: M + 290 },
      { label: 'Payment Mode',   value: (receipt.paymentMode || '').toUpperCase().replace('_', ' ') || '—', x: M + 410 },
    ];
    metaItems.forEach(({ label, value, x }) => {
      drawLabel(doc, label, x, Y + 8);
      drawValue(doc, value, x, Y + 22);
    });

    // ── STUDENT INFO ─────────────────────────────────────────
    Y += 68;
    doc.font('Helvetica-Bold').fontSize(11).fillColor(C.primary)
       .text('Student Information', M, Y);
    drawHRule(doc, Y + 16, C.primary);

    Y += 24;
    const s = receipt.studentSnapshot || {};
    const infoGrid = [
      [{ label: 'Student Name',   value: s.name          }, { label: 'Admission No.', value: s.admissionNo }],
      [{ label: 'Class / Section',value: [s.class, s.section].filter(Boolean).join(' – ') }, { label: "Father's Name",  value: s.fatherName }],
      [{ label: 'Contact No.',    value: s.guardianPhone }, { label: 'Payment Date',  value: new Date(receipt.paymentDate || Date.now()).toLocaleDateString('en-IN') }],
    ];

    infoGrid.forEach(([left, right]) => {
      drawLabel(doc, left.label,  M,        Y);
      drawValue(doc, left.value,  M,        Y + 13);
      drawLabel(doc, right.label, M + 260,  Y);
      drawValue(doc, right.value, M + 260,  Y + 13);
      Y += 38;
    });

    // For months
    if (receipt.forMonths?.length) {
      const period = receipt.forMonths
        .map(m => `${MONTHS[m.month]} ${m.year}`)
        .join(', ');
      drawLabel(doc, 'Payment For Period', M, Y);
      drawValue(doc, period, M, Y + 13, { width: IW });
      Y += 38;
    }

    // ── FEE BREAKDOWN TABLE ──────────────────────────────────
    Y += 8;
    doc.font('Helvetica-Bold').fontSize(11).fillColor(C.primary).text('Fee Breakdown', M, Y);
    drawHRule(doc, Y + 16, C.primary);
    Y += 22;

    // Table header
    doc.rect(M, Y, IW, 22).fill(C.primary);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(C.white);
    doc.text('#',          M + 10, Y + 7);
    doc.text('Fee Head',   M + 30, Y + 7);
    doc.text('Amount',     M + IW - 75, Y + 7, { width: 65, align: 'right' });
    Y += 22;

    const breakdown = receipt.feeBreakdown?.length
      ? receipt.feeBreakdown
      : [{ headName: 'School Fees', amount: receipt.amount }];

    breakdown.forEach((item, i) => {
      const bg = i % 2 === 0 ? C.white : C.bg;
      doc.rect(M, Y, IW, 20).fill(bg);
      doc.font('Helvetica').fontSize(9.5).fillColor(C.text);
      doc.text(String(i + 1), M + 10, Y + 6);
      doc.text(item.headName || 'Fee',   M + 30,          Y + 6);
      doc.text(formatCurrencyRaw(item.amount), M + IW - 75, Y + 6, { width: 65, align: 'right' });
      Y += 20;
    });

    // Late fine
    if (receipt.lateFine > 0) {
      doc.rect(M, Y, IW, 20).fill('#FFF5F5');
      doc.font('Helvetica').fontSize(9.5).fillColor('#DC2626');
      doc.text('Late Fine', M + 30, Y + 6);
      doc.text(`+ ${formatCurrencyRaw(receipt.lateFine)}`, M + IW - 75, Y + 6, { width: 65, align: 'right' });
      Y += 20;
    }

    // Discount
    if (receipt.discount > 0) {
      doc.rect(M, Y, IW, 20).fill('#F0FFF4');
      doc.font('Helvetica').fontSize(9.5).fillColor('#059669');
      doc.text('Discount Applied', M + 30, Y + 6);
      doc.text(`- ${formatCurrencyRaw(receipt.discount)}`, M + IW - 75, Y + 6, { width: 65, align: 'right' });
      Y += 20;
    }

    // Total row
    doc.rect(M, Y, IW, 28).fill(C.primary);
    doc.font('Helvetica-Bold').fontSize(12).fillColor(C.white);
    doc.text('TOTAL PAID', M + 30, Y + 8);
    doc.text(formatCurrencyRaw(receipt.amount), M + IW - 75, Y + 8, { width: 65, align: 'right' });
    Y += 38;

    // Amount in words
    doc.font('Helvetica').fontSize(9).fillColor(C.muted).text('Amount in words: ', M, Y);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(C.text)
       .text(amountToWords(receipt.amount), M + 100, Y, { width: IW - 100 });
    Y += 20;

    // Remarks
    if (receipt.remarks) {
      drawLabel(doc, 'Remarks', M, Y + 8);
      doc.font('Helvetica').fontSize(9).fillColor(C.text).text(receipt.remarks, M, Y + 20, { width: IW });
      Y += 35;
    }

    // ── FOOTER ───────────────────────────────────────────────
    const footerY = 750;
    drawHRule(doc, footerY);
    doc.rect(0, footerY + 0.5, W, 92).fill(C.bg);

    // Signature block
    doc.moveTo(M + 340, footerY + 55).lineTo(M + IW, footerY + 55).strokeColor(C.text).lineWidth(0.5).stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor(C.text)
       .text('Authorised Signatory', M + 340, footerY + 60, { width: IW - 340, align: 'center' });

    // School stamp box
    doc.rect(M, footerY + 18, 110, 38).dash(2, { space: 3 }).stroke(C.muted).undash();
    doc.font('Helvetica').fontSize(8).fillColor(C.muted)
       .text('School Stamp', M, footerY + 32, { width: 110, align: 'center' });

    // Fine print
    doc.font('Helvetica').fontSize(7.5).fillColor(C.muted)
       .text(
         'This is a computer-generated receipt and is valid without a physical signature.',
         M, footerY + 68, { width: IW, align: 'center' }
       )
       .text(
         `Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
         M, footerY + 78, { width: IW, align: 'center' }
       );

    doc.end();
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });

module.exports = { generateReceiptPDF, amountToWords };