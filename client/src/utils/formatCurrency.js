/**
 * ============================================================
 * formatCurrency.js — Indian Currency Utilities
 * ============================================================
 * All helpers needed across the Atharv Preschool app:
 *   formatCurrency()       → ₹1,50,000
 *   formatCurrencyShort()  → ₹1.5L / ₹45K
 *   amountInWords()        → "One Thousand Five Hundred Rupees Only"
 *   parseCurrency()        → "₹1,500" → 1500
 *   applyDiscount()        → value after % discount
 *   calcLateFine()         → fine based on days overdue
 *   splitAmount()          → break total into fee heads
 * ============================================================
 */

// ─── Core formatter ─────────────────────────────────────────

/**
 * Format a number as Indian Rupees.
 *
 * @param {number|string} amount
 * @param {object}  opts
 * @param {boolean} opts.showSymbol   – prefix ₹ symbol       (default: true)
 * @param {boolean} opts.showDecimal  – show paise decimals    (default: false)
 * @param {boolean} opts.showNegative – show minus for negatives (default: true)
 * @returns {string}
 *
 * @example
 *   formatCurrency(1500)                       // "₹1,500"
 *   formatCurrency(150000)                     // "₹1,50,000"
 *   formatCurrency(1500.50, {showDecimal:true})// "₹1,500.50"
 *   formatCurrency(1500, {showSymbol:false})   // "1,500"
 *   formatCurrency(-500)                       // "-₹500"
 *   formatCurrency(null)                       // "₹0"
 */
export const formatCurrency = (
  amount,
  { showSymbol = true, showDecimal = false, showNegative = true } = {}
) => {
  const num = Number(amount);
  if (amount === null || amount === undefined || isNaN(num)) {
    return showSymbol ? '₹0' : '0';
  }

  const abs = Math.abs(num);
  const formatted = abs.toLocaleString('en-IN', {
    minimumFractionDigits: showDecimal ? 2 : 0,
    maximumFractionDigits: showDecimal ? 2 : 0,
  });

  const symbol = showSymbol ? '₹' : '';
  const sign   = num < 0 && showNegative ? '-' : '';
  return `${sign}${symbol}${formatted}`;
};

// ─── Compact / short form ───────────────────────────────────

/**
 * Compact Indian currency format.
 *
 * @param {number} amount
 * @returns {string}
 *
 * @example
 *   formatCurrencyShort(150000)   // "₹1.5L"
 *   formatCurrencyShort(10000000) // "₹1Cr"
 *   formatCurrencyShort(45000)    // "₹45K"
 *   formatCurrencyShort(800)      // "₹800"
 */
