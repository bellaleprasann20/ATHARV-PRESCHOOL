import { format, isValid, parseISO } from 'date-fns';

/**
 * Helper to ensure we have a valid Date object regardless of input type
 */
const parseDate = (date) => {
  if (date instanceof Date) return date;
  if (typeof date === 'string') return parseISO(date);
  if (typeof date === 'number') return new Date(date);
  return new Date(date); // Fallback for other types
};

/**
 * Standard Date: Used for DOB or Enrollment dates
 * Example: 2026-02-21 -> 21 Feb 2026
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = parseDate(date);
  return isValid(d) ? format(d, 'dd MMM yyyy') : 'Invalid Date';
};

/**
 * Detailed Date: Used for Receipt timestamps
 * Example: 21 Feb 2026, 01:45 PM
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  const d = parseDate(date);
  return isValid(d) ? format(d, 'dd MMM yyyy, hh:mm a') : 'Invalid Date';
};

/**
 * Short Date: Used for compact tables or small screens
 * Example: 21/02/26
 */
export const formatShortDate = (date) => {
  if (!date) return '';
  const d = parseDate(date);
  return isValid(d) ? format(d, 'dd/MM/yy') : '';
};

/**
 * Month Year: Useful for monthly fee tracking
 * Example: Feb 2026
 */
export const formatMonthYear = (date) => {
  if (!date) return 'N/A';
  const d = parseDate(date);
  return isValid(d) ? format(d, 'MMM yyyy') : 'Invalid Date';
};