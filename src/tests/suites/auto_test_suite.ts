// src/tests/suites/auto_test_suite.ts
/**
 * This file houses the Customer Ordering and Payment test integrations.
 * For instance it contains Auto Test Suite logic for Customer Ordering, Payment, and Security.
 */
export const testSuiteMetadata = {
  name: "Automated TS Auth, Security, Ordering & Payment Test Suite",
  version: "1.2.0",
  status: "initialized",
  modules: {
    authentication: ["TC-AUTH-03", "TC-AUTH-04"],
    security: ["TC-SUPA-01", "TC-SUPA-02"],
    ordering: ["TC-ORD-01", "TC-ORD-02"],
    payment: ["TC-PAY-01"],
  },
};

export const testSuiteCommands = {
  lint: "npm run lint",
  buildExport: "npm run test:build",
  supabaseSecurity: "npx tsx src/tests/supabase/scripts/quick-test.ts",
  orderingModification: "npx tsx src/tests/ordering/scripts/UT-OrderModification.ts",
  orderingPlaceConfirmation:
    "npx tsx src/tests/ordering/scripts/UT-ORD-02_Place_and_Confirmation_for_Order.ts",
  paymentValidation: "npx tsx src/tests/payment/scripts/UT-PAY-1_PaymentValidation.ts",
};
