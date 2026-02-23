/**
 * services/smsService.js  (you referred to this as "amsService.js")
 *
 * Centralised SMS sender via Fast2SMS Bulk API.
 * Falls back gracefully if FAST2SMS_API_KEY is not set.
 *
 * Exports:
 *   sendSMS(phone, message)             → Promise<{sent, messageId?}>
 *   sendFeeReminderSMS(opts)            → fee due reminder
 *   sendPaymentConfirmSMS(opts)         → payment received confirmation
 *   sendWelcomeSMS(opts)               → new parent account welcome
 *   sendOTP(phone, otp)                → one-time password (future use)
 */

const https  = require('https');
const logger = require('../utils/logger');

const API_KEY   = process.env.FAST2SMS_API_KEY;
const SCHOOL    = process.env.SCHOOL_NAME || 'Atharv Preschool';
const SENDER_ID = 'TXTIND'; // Fast2SMS sender ID (6 chars, uppercase)

// ── Core sender ───────────────────────────────────────────────
/**
 * Send a plain text SMS via Fast2SMS Bulk V2 API.
 *
 * @param {string} phone    10-digit mobile number (cleans non-digits automatically)
 * @param {string} message  SMS body (< 160 chars for single SMS, up to 640 chars)
 * @returns {Promise<{sent, messageId?, error?, skipped?}>}
 */
const sendSMS = async (phone, message) => {
  if (!API_KEY) {
    logger.warn('⚠️  smsService: FAST2SMS_API_KEY not set — SMS skipped');
    return { skipped: true, reason: 'API key not configured' };
  }

  // Clean to exactly 10 digits
  const digits = String(phone).replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) {
    logger.warn(`⚠️  smsService: Invalid phone number: ${phone}`);
    return { skipped: true, reason: `Invalid phone: ${phone}` };
  }

  const body = JSON.stringify({
    route:     'v3',
    sender_id: SENDER_ID,
    message:   String(message).slice(0, 640), // API max
    language:  'english',
    numbers:   digits,
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'www.fast2sms.com',
        path:     '/dev/bulkV2',
        method:   'POST',
        headers:  {
          authorization:   API_KEY,
          'Content-Type':  'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', d => (raw += d));
        res.on('end', () => {
          try {
            const data = JSON.parse(raw);
            if (data.return === true) {
              logger.info(`📱 SMS sent → ${digits}`);
              resolve({ sent: true, messageId: data.request_id, response: data });
            } else {
              logger.warn(`⚠️  SMS failed → ${digits}: ${JSON.stringify(data)}`);
              resolve({ sent: false, error: data.message || 'Unknown Fast2SMS error' });
            }
          } catch (e) {
            logger.warn(`⚠️  SMS response parse error: ${e.message}`);
            resolve({ sent: false, error: e.message });
          }
        });
      }
    );

    req.on('error', (err) => {
      logger.warn(`⚠️  SMS request error: ${err.message}`);
      resolve({ sent: false, error: err.message });
    });

    req.write(body);
    req.end();
  });
};

// ── Template helpers ──────────────────────────────────────────

/**
 * Fee due reminder SMS.
 *
 * @param {object} opts
 * @param {string} opts.phone
 * @param {string} opts.parentName
 * @param {string} opts.studentName
 * @param {number} opts.totalDue       Total ₹ amount due
 * @param {number} opts.monthCount     Number of pending months
 */
const sendFeeReminderSMS = ({ phone, parentName, studentName, totalDue, monthCount }) => {
  const amount = Number(totalDue).toLocaleString('en-IN');
  const msg =
    `Dear ${parentName}, fee reminder: Rs.${amount} due for ${studentName} ` +
    `(${monthCount} month${monthCount > 1 ? 's' : ''}). ` +
    `Pay online: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/parent/pay - ${SCHOOL}`;
  return sendSMS(phone, msg);
};

/**
 * Payment received confirmation SMS.
 *
 * @param {object} opts
 * @param {string} opts.phone
 * @param {string} opts.parentName
 * @param {string} opts.studentName
 * @param {number} opts.amount
 * @param {string} opts.receiptNo
 */
const sendPaymentConfirmSMS = ({ phone, parentName, studentName, amount, receiptNo }) => {
  const amountFmt = Number(amount).toLocaleString('en-IN');
  const msg =
    `Dear ${parentName}, Rs.${amountFmt} received for ${studentName}. ` +
    `Receipt: ${receiptNo}. Thank you! - ${SCHOOL}`;
  return sendSMS(phone, msg);
};

/**
 * Welcome SMS for new parent accounts.
 *
 * @param {object} opts
 * @param {string} opts.phone
 * @param {string} opts.parentName
 * @param {string} opts.tempPassword
 */
const sendWelcomeSMS = ({ phone, parentName, tempPassword }) => {
  const url = process.env.FRONTEND_URL || 'http://localhost:5173';
  const msg =
    `Welcome to ${SCHOOL}, ${parentName}! ` +
    `Login at ${url}/login with your registered email and password: ${tempPassword} ` +
    `Please change your password after login.`;
  return sendSMS(phone, msg);
};

/**
 * OTP SMS (for future phone-based auth or payment verification).
 *
 * @param {string} phone
 * @param {string|number} otp
 */
const sendOTP = (phone, otp) => {
  const msg = `Your ${SCHOOL} OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;
  return sendSMS(phone, msg);
};

module.exports = {
  sendSMS,
  sendFeeReminderSMS,
  sendPaymentConfirmSMS,
  sendWelcomeSMS,
  sendOTP,
};