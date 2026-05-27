"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSuiteMetadata = void 0;
// src/tests/suites/auto_test_suite.ts
/**
 * This file houses the Customer Ordering and Payment test integrations.
 * For instance it contains Auto Test Suite logic for Customer Ordering, Payment, and Security.
 */
exports.testSuiteMetadata = {
    name: "Automated TS Auth, Security, Ordering & Payment Test Suite",
    version: "1.3.0",
    status: "initialized",
    modules: {
        authentication: ["TC-AUTH-03", "TC-AUTH-04", "TC-AUTH-05", "TC-AUTH-07"],
        security: ["TC-SUPA-01", "TC-SUPA-02", "TC-SUPA-03"],
        ordering: ["TC-ORD-01", "TC-ORD-02"],
        payment: ["TC-PAY-01"],
    },
};
