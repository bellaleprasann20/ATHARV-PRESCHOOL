/**
 * services/emailService.js
 *
 * Centralised email sender for all school notifications:
 *   - Receipt delivery after payment
 *   - Fee due reminders
 *   - Welcome email for new parent accounts
 *   - Password reset links
 *   - Admission enquiry acknowledgement
 *   - Admin notifications (backup, alerts)
 *
 * Requires .env:
 *   EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
 *   EMAIL_FROM  (optional, defaults to EMAIL_USER)
 *   SCHOOL_NAME, SCHOOL_PHONE, SCHOOL_EMAIL, SCHOOL_ADDRESS
 *   FRONTEND_URL
 */

const nodemailer = require('nodemailer');
const path       = require('path');
const fs         = require('fs');
const logger     = require('../utils/logger');

// ── Singleton transporter ─────────────────────────────────────
let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.warn('⚠️  emailService: EMAIL_USER / EMAIL_PASS not set. Emails will be skipped.');
    return null;
  }
  _transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST  || 'smtp.gmail.com',
    port:   Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_PORT  === '465',
    auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  return _transporter;
};

// ── School brand constants ────────────────────────────────────
const SCHOOL       = process.env.SCHOOL_NAME    || 'Atharv Preschool & Daycare';
const SCHOOL_PH    = process.env.SCHOOL_PHONE   || '+91 98765 43210';
const SCHOOL_EMAIL = process.env.SCHOOL_EMAIL   || 'info@atharvpreschool.in';
const SCHOOL_ADDR  = process.env.SCHOOL_ADDRESS || '123 Education Lane, Pune, Maharashtra 411001';
const FRONTEND_URL = process.env.FRONTEND_URL   || 'http://localhost:5173';
const FROM         = process.env.EMAIL_FROM     || `${SCHOOL} <${process.env.EMAIL_USER}>`;

// ── HTML wrapper (brand header + footer) ─────────────────────
const wrap = (innerHtml, preheader = '') => `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden">${preheader}</div>` : ''}
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif">
<div style="max-width:560px;margin:28px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:28px 32px;text-align:center">
    <div style="font-size:34px;margin-bottom:8px">🌟</div>
    <h1 style="color:#fff;margin:0;font-size:20px;font-weight:800;letter-spacing:-.3px">${SCHOOL}</h1>
    <p style="color:rgba(255,255,255,.7);margin:4px 0 0;font-size:12px">Pune, Maharashtra</p>
  </div>

  <!-- Body -->
  <div style="padding:28px 32px">${innerHtml}</div>

  <!-- Footer -->
  <div style="background:#f8fafc;padding:18px 32px;border-top:1px solid #e2e8f0;text-align:center">
    <p style="color:#94a3b8;font-size:11px;margin:0;line-height:1.7">
      ☎ ${SCHOOL_PH} &nbsp;|&nbsp; ✉ ${SCHOOL_EMAIL}<br>
      ${SCHOOL_ADDR}
    </p>
    <p style="color:#cbd5e1;font-size:10px;margin:8px 0 0">
      You received this email because you are registered with ${SCHOOL}.
    </p>
  </div>
</div>
</body></html>`;

// ── Core send helper ──────────────────────────────────────────
const send = async ({ to, subject, html, attachments = [] }) => {
  const t = getTransporter();
  if (!t) return { skipped: true, reason: 'Email not configured' };

  try {
    const info = await t.sendMail({ from: FROM, to, subject, html, attachments });
    logger.info(`📧 Email sent → ${to} | ${subject}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    logger.warn(`⚠️  Email failed → ${to}: ${err.message}`);
    return { sent: false, error: err.message };
  }
};

// ─────────────────────────────────────────────────────────────
// 1. RECEIPT EMAIL — after fee payment
// ─────────────────────────────────────────────────────────────
/**
 * @param {object} opts
 * @param {string} opts.to             recipient email
 * @param {string} opts.parentName
 * @param {string} opts.studentName
 * @param {string} opts.receiptNo
 * @param {number} opts.amount
 * @param {string} opts.paymentMode
 * @param {string} opts.academicYear
 * @param {Array}  opts.forMonths      [{month, year}]
 * @param {string} [opts.pdfPath]      attach PDF if path provided & exists
 */
