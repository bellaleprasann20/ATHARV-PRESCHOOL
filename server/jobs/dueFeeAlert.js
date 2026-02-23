/**
 * jobs/dueFeeAlert.js
 *
 * Sends email (+ optional SMS) reminders to parents whose children
 * have pending/overdue fee months.
 *
 * Called by:
 *   scheduler.js  → 12th of every month at 9 AM IST
 *   Admin API     → POST /api/reports/send-due-alerts  (manual trigger)
 *
 * Env vars:
 *   DUE_ALERT_ENABLED=true        (default true)
 *   EMAIL_HOST / EMAIL_PORT / EMAIL_USER / EMAIL_PASS / EMAIL_FROM
 *   FAST2SMS_API_KEY               (optional, for SMS)
 *   FRONTEND_URL                   (link in email — e.g. https://yourapp.in)
 *   GRACE_DAYS=0                   (days after due date before alerting)
 */

const nodemailer    = require('nodemailer');
const FeeAssignment = require('../models/FeeAssignment');
const Student       = require('../models/Student');
const Parent        = require('../models/Parent');
const logger        = require('../utils/logger');

const ENABLED    = process.env.DUE_ALERT_ENABLED !== 'false';
const GRACE_DAYS = parseInt(process.env.GRACE_DAYS || '0', 10);
const MONTHS     = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ── Email transporter (created once) ─────────────────────────
const makeTransporter = () => {
  if (!process.env.EMAIL_USER) return null;
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST  || 'smtp.gmail.com',
    port:   Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_PORT === '465',
    auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
};

// ── Email HTML ────────────────────────────────────────────────
const buildHTML = ({ parentName, studentName, cls, admissionNo, pendingMonths, totalDue }) => {
  const rows = pendingMonths.map((m) => {
    const due = (m.dueAmount - m.paidAmount).toLocaleString('en-IN');
    const fine = m.lateFine > 0 ? `+₹${m.lateFine} fine` : '—';
    return `<tr>
      <td style="padding:8px 14px;border-bottom:1px solid #f3f4f6">${MONTHS[m.month]} ${m.year}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #f3f4f6;color:#ef4444;font-weight:700">₹${due}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #f3f4f6;color:#f59e0b;font-size:12px">${fine}</td>
    </tr>`;
  }).join('');

  const payUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/parent/pay`;

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;background:#f8fafc;font-family:'Segoe UI',sans-serif">
<div style="max-width:520px;margin:30px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">

  <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:28px 32px;text-align:center">
    <div style="font-size:36px;margin-bottom:8px">🌟</div>
    <h1 style="color:#fff;margin:0;font-size:20px;font-weight:800">Atharv Preschool & Daycare</h1>
    <p style="color:rgba(255,255,255,.75);margin:4px 0 0;font-size:13px">Fee Payment Reminder</p>
  </div>

  <div style="padding:28px 32px">
    <p style="color:#374151;margin:0 0 6px">Dear <strong>${parentName}</strong>,</p>
    <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 20px">
      This is a friendly reminder that school fees for
      <strong>${studentName}</strong> (Class ${cls} · Adm&nbsp;No: <strong>${admissionNo}</strong>)
      are pending for the following month(s):
    </p>

    <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:20px">
      <thead>
        <tr style="background:#f9fafb">
          <th style="padding:10px 14px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase">Month</th>
          <th style="padding:10px 14px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase">Amount Due</th>
          <th style="padding:10px 14px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase">Late Fine</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-weight:700;color:#374151">Total Outstanding</span>
      <span style="font-size:24px;font-weight:800;color:#ef4444">₹${totalDue.toLocaleString('en-IN')}</span>
    </div>

    <div style="text-align:center;margin-bottom:24px">
      <a href="${payUrl}" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:800;font-size:15px;display:inline-block">
        💳 Pay Online Now
      </a>
    </div>

    <p style="color:#6b7280;font-size:13px;line-height:1.7;margin:0">
      You can also pay cash at the school office (Mon–Sat, 8 AM – 5 PM).<br>
      Please quote admission number <strong>${admissionNo}</strong> at the counter.
    </p>
  </div>

  <div style="background:#f9fafb;padding:18px 32px;border-top:1px solid #f3f4f6;text-align:center">
    <p style="color:#9ca3af;font-size:12px;margin:0">
      📞 +91 98765 43210 &nbsp;|&nbsp; ✉️ ${process.env.SCHOOL_EMAIL || 'info@atharvpreschool.in'}<br>
      ${process.env.SCHOOL_ADDRESS || '123 Education Lane, Pune, Maharashtra 411001'}
    </p>
  </div>
</div>
</body></html>`;
};

