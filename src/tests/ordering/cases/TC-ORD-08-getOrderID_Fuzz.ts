/*
 * TC-ORD-08: getOrderID() Fuzz Testing
 * Author: Gerardo Soto Rios (@GerardoSotoRios)
 *
 * Description:
 * Fuzz testing data and helper utilities for getOrderID().
 * Type: Fuzz Test
 * Ensures the function safely handles malformed, randomized,
 * oversized, and syntactically incorrect inputs without crashing.
 *
 * Preconditions:
 * - getOrderID(orderId) is available as the unit under test.
 * - Order IDs are expected to be Supabase UUID strings.
 * - The system can safely reject invalid runtime inputs.
 */

// ─────────────────────────────────────────────
//              Helper Functions
// ─────────────────────────────────────────────

function randomString(length: number): string {
    const alphabet =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
  
    let result = '';
  
    for (let i = 0; i < length; i += 1) {
      result += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  
    return result;
  }
  
  function randomUUIDLikeString(): string {
    return `${randomString(8)}-${randomString(4)}-${randomString(4)}-${randomString(4)}-${randomString(12)}`;
  }
  
  function validateOrderResult(result: any): boolean {
    return result === null || typeof result === 'string';
  }
  
  // ─────────────────────────────────────────────
  //              Test Data
  // ─────────────────────────────────────────────
  
  const STRING_LENGTHS = [1, 4, 8, 16, 32, 48];
  
  const validOrderID = '9f8b7c6d-1234-4a5b-8c9d-0e1f2a3b4c5d';
  
  const fuzzInputs: any[] = [
    // Falsy / empty
    '',
    null,
    undefined,
    '   ',         // whitespace — bypasses !orderId guard
    '\x00',        // null byte
    '\u200B',      // zero-width space
  
    // Wrong runtime types
    12345,
    true,
    false,
    [],
    {},
    NaN,
    Infinity,
  
    // SQL injection
    "' OR 1=1 --",
    "'; DROP TABLE orders; --",
  
    // Unicode
    '🔥🔥🔥',
    '🔥á🚀ñ💀',
  
    // Oversized
    'S'.repeat(1000),
  
    // Boundary-length random strings (generated at load time)
    ...STRING_LENGTHS.map((len) => randomString(len)),
  
    // UUID-like but malformed
    randomUUIDLikeString(),
  ];
  
  function randomMalformedInput(): any {
    const pool = [
      ...fuzzInputs,
      randomString(500),
      randomUUIDLikeString(),
    ];
  
    return pool[Math.floor(Math.random() * pool.length)];
  }
  
  // ─────────────────────────────────────────────
  //              Exports
  // ─────────────────────────────────────────────
  
  export {
    fuzzInputs, randomMalformedInput,
    randomString,
    randomUUIDLikeString, STRING_LENGTHS, validateOrderResult, validOrderID
};
  
  /*
   * Test Steps:
   * 1. Call getOrderID() using randomized malformed inputs.
   * 2. Pass invalid runtime types such as numbers, arrays, objects, and booleans.
   * 3. Pass malformed UUID-like strings and injection-style payloads.
   * 4. Pass oversized and Unicode-containing strings.
   * 5. Pass whitespace-only, null-byte, and zero-width-space strings.
   * 6. Verify the function safely handles all inputs without crashing.
   * 7. Validate that returned values are either null or valid strings.
   *
   * Expected Results:
   * - Invalid inputs are safely rejected.
   * - The function does not crash during fuzz execution.
   * - Malformed UUIDs do not bypass validation.
   * - Whitespace-only and invisible-character strings are handled safely.
   * - Returned values remain type-safe.
   * - Errors are handled gracefully.
   *
   * Notes:
   * - This suite focuses on runtime robustness rather than database correctness.
   * - Fuzz inputs include malformed, oversized, Unicode, and injection-like payloads.
   * - The goal is to identify unexpected runtime failures or unsafe handling.
   * - Run Command to execute test:
   *   npx tsx src/tests/ordering/scripts/FT-ORD-08-getOrderID_Fuzz.ts
   *
   * - Date Created: 2026-05-26
   *
   * Reviewed By:
   * <reviewer(s)>
   */