const sendReceiptEmail = async ({
  to, parentName, studentName, receiptNo, amount,
  paymentMode, academicYear, forMonths = [], pdfPath,
}) => {
  const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const period = forMonths.map(m => `${MONTHS[m.month]} ${m.year}`).join(', ') || 'N/A';
  const modeLabel = (paymentMode || '').replace('_', ' ').toUpperCase();

  const html = wrap(`
    <p style="color:#475569;margin:0 0 6px">Dear <strong>${parentName}</strong>,</p>
    <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 20px">
      Your fee payment has been received and recorded. Please find the receipt details below.
    </p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:20px 24px;margin-bottom:22px">
      <div style="font-size:28px;text-align:center;margin-bottom:12px">✅</div>
      <h2 style="color:#166534;text-align:center;margin:0 0 16px;font-size:17px">Payment Confirmed!</h2>

      <table style="width:100%;border-collapse:collapse">
        ${[
          ['Receipt No.',   receiptNo],
          ['Student',       studentName],
          ['Period',        period],
          ['Amount Paid',   `₹${Number(amount).toLocaleString('en-IN')}`],
          ['Payment Mode',  modeLabel],
          ['Academic Year', academicYear],
        ].map(([k, v]) => `
          <tr>
            <td style="color:#64748b;font-size:13px;padding:5px 0;width:40%">${k}</td>
            <td style="font-weight:700;font-size:13px;padding:5px 0;color:#1e293b">${v}</td>
          </tr>`).join('')}
      </table>
    </div>

    ${pdfPath ? '<p style="color:#64748b;font-size:13px">📎 Your receipt PDF is attached to this email.</p>' : ''}

    <div style="text-align:center;margin:24px 0">
      <a href="${FRONTEND_URL}/parent/receipts" style="background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;text-decoration:none;padding:12px 28px;border-radius:50px;font-weight:700;font-size:14px;display:inline-block">
        📋 View All Receipts
      </a>
    </div>

    <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.7">
      Keep this email for your records. For any queries contact the school office.
    </p>
  `, `Payment of ₹${amount.toLocaleString('en-IN')} received — Receipt ${receiptNo}`);

  const attachments = [];
  if (pdfPath && fs.existsSync(pdfPath)) {
    attachments.push({
      filename: `${receiptNo}.pdf`,
      path:     pdfPath,
      contentType: 'application/pdf',
    });
  }

  return send({ to, subject: `✅ Fee Receipt — ${receiptNo} | ${studentName}`, html, attachments });
};

// ─────────────────────────────────────────────────────────────
// 2. WELCOME EMAIL — new parent account created by admin
// ─────────────────────────────────────────────────────────────
const sendWelcomeEmail = async ({ to, parentName, email, tempPassword, studentName }) => {
  const html = wrap(`
    <p style="color:#475569;margin:0 0 6px">Dear <strong>${parentName}</strong>,</p>
    <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 20px">
      Welcome to the ${SCHOOL} parent portal! Your account has been created.
      You can now log in to track fees, download receipts, and stay updated.
    </p>

    <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:14px;padding:20px 24px;margin-bottom:22px">
      <h3 style="color:#3730a3;margin:0 0 14px;font-size:15px">🔐 Your Login Credentials</h3>
      <table style="width:100%">
        ${[
          ['Portal URL',      `<a href="${FRONTEND_URL}/login" style="color:#4F46E5">${FRONTEND_URL}/login</a>`],
          ['Email',           email],
          ['Temp Password',   `<code style="background:#fff;padding:2px 8px;border-radius:6px;font-family:monospace;font-size:13px">${tempPassword}</code>`],
          ["Child's Name",    studentName || '—'],
        ].map(([k, v]) => `
          <tr>
            <td style="color:#6366f1;font-size:12px;font-weight:700;padding:5px 0;width:38%">${k}</td>
            <td style="font-size:13px;padding:5px 0">${v}</td>
          </tr>`).join('')}
      </table>
    </div>

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin-bottom:22px;font-size:12px;color:#92400e">
      ⚠️ Please change your password after your first login for security.
    </div>

    <div style="text-align:center;margin:24px 0">
      <a href="${FRONTEND_URL}/login" style="background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;text-decoration:none;padding:12px 28px;border-radius:50px;font-weight:700;font-size:14px;display:inline-block">
        🚀 Login to Portal
      </a>
    </div>
  `, `Welcome to ${SCHOOL} — Your parent account is ready`);

  return send({ to, subject: `🌟 Welcome to ${SCHOOL} — Parent Portal Access`, html });
};

// ─────────────────────────────────────────────────────────────
// 3. PASSWORD RESET EMAIL
// ─────────────────────────────────────────────────────────────
const sendPasswordResetEmail = async ({ to, name, resetUrl, expiresIn = '30 minutes' }) => {
  const html = wrap(`
    <p style="color:#475569;margin:0 0 6px">Hello <strong>${name}</strong>,</p>
    <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 20px">
      We received a request to reset your password. Click the button below within <strong>${expiresIn}</strong>.
    </p>

    <div style="text-align:center;margin:28px 0">
      <a href="${resetUrl}" style="background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:700;font-size:15px;display:inline-block">
        🔑 Reset Password
      </a>
    </div>

    <p style="color:#64748b;font-size:13px;word-break:break-all">
      Or copy this link: <a href="${resetUrl}" style="color:#4F46E5">${resetUrl}</a>
    </p>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 18px;margin-top:20px;font-size:12px;color:#991b1b">
      🔒 If you did not request this, ignore this email. Your password will remain unchanged.
    </div>
  `, 'Password reset link for your account');

  return send({ to, subject: `🔑 Password Reset — ${SCHOOL}`, html });
};

// ─────────────────────────────────────────────────────────────
// 4. ADMISSION ENQUIRY ACKNOWLEDGEMENT
// ─────────────────────────────────────────────────────────────
const sendAdmissionAcknowledgement = async ({
  to, parentName, childName, program, phone,
}) => {
  const html = wrap(`
    <p style="color:#475569;margin:0 0 6px">Dear <strong>${parentName}</strong>,</p>
    <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 20px">
      Thank you for your interest in admitting <strong>${childName}</strong> to ${SCHOOL}!
      We have received your enquiry for the <strong>${program}</strong> program and will contact you shortly.
    </p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:20px 24px;margin-bottom:22px;text-align:center">
      <div style="font-size:40px;margin-bottom:8px">🎒</div>
      <h3 style="color:#166534;margin:0 0 8px">Enquiry Received!</h3>
      <p style="color:#15803d;margin:0;font-size:13px">
        Our admissions team will call you at <strong>${phone}</strong> within 24 hours.
      </p>
    </div>

    <h4 style="color:#1e293b;margin:0 0 12px;font-size:14px">📋 Next Steps:</h4>
    <ol style="color:#64748b;font-size:13px;line-height:2;padding-left:20px;margin:0 0 20px">
      <li>Our team calls you to schedule a campus visit</li>
      <li>Visit the school and meet our educators</li>
      <li>Submit the required documents</li>
      <li>Pay the registration fee (₹500) to confirm your seat</li>
    </ol>

    <div style="text-align:center;margin:20px 0">
      <a href="${FRONTEND_URL}/admission" style="background:linear-gradient(135deg,#FF6B6B,#FF8E53);color:#fff;text-decoration:none;padding:12px 28px;border-radius:50px;font-weight:700;font-size:14px;display:inline-block">
        📖 View Admission Details
      </a>
    </div>
  `, `Admission enquiry received for ${childName}`);

  return send({ to, subject: `🌟 Admission Enquiry Received — ${SCHOOL}`, html });
};

// ─────────────────────────────────────────────────────────────
// 5. DUE FEE REMINDER (single student — used by parentController)
// ─────────────────────────────────────────────────────────────
const sendFeeReminder = async ({
  to, parentName, studentName, cls, admissionNo,
  pendingMonths = [], totalDue,
}) => {
  const MONTHS_SHORT = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const rows = pendingMonths.map(m => `
    <tr>
      <td style="padding:7px 14px;border-bottom:1px solid #f1f5f9">${MONTHS_SHORT[m.month]} ${m.year}</td>
      <td style="padding:7px 14px;border-bottom:1px solid #f1f5f9;color:#ef4444;font-weight:700">
        ₹${((m.dueAmount || 0) - (m.paidAmount || 0)).toLocaleString('en-IN')}
      </td>
      <td style="padding:7px 14px;border-bottom:1px solid #f1f5f9;color:#f59e0b;font-size:12px">
        ${m.lateFine > 0 ? `+₹${m.lateFine} fine` : '—'}
      </td>
    </tr>`).join('');

  const html = wrap(`
    <p style="color:#475569;margin:0 0 6px">Dear <strong>${parentName}</strong>,</p>
    <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 20px">
      This is a friendly reminder that fees for <strong>${studentName}</strong>
      (Class ${cls} · Adm: ${admissionNo}) are pending for the following months:
    </p>

    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:20px">
      <thead>
        <tr style="background:#f8fafc">
          <th style="padding:9px 14px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase">Month</th>
          <th style="padding:9px 14px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase">Due</th>
          <th style="padding:9px 14px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase">Fine</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-weight:700;color:#374151">Total Outstanding</span>
      <span style="font-size:22px;font-weight:800;color:#ef4444">₹${totalDue.toLocaleString('en-IN')}</span>
    </div>

    <div style="text-align:center;margin:24px 0">
      <a href="${FRONTEND_URL}/parent/pay" style="background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;text-decoration:none;padding:13px 30px;border-radius:50px;font-weight:700;font-size:14px;display:inline-block">
        💳 Pay Online Now
      </a>
    </div>

    <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.8">
      You can also pay at the school office (Mon–Sat 8 AM – 5 PM).<br>
      Quote admission no. <strong>${admissionNo}</strong> at the counter.
    </p>
  `, `Fee reminder — ₹${totalDue.toLocaleString('en-IN')} pending for ${studentName}`);

  return send({
    to,
    subject: `📋 Fee Reminder — ${studentName} (${pendingMonths.length} month${pendingMonths.length > 1 ? 's' : ''} pending)`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────
// 6. ADMIN NOTIFICATION (generic — backup results, system alerts)
// ─────────────────────────────────────────────────────────────
const sendAdminNotification = async ({ subject, title, details = {}, success = true }) => {
  const to = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  if (!to) return { skipped: true };

  const colour = success ? '#16a34a' : '#dc2626';
  const icon   = success ? '✅' : '❌';

  const rows = Object.entries(details)
    .map(([k, v]) => `
      <tr>
        <td style="color:#64748b;font-size:13px;padding:6px 0;width:40%">${k}</td>
        <td style="font-weight:700;font-size:13px;padding:6px 0;color:#1e293b">${v}</td>
      </tr>`).join('');

  const html = wrap(`
    <h2 style="color:${colour};margin:0 0 16px;font-size:17px">${icon} ${title}</h2>
    ${rows ? `<table style="width:100%;margin-bottom:16px">${rows}</table>` : ''}
    <p style="color:#94a3b8;font-size:11px;margin:0">
      Atharv Preschool Management System — Automated Notification
    </p>
  `);

  return send({ to, subject: `${icon} ${subject} — ${SCHOOL}`, html });
};

module.exports = {
  sendReceiptEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAdmissionAcknowledgement,
  sendFeeReminder,
  sendAdminNotification,
};