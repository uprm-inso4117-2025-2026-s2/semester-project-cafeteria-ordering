/**
 * Centralized input validation utilities.
 *
 * Used by Signup, Login, and Edit Profile screens to enforce consistent
 * email, password, and phone number rules across the app.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}

/**
 * Password rules (match the on-screen checklist in signup):
 *  - at least 8 characters
 *  - at least 1 lowercase letter
 *  - at least 1 uppercase letter
 *  - at least 1 number
 */
export function isValidPassword(password: string): boolean {
  if (typeof password !== 'string') return false;
  if (password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

/**
 * Strips all non-digit characters from a phone number and returns the
 * remaining digits. Preserves a single leading "+" if present.
 * Returns an empty string for null/undefined input.
 */
export function formatPhoneNumber(phone: string): string {
  if (typeof phone !== 'string') return '';
  const trimmed = phone.trim();
  if (trimmed.length === 0) return '';
  const hasLeadingPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  return hasLeadingPlus && digits.length > 0 ? `+${digits}` : digits;
}