// ── SMS via Fast2SMS ──────────────────────────────────────────
const sendSMS = async (phone, message) => {
  if (!process.env.FAST2SMS_API_KEY) return { skipped: true, reason: 'API key not set' };
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return { skipped: true, reason: 'Invalid phone' };

  try {
    const https = require('https');
    const body  = JSON.stringify({
      route: 'v3', sender_id: 'TXTIND',
      message, language: 'english', numbers: digits,
    });
    return await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'www.fast2sms.com',
        path:     '/dev/bulkV2',
        method:   'POST',
        headers:  {
          authorization:  process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      }, (res) => {
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => resolve({ sent: true, response: JSON.parse(data) }));
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  } catch (err) {
    return { sent: false, error: err.message };
  }
};

// ── MAIN ──────────────────────────────────────────────────────
/**
 * Send due fee alerts to all parents with overdue/pending months.
 *
 * @param {object} opts
 * @param {boolean} opts.emailAlerts   default true
 * @param {boolean} opts.smsAlerts     default true
 * @param {string}  opts.academicYear  optional filter
 * @returns {Promise<{processed,emailed,smsed,skipped,errors}>}
 */
const runDueFeeAlerts = async ({
  emailAlerts  = true,
  smsAlerts    = true,
  academicYear = null,
} = {}) => {
  if (!ENABLED) {
    logger.info('⏭️  Due fee alerts disabled (DUE_ALERT_ENABLED=false)');
    return { skipped: true };
  }

  logger.info('📢 Due fee alert job starting...');
  const t0 = Date.now();

  const summary = { processed: 0, emailed: 0, smsed: 0, skipped: 0, errors: [] };
  const transporter = makeTransporter();

  // Cutoff: only alert if due date is past this point
  const cutoff = new Date();
  if (GRACE_DAYS) cutoff.setDate(cutoff.getDate() - GRACE_DAYS);

  const query = { isActive: true };
  if (academicYear) query.academicYear = academicYear;

  const assignments = await FeeAssignment.find(query).populate({
    path:    'student',
    match:   { status: 'active' },
    select:  'firstName lastName admissionNo class guardianPhone guardianEmail parent',
    populate: {
      path:   'parent',
      select: 'fatherName motherName primaryPhone email communicationPreference',
    },
  });

  for (const asgn of assignments) {
    const student = asgn.student;
    if (!student) continue;

    // Find pending months that are past their due date (or have no due date)
    const overdue = asgn.monthlyStatus.filter((m) => {
      if (m.status !== 'pending' && m.status !== 'partial') return false;
      if (!m.dueDate) return true;
      return new Date(m.dueDate) <= cutoff;
    });

    if (!overdue.length) { summary.skipped++; continue; }

    summary.processed++;

    const parent     = student.parent;
    const comm       = parent?.communicationPreference ?? { email: true, sms: true };
    const parentName = parent?.fatherName || parent?.motherName || 'Parent';
    const phone      = parent?.primaryPhone || student.guardianPhone;
    const email      = parent?.email || student.guardianEmail;
    const totalDue   = overdue.reduce(
      (s, m) => s + (m.dueAmount - m.paidAmount) + (m.lateFine || 0), 0
    );

    const payload = {
      parentName,
      studentName: `${student.firstName} ${student.lastName}`,
      cls:         student.class,
      admissionNo: student.admissionNo,
      pendingMonths: overdue,
      totalDue,
    };

    // ── Email ───────────────────────────────────────────────
    if (emailAlerts && email && comm.email !== false && transporter) {
      try {
        await transporter.sendMail({
          from:    process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to:      email,
          subject: `Fee Reminder — ${student.firstName} ${student.lastName} (${overdue.length} month${overdue.length > 1 ? 's' : ''} pending)`,
          html:    buildHTML(payload),
        });
        summary.emailed++;
        logger.info(`  📧 Email → ${email} [${student.admissionNo}]`);
      } catch (err) {
        summary.errors.push({ admissionNo: student.admissionNo, type: 'email', error: err.message });
        logger.warn(`  ⚠️  Email failed [${student.admissionNo}]: ${err.message}`);
      }
    }

    // ── SMS ─────────────────────────────────────────────────
    if (smsAlerts && phone && comm.sms !== false) {
      const msg = `Dear ${parentName}, fee reminder: ₹${totalDue.toLocaleString('en-IN')} due for ${student.firstName} (${overdue.length} month${overdue.length > 1 ? 's' : ''}). Pay: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/parent/pay - Atharv Preschool`;
      const res = await sendSMS(phone, msg);
      if (res.sent) {
        summary.smsed++;
        logger.info(`  📱 SMS → ${phone} [${student.admissionNo}]`);
      }
    }
  }

  const duration = ((Date.now() - t0) / 1000).toFixed(1);
  logger.info(
    `✅ Due fee alerts done in ${duration}s | Processed: ${summary.processed} | Emailed: ${summary.emailed} | SMS: ${summary.smsed} | Skipped: ${summary.skipped}`
  );

  return { ...summary, duration: parseFloat(duration) };
};

module.exports = { runDueFeeAlerts };