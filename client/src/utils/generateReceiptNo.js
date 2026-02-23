/**
 * Utility to generate a standardized Receipt Number for Atharv Preschool.
 * Format: APS / [Academic Year] / [Padded Serial Number]
 * Example: APS/25-26/00042
 */

export const generateReceiptNo = (count, academicYear = '25-26') => {
  // Ensure count is a number, default to 0 if invalid
  const serial = Number(count) || 0;

  // Increment the count for the current receipt
  const nextSerial = serial + 1;

  // Pad the serial number with leading zeros (e.g., 42 -> 00042)
  const paddedSerial = String(nextSerial).padStart(5, '0');

  // Return the formatted string
  return `APS/${academicYear}/${paddedSerial}`;
};

/**
 * Utility to extract just the numeric part from a receipt string if needed
 * Example: "APS/25-26/00042" -> 42
 */
export const getSerialFromReceipt = (receiptString) => {
  if (!receiptString) return 0;
  const parts = receiptString.split('/');
  const lastPart = parts[parts.length - 1];
  return parseInt(lastPart, 10);
};