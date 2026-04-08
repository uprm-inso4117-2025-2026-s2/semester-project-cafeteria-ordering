import { strict as assert } from "node:assert";

interface PaymentInfo {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  amount: number;
}

function validatePaymentInfo(payment: PaymentInfo): boolean {
  if (
    !payment.cardNumber ||
    !payment.cardholderName ||
    !payment.expiryDate ||
    !payment.cvv
  ) {
    throw new Error("All payment fields are required.");
  }

  const normalizedCard = payment.cardNumber.replace(/\s+/g, "");
  if (!/^\d{16}$/.test(normalizedCard)) {
    throw new Error("Card number must be 16 digits.");
  }

  if (!/^\d{2}\/\d{2}$/.test(payment.expiryDate)) {
    throw new Error("Expiry date must use MM/YY format.");
  }

  if (!/^\d{3,4}$/.test(payment.cvv)) {
    throw new Error("CVV must be 3 or 4 digits.");
  }

  if (payment.amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  return true;
}

function createPaymentInfo(overrides: Partial<PaymentInfo> = {}): PaymentInfo {
  return {
    cardNumber: "4242 4242 4242 4242",
    cardholderName: "Test User",
    expiryDate: "12/30",
    cvv: "123",
    amount: 29.99,
    ...overrides,
  };
}

console.log("Running TC-PAY-01 Unit Tests...");

function testValidPayment() {
  const payment = createPaymentInfo();
  assert.strictEqual(validatePaymentInfo(payment), true);
  console.log("Test 1 passed: Valid payment info validates successfully");
}

function testMissingFieldFails() {
  assert.throws(
    () => validatePaymentInfo(createPaymentInfo({ cardholderName: "" })),
    { message: "All payment fields are required." },
    "Missing cardholder name should throw an error",
  );
  console.log("Test 2 passed: Missing payment field fails validation");
}

function testInvalidCardNumberFails() {
  assert.throws(
    () =>
      validatePaymentInfo(
        createPaymentInfo({ cardNumber: "1234 5678 9012 345" }),
      ),
    { message: "Card number must be 16 digits." },
    "Invalid card number should throw an error",
  );
  console.log("Test 3 passed: Invalid card number fails validation");
}

try {
  testValidPayment();
  testMissingFieldFails();
  testInvalidCardNumberFails();

  console.log("\nAll TC-PAY-01 tests passed successfully.");
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(`\nTest failed: ${error.message}`);
    console.error(`Details: ${error.stack}`);
  } else {
    console.error("Test failed:", error);
  }
  process.exit(1);
}
