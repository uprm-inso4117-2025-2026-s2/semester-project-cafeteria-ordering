/*
 * TC-ORD-02: Place Order and Order Confirmation (ID Validation)
 * Author: Gerardo Soto Rios (@GerardoSotoRios)
 *
 * Description:
 * Unit tests for getOrderID(), focusing on validating Order ID format.
 * Type: Unit
 * Ensures IDs are valid Supabase UUIDs and that invalid IDs throw errors.
 * 
 * Preconditions:
 * - Order type has at minimum: order_id (string).
 * - getOrderID(order) is available as the unit under test.
 * - Order IDs are Supabase-generated UUIDs: lowercase hex, format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.
 */

// Test Data
const dummyOrderID = '9f8b7c6d-1234-4a5b-8c9d-0e1f2a3b4c5d';
const dummyInvalidIDs: string[] = [
  'not-a-uuid',
  '12345678-a1b2-4c5d-9988-7766554',
  '12345678a1b24c5d998877665544aabb',
  '12345678-A1B2-4C5D-9988-77665544AABB',
];
export { dummyInvalidIDs, dummyOrderID };

// ─────────────────────────────────────────────
//              Helper
// ─────────────────────────────────────────────

function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id);
}
export { isValidUUID };
/*
 * Test Steps:
 * 1. Call getOrderID() with a valid lowercase UUID and assert the return value matches.
 * 2. Call getOrderID() with undefined order_id, assert error 'Order must have a valid ID.' is thrown.
 *    Call getOrderID() with empty string order_id, assert same error is thrown.
 * 3. Call getOrderID() with each malformed UUID in dummyInvalidIDs,
 *    assert error 'Order ID must be a valid UUID.' is thrown for each.
 *
 * Expected Results:
 * - A valid UUID is returned unchanged.
 * - An empty or missing ID throws 'Order must have a valid ID.'
 * - Any malformed UUID throws 'Order ID must be a valid UUID.'
 *
 * Notes:
 * - Only the format and presence of the order ID is tested.
 * - UUID validation uses regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.
 * - Uniqueness of IDs is assumed and not tested until integration.
 * - Run Command: npx tsx src/tests/ordering/scripts/UT-ORD-2_Place_and_confirmation_for_Order.ts
 * 
 * - Date Created: 2026-03-16
 *
 * Reviewed By:
 * <reviewer(s)>
 */