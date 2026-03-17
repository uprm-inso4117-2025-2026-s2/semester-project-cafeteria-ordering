import { strict as assert } from 'node:assert';

/**
 * TC-ORD-02 (Simplified)
 * Unit Tests for getOrderID() focused solely on Order ID / UUID validation
 */

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Order {
  order_id: string | undefined;
}

// ─────────────────────────────────────────────
// PLUG IN YOUR FUNCTION HERE!
//
// Replace the stub below with your real import once the module is ready.
//
// Your function must match this signature:
//   getOrderID(order: Order): string
//
// ─────────────────────────────────────────────

function getOrderID(order: Order): string {
  if (!order.order_id || order.order_id === '') {
    throw new Error('Order must have a valid ID.');
  }
  if (!isValidUUID(order.order_id)) {
    throw new Error('Order ID must be a valid UUID.');
  }
  return order.order_id;
}

// ─────────────────────────────────────────────
// Helper: validates Supabase-style UUIDs
// Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
// Lowercase hex characters (0-9, a-f) and dashes only
// ─────────────────────────────────────────────

function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id);
}

// ─────────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────────

function createOrder(overrides: Partial<Order> = {}): Order {
  return {
    order_id: '9f8b7c6d-1234-4a5b-8c9d-0e1f2a3b4c5d',
    ...overrides,
  };
}

// ─────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────

console.log('Running TC-ORD-02 Unit Tests (ID only)...');

// Test 1: Valid ID returns the same string
function testValidID() {
  const order = createOrder();
  const id = getOrderID(order);
  assert.strictEqual(id, order.order_id);
  console.log('Test 1 passed: Valid UUID returns correctly');
}

// Test 2: Empty string or undefined throws
function testEmptyOrMissingID() {
  assert.throws(() => getOrderID(createOrder({ order_id: undefined })), {
    message: 'Order must have a valid ID.',
  });
  assert.throws(() => getOrderID(createOrder({ order_id: '' })), {
    message: 'Order must have a valid ID.',
  });
  console.log('Test 2 passed: Empty or missing ID throws error');
}

// Test 3: Invalid UUID format throws
function testInvalidFormat() {
  // Plain string — not a UUID at all
  assert.throws(() => getOrderID(createOrder({ order_id: 'not-a-uuid' })), {
    message: 'Order ID must be a valid UUID.',
  });
  // Too short — missing characters in last segment
  assert.throws(() => getOrderID(createOrder({ order_id: '12345678-a1b2-4c5d-9988-7766554' })), {
    message: 'Order ID must be a valid UUID.',
  });
  // No dashes — all characters but wrong structure
  assert.throws(() => getOrderID(createOrder({ order_id: '12345678a1b24c5d998877665544aabb' })), {
    message: 'Order ID must be a valid UUID.',
  });
  // Uppercase with dashes — Supabase UUIDs are lowercase only
  assert.throws(() => getOrderID(createOrder({ order_id: '12345678-A1B2-4C5D-9988-77665544AABB' })), {
    message: 'Order ID must be a valid UUID.',
  });
  console.log('Test 3 passed: Invalid UUID formats correctly throw error');
}

// ─────────────────────────────────────────────
// Run All Tests
// ─────────────────────────────────────────────

try {
  testValidID();
  testEmptyOrMissingID();
  testInvalidFormat();

  console.log('\nAll TC-ORD-02 ID-only tests passed successfully.');

} catch (error: unknown) {
  if (error instanceof Error) {
    console.error('Test failed:', error.message);
  } else {
    console.error('Test failed:', error);
  }

  process.exit(1);
}