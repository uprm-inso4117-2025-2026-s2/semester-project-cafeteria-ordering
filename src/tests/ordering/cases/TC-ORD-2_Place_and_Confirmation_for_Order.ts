/*
 * TC-ORD-02: Place Order and Order Confirmation (ID Validation)
 * Author: Gerardo Soto Rios (@GerardoSotoRios)
 *
 * Description:
 * Unit tests for getOrderID(), focusing on validating Order ID format.
 * Ensures IDs are valid Supabase UUIDs and that invalid IDs throw errors.
 *
 * Preconditions:
 * - Order type has at minimum: order_id (string).
 * - getOrderID(order) is available as the unit under test.
 * - Order IDs are Supabase-generated UUIDs: lowercase hex, format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.
 *
 * Test Cases:
 * 1 | Valid UUID order_id                                      | Returns the same UUID string
 * 2 | Empty or undefined order_id                              | Throws 'Order must have a valid ID.'
 * 3 | Malformed UUID (uppercase, missing dashes, wrong format) | Throws 'Order ID must be a valid UUID.'
 *
 * Notes:
 * - Only the format and presence of the order ID is tested.
 * - UUID validation uses regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.
 * - Supabase generates lowercase-only UUIDs with dashes.
 * - Uniqueness of IDs is assumed and not tested until integration.
 *
 * Run Command:
 * npx tsx src/tests/ordering/scripts/TC-ORD-2_Place_and_Confirmation_for_Order.ts
 *
 * Branch: issue297-unit-test-Place-order-and-conf
 *
 * Reviewer: <reviewer name>
 * Date Created: 2026-03-16
 * Reviewed By: <reviewer(s) fill this part>
 */