export const formatCurrencyShort = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return '₹0';
  if (Math.abs(num) >= 10_000_000) {
    return `₹${(num / 10_000_000).toFixed(1).replace(/\.0$/, '')}Cr`;
  }
  if (Math.abs(num) >= 100_000) {
    return `₹${(num / 100_000).toFixed(1).replace(/\.0$/, '')}L`;
  }
  if (Math.abs(num) >= 1_000) {
    return `₹${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `₹${num}`;
};

// ─── Amount in words (for receipts / cheques) ───────────────

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
  'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

const _toWords = (n) => {
  if (n === 0)  return '';
  if (n < 20)   return ONES[n] + ' ';
  if (n < 100)  return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '') + ' ';
  return ONES[Math.floor(n / 100)] + ' Hundred ' + _toWords(n % 100);
};

/**
 * Convert a number to Indian words (used on PDF receipts).
 *
 * @param {number} amount
 * @returns {string}
 *
 * @example
 *   amountInWords(1500)    // "One Thousand Five Hundred Rupees Only"
 *   amountInWords(100050)  // "One Lakh Fifty Rupees Only"
 *   amountInWords(3500.50) // "Three Thousand Five Hundred Rupees and Fifty Paise Only"
 */
export const amountInWords = (amount) => {
  const num = Number(amount);
  if (!num || isNaN(num)) return 'Zero Rupees Only';

  const rupees = Math.floor(num);
  const paise  = Math.round((num - rupees) * 100);

  let result = '';
  let n = rupees;

  if (n >= 10_000_000) { result += _toWords(Math.floor(n / 10_000_000)) + 'Crore '; n %= 10_000_000; }
  if (n >= 100_000)    { result += _toWords(Math.floor(n / 100_000))    + 'Lakh ';  n %= 100_000; }
  if (n >= 1_000)      { result += _toWords(Math.floor(n / 1_000))      + 'Thousand '; n %= 1_000; }
  if (n > 0)           { result += _toWords(n); }

  result = result.trim() + ' Rupees';
  if (paise > 0) result += ` and ${_toWords(paise).trim()} Paise`;
  return result + ' Only';
};

// ─── Parse ──────────────────────────────────────────────────

/**
 * Strip ₹ symbol and commas, return a plain number.
 *
 * @param {string|number} str
 * @returns {number}
 *
 * @example
 *   parseCurrency("₹1,50,000") // 150000
 *   parseCurrency("1,500")     // 1500
 */
export const parseCurrency = (str) => {
  if (str === null || str === undefined) return 0;
  return Number(String(str).replace(/[₹,\s]/g, '')) || 0;
};

// ─── Discount ───────────────────────────────────────────────

/**
 * Return amount after applying a percentage discount.
 * Always rounds to the nearest rupee.
 *
 * @param {number} amount
 * @param {number} discountPercent  (0–100)
 * @returns {number}
 *
 * @example
 *   applyDiscount(3000, 10) // 2700
 */
export const applyDiscount = (amount, discountPercent) => {
  const pct = Math.min(100, Math.max(0, Number(discountPercent) || 0));
  return Math.round(Number(amount) * (1 - pct / 100));
};

/**
 * Return only the discount amount (not the discounted value).
 *
 * @param {number} amount
 * @param {number} discountPercent
 * @returns {number}
 *
 * @example
 *   discountAmount(3000, 10) // 300
 */
export const discountAmount = (amount, discountPercent) => {
  return Math.round(Number(amount) - applyDiscount(amount, discountPercent));
};

// ─── Late fine ──────────────────────────────────────────────

/**
 * Calculate late fine based on days overdue.
 *
 * @param {number} daysLate
 * @param {number} finePerDay   – per day fine in ₹ (default: 5)
 * @param {number} maxFine      – cap on fine (default: 500)
 * @returns {number}
 *
 * @example
 *   calcLateFine(10)        // 50  (10 × ₹5)
 *   calcLateFine(200, 5, 500) // 500 (capped)
 */
export const calcLateFine = (daysLate, finePerDay = 5, maxFine = 500) => {
  const days = Math.max(0, Math.floor(Number(daysLate)));
  return Math.min(days * finePerDay, maxFine);
};

// ─── Fee breakdown helper ────────────────────────────────────

/**
 * Split a total payment amount proportionally across fee heads.
 * Useful when a student pays a partial amount.
 *
 * @param {number}   totalPaid
 * @param {Array}    feeHeads   – [{ name, amount }]
 * @returns {Array}             – [{ name, amount, paid, balance }]
 *
 * @example
 *   splitAmount(1500, [{ name: 'Tuition', amount: 2000 }, { name: 'Activity', amount: 500 }])
 *   // [{ name: 'Tuition', amount: 2000, paid: 1200, balance: 800 },
 *   //  { name: 'Activity', amount: 500, paid: 300, balance: 200 }]
 */
export const splitAmount = (totalPaid, feeHeads = []) => {
  const totalDue = feeHeads.reduce((s, h) => s + Number(h.amount || 0), 0);
  if (totalDue === 0) return feeHeads.map(h => ({ ...h, paid: 0, balance: h.amount }));

  let remaining = Math.min(Number(totalPaid), totalDue);
  return feeHeads.map((h) => {
    const due    = Number(h.amount || 0);
    const paid   = Math.min(remaining, due);
    remaining   -= paid;
    return { ...h, paid, balance: due - paid };
  });
};

export default formatCurrency;