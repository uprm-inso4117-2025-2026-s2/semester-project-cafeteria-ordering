/**
 * ============================================================================
 * UNIT TESTS: validation.ts utility functions
 * ============================================================================
 * @id      TC-UTIL-VALIDATION-01
 * @author  Januel E. Torres Marquez
 * @issue   #576
 * ============================================================================
 * Exercises isValidEmail, isValidPassword, and formatPhoneNumber with both
 * valid and invalid inputs (equivalence partitioning + boundary values).
 * ============================================================================
 */

import {
  formatPhoneNumber,
  isValidEmail,
  isValidPassword,
} from '../../../lib/validation';

describe('isValidEmail', () => {
  it.each([
    ['user@example.com'],
    ['valid.user@uni.edu'],
    ['first.last+tag@sub.domain.co'],
    ['a@b.cd'],
    ['  trimmed@example.com  '],
  ])('accepts valid email: %s', (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each([
    ['', 'empty string'],
    ['   ', 'whitespace only'],
    ['notanemail', 'missing @ and domain'],
    ['missing@domain', 'no top-level domain'],
    ['missingatsign.com', 'missing @'],
    ['user@@example.com', 'double @'],
    ['user @example.com', 'space inside local part'],
    ['user@exa mple.com', 'space inside domain'],
    ['@nouser.com', 'missing local part'],
    ['user@.com', 'domain starts with dot'],
  ])('rejects invalid email %s (%s)', (email) => {
    expect(isValidEmail(email)).toBe(false);
  });

  it('rejects non-string inputs', () => {
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
    expect(isValidEmail(null as unknown as string)).toBe(false);
    expect(isValidEmail(123 as unknown as string)).toBe(false);
  });

  it('rejects emails longer than 254 characters', () => {
    const localPart = 'a'.repeat(250);
    const longEmail = `${localPart}@example.com`;
    expect(longEmail.length).toBeGreaterThan(254);
    expect(isValidEmail(longEmail)).toBe(false);
  });
});

describe('isValidPassword', () => {
  it.each([
    ['Password1'],
    ['Abcdefg9'],
    ['StrongPass123!'],
    ['aB3aaaaa'],
  ])('accepts valid password: %s', (password) => {
    expect(isValidPassword(password)).toBe(true);
  });

  it.each([
    ['', 'empty'],
    ['Ab1', 'too short'],
    ['Abcdefgh', 'no number'],
    ['abcdefg1', 'no uppercase'],
    ['ABCDEFG1', 'no lowercase'],
    ['ABCDEFGH', 'no number and no lowercase'],
    ['12345678', 'digits only'],
  ])('rejects invalid password "%s" (%s)', (password) => {
    expect(isValidPassword(password)).toBe(false);
  });

  it('treats the 8-character minimum as inclusive (boundary)', () => {
    expect(isValidPassword('Abcdefg1')).toBe(true);
    expect(isValidPassword('Abcdef1')).toBe(false);
  });

  it('rejects non-string inputs', () => {
    expect(isValidPassword(undefined as unknown as string)).toBe(false);
    expect(isValidPassword(null as unknown as string)).toBe(false);
  });
});

describe('formatPhoneNumber', () => {
  it('strips spaces, dashes, parentheses, and dots', () => {
    expect(formatPhoneNumber('(787) 555-1212')).toBe('7875551212');
    expect(formatPhoneNumber('787.555.1212')).toBe('7875551212');
    expect(formatPhoneNumber('787 555 1212')).toBe('7875551212');
    expect(formatPhoneNumber('787-555-1212')).toBe('7875551212');
  });

  it('preserves a single leading "+" for international numbers', () => {
    expect(formatPhoneNumber('+1 (787) 555-1212')).toBe('+17875551212');
    expect(formatPhoneNumber('+44 20 7946 0958')).toBe('+442079460958');
  });

  it('returns an empty string for empty, whitespace, or non-string input', () => {
    expect(formatPhoneNumber('')).toBe('');
    expect(formatPhoneNumber('   ')).toBe('');
    expect(formatPhoneNumber(undefined as unknown as string)).toBe('');
    expect(formatPhoneNumber(null as unknown as string)).toBe('');
  });

  it('strips letters and other invalid characters', () => {
    expect(formatPhoneNumber('abc787def555xyz1212')).toBe('7875551212');
    expect(formatPhoneNumber('787-CALL-NOW')).toBe('787');
  });

  it('returns only digits when no leading "+" is present, even if "+" appears mid-string', () => {
    expect(formatPhoneNumber('787+555+1212')).toBe('7875551212');
  });

  it('returns an empty string when input has no digits', () => {
    expect(formatPhoneNumber('abc-def-ghij')).toBe('');
    expect(formatPhoneNumber('+')).toBe('');
  });
});
