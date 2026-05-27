/*
TC-AUTH-10 - Input Validation Fuzz Testing for User Forms
Author: JadStelar

Description
Validate that authentication-related user forms handle malformed or unexpected inputs safely.
Types of tests: Unit/Integration (validation functions) plus manual/automated UI checks.

Preconditions
* Login and signup forms are implemented and reachable.
* Validation logic is available (validate() functions).
* Test environment is configured and stable.
* Test data is non-production.
*/

// Test Data

const stringLengths = [0, 1, 4, 8, 16, 32, 64, 128, 256];

const fuzzPayloads = [
  '',
  ' ',
  '   ',
  '\t',
  '\n',
  '\u0000',
  '!-_+={}',
  '!@#$%^&*()_+{}|:"<>?`~[]\\;\',./',
  "' OR '1'='1",
  '" OR "1"="1',
  "'; DROP TABLE users; --",
  "admin'--",
  '<script>alert(1)</script>',
  'user@',
  'user@domain',
  'user@domain..com',
  'a@b',
  '-1',
  '0',
  '1234567890',
  'caf\u00e9',
  '\u30e6\u30fc\u30b6\u30fc',
];

const sqlPatterns = [
  "' OR '1'='1",
  '" OR "1"="1',
  "'; DROP TABLE users; --",
  "admin'--",
];

const xssPatterns = ['<script>alert(1)</script>'];

export { fuzzPayloads, sqlPatterns, stringLengths, xssPatterns };

/*
Test Steps

1. Login form fuzz (automation or manual)
   a. For each payload, set Email and Password fields and submit.
   b. Verify validation errors appear when inputs are empty or malformed.
   c. Ensure app does not crash and no unhandled exceptions occur.

2. Signup form fuzz (automation or manual)
   a. For each payload, set Full Name, Email, Password, Confirm Password fields.
   b. Toggle Terms acceptance true/false.
   c. Verify validation errors appear when inputs are empty, mismatched, or malformed.
   d. Ensure app does not crash and no unhandled exceptions occur.

3. Other forms (manual unless validation functions are available)
   a. Checkout form: apply fuzz inputs to name, contact, and notes fields.
   b. Payment form: apply fuzz inputs to card number, expiry, CVC, and billing name.
   c. Address/contact form: apply fuzz inputs to address line, city, zip, phone.
   d. Promo code: apply fuzz inputs to promo code field.
   e. Observe validation messages, error handling, and stability.

Expected Results

* Validation errors are shown for empty, malformed, or invalid inputs.
* No crashes, hangs, or unhandled exceptions during fuzz input submission.
* Security protections remain active for SQL injection and script payloads.
* Users receive meaningful feedback and can recover after correcting inputs.

Reviewed By
<reviewer(s) fill this part>
*/
