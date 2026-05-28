"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSuiteCommands = exports.testSuiteMetadata = void 0;
// src/tests/suites/auto_test_suite.ts
/**
 * This file houses the Customer Ordering and Payment test integrations.
 * For instance it contains Auto Test Suite logic for Customer Ordering, Payment, Security,
 * Profile, and Staff Operations.
 */
exports.testSuiteMetadata = {
    name: "Automated TS Auth, Security, Ordering, Payment, Profile & Staff Test Suite",
    version: "1.4.0",
    status: "initialized",
    modules: {
        authentication: ["TC-AUTH-03", "TC-AUTH-04", "TC-UTIL-VALIDATION-01"],
        security: ["TC-SUPA-01", "TC-SUPA-02"],
        ordering: [
            "TC-ORD-01",
            "TC-ORD-02",
            "TC-ORD-03",
            "TC-ORD-04",
            "TC-ORD-05",
            "TC-ORD-06",
            "TC-ORD-07",
            "TC-ORD-08",
            "TC-ORD-09",
            "TC-ORD-10",
            "TC-ORD-11",
            "TC-ORD-12",
        ],
        payment: ["TC-PAY-01"],
        profile: ["TC-PROF-01", "TC-PROF-02", "IT-PROF-01"],
        staff: ["TC-STAFF-02"],
    },
};
exports.testSuiteCommands = {
    lint: "npm run lint",
    buildExport: "npm run test:build",
    supabaseSecurity: "npx tsx src/tests/supabase/scripts/quick-test.ts",
    orderingModification: "npx tsx src/tests/ordering/scripts/UT-ORD-01-OrderModification.ts",
    orderingPlaceConfirmation: "npx tsx src/tests/ordering/scripts/UT-ORD-02_Place_and_Confirmation_for_Order.ts",
    orderingLoadTesting: "k6 run src/tests/ordering/cases/TC-ORD-04-Load-testing.js",
    orderingPlaceConfirmIntegration: "npx tsx src/tests/ordering/scripts/IT-ORD-05-Place_and_Confirm_Order.ts",
    orderingModifyFuzz: "npx tsx src/tests/ordering/scripts/FT-ORD-06-Order-Mod-Fuzz.ts",
    orderingGetOrderIdFuzz: "npx tsx src/tests/ordering/scripts/FT-ORD-08-getOrderID_Fuzz.ts",
    orderingEndpointFuzz: "npx tsx src/tests/ordering/scripts/FT-ORD-09-ord-end.ts",
    orderingCartCalculations: "npx jest src/tests/ordering/scripts/PBT-ORD-10_cart_calculations.test.ts --config jest.config.js",
    orderingCounterexampleShrinking: "npx jest src/tests/ordering/scripts/PBT-ORD-11_counterexample_shrinking.test.ts --config jest.config.js",
    paymentValidation: "npx tsx src/tests/payment/scripts/UT-PAY-1_PaymentValidation.ts",
    profileUnitTests: "npx tsx src/tests/profile/scripts/UT-PROF-01_profile_functionality.ts",
    profileOfflineBehavior: "npx jest src/tests/profile/scripts/OT-PROF-01_offline_mode_behavior.test.tsx --config jest.config.js",
    profileAuthSync: "npx jest src/tests/profile/scripts/IT-PROF-01_auth_profile_sync.test.tsx --config jest.config.js",
    staffOrderStateTransitions: "npx jest src/tests/staff_operations/scripts/TC-STAFF-02_order_state_transitions_pbt.test.ts --config jest.config.js",
};
