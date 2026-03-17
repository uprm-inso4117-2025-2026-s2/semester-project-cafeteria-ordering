import { strict as assert } from 'node:assert';
import { dummyInvalidIDs, dummyOrderID, isValidUUID } from '../cases/TC-ORD-2_Place_and_Confirmation_for_Order';


// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Order {
  order_id: string | undefined;
}

// ─────────────────────────────────────────────
// PLUG IN YOUR FUNCTION HERE
// Replace the stub below with your real import once the module is ready.
//
//
//
//
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
//
//
// ─────────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────────

function createOrder(overrides: Partial<Order> = {}): Order {
  return {
    order_id: dummyOrderID,
    ...overrides,
  };
}

// ─────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────

console.log('Running TC-ORD-02 Unit Tests...');

// Test 1: Valid ID returns the same string
function testValidID() {
  const order = createOrder();
  const id = getOrderID(order);
  assert.strictEqual(id, order.order_id);
  console.log('Test 1 passed: Valid UUID returns correctly');
}

// Test 2: Empty string or undefined throws
function testEmptyOrMissingID() {
  assert.throws(
    () => getOrderID(createOrder({ order_id: undefined })),
    { message: 'Order must have a valid ID.' },
    'Test 2a failed: undefined order_id should throw "Order must have a valid ID."'
  );
  assert.throws(
    () => getOrderID(createOrder({ order_id: '' })),
    { message: 'Order must have a valid ID.' },
    'Test 2b failed: empty string order_id should throw "Order must have a valid ID."'
  );
  console.log('Test 2 passed: Empty or missing ID throws error');
}

// Test 3: Invalid UUID format throws
function testInvalidFormat() {
  for (const invalidID of dummyInvalidIDs) {
    assert.throws(
      () => getOrderID(createOrder({ order_id: invalidID })),
      { message: 'Order ID must be a valid UUID.' },
      `Test 3 failed: "${invalidID}" should have thrown but did not`
    );
  }
  console.log('Test 3 passed: Invalid UUID formats correctly throw error');
}

// ─────────────────────────────────────────────
// Run All Tests
// ─────────────────────────────────────────────

try {
  testValidID();
  testEmptyOrMissingID();
  testInvalidFormat();

  console.log('\nAll TC-ORD-02 tests passed successfully.');

} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(`\nTest failed: ${error.message}`);
    console.error(`Details: ${error.stack}`);
  } else {
    console.error('Test failed:', error);
  }
  process.exit(1);
}