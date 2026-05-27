const { execSync } = require("child_process");

function commandExists(command) {
  try {
    execSync(process.platform === "win32" ? `where ${command}` : `command -v ${command}`, {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function banner(title) {
  console.log("\n===================================================");
  console.log(title);
  console.log("===================================================");
}

function runStep(stepName, command) {
  console.log(`\nTest: ${stepName}`); //Prints the step name
  console.log(`\nCommand: ${command}`); //Prints command being executed
  execSync(command, { stdio: "inherit" }); //Sends the command's output onto GitHub log.
  console.log(
    "\n///////////////////////////////////////////////////////////////////////\n",
  );
}

function runK6Step(stepName, command) {
  if (!commandExists("k6")) {
    console.log(`\nTest: ${stepName}`);
    console.log(`\nCommand: ${command}`);
    console.log("\n[SKIP] k6 is not installed in this environment.");
    console.log(
      "\n///////////////////////////////////////////////////////////////////////\n",
    );
    return;
  }

  runStep(stepName, command);
}

//Verify that compiled JavaScript files can be imported cleanly into ci-check.js
function runInternalCheck(stepName, checkLogic) {
  console.log(`\nTest: ${stepName}`);
  console.log(`\nAction: Internal JavaScript Verification`);
  checkLogic(); // Execute the logic
  console.log(
    "\n///////////////////////////////////////////////////////////////////////\n",
  );
}

function main() {
  banner("AUTO TEST SUITE RUNNING");

  const tsSuite = require("../src/tests/suites/auto_test_suite.ts");

  runStep("Lint (Expo ESLint)", tsSuite.testSuiteCommands.lint);
  runStep("Build Export (Expo export)", tsSuite.testSuiteCommands.buildExport);

  //Security & Infrastructure Check
  //Requieres user to have proper .env file set up for local testing
  runStep(
    "Supabase Security: Configuration (TC-SUPA-01)",
    "npx tsx src/tests/supabase/scripts/supabase-connection.test.ts",
  );
  runStep(
    "Supabase Security Check (TC-SUPA-02)",
    tsSuite.testSuiteCommands.supabaseSecurity,
  );

  // Centralized input validation utilities.
  runStep(
    "Utilities Flow: Centralized Input Validation Utilities (TC-UTIL-VALIDATION-01)",
    "npx jest src/tests/utils/scripts/validation.test.ts --config jest.config.js",
  );

  //Authentication Logic Check
  //Ensure that auto_test_suite.js file was properly created in build folder
  runInternalCheck("Verify Compiled TS Suite", () => {
    console.log(`Successfully integrated: ${tsSuite.testSuiteMetadata.name}`);
    console.log(
      `Active Modules: ${Object.keys(tsSuite.testSuiteMetadata.modules).join(", ")}`,
    );
  });

  // Ordering Flow Verification
  runStep(
    "Ordering Flow: Order Modification (TC-ORD-01)",
    tsSuite.testSuiteCommands.orderingModification,
  );
  runStep(
    "Ordering Flow: Place Order & Confirmation (TC-ORD-02)",
    tsSuite.testSuiteCommands.orderingPlaceConfirmation,
  );
  runK6Step(
    "Ordering Flow: Customer Ordering Load Test (TC-ORD-04)",
    tsSuite.testSuiteCommands.orderingLoadTesting,
  );
  runStep(
    "Ordering Flow: Place Order & Confirmation Integration (TC-ORD-05)",
    tsSuite.testSuiteCommands.orderingPlaceConfirmIntegration,
  );
  runStep(
    "Ordering Flow: Modify Order Fuzz (TC-ORD-06)",
    tsSuite.testSuiteCommands.orderingModifyFuzz,
  );
  runStep(
    "Ordering Flow: getOrderID Fuzz (TC-ORD-08)",
    tsSuite.testSuiteCommands.orderingGetOrderIdFuzz,
  );
  runStep(
    "Ordering Flow: Endpoint Fuzz (TC-ORD-09)",
    tsSuite.testSuiteCommands.orderingEndpointFuzz,
  );
  runStep(
    "Ordering Flow: Cart Calculations PBT (TC-ORD-10)",
    tsSuite.testSuiteCommands.orderingCartCalculations,
  );
  runStep(
    "Ordering Flow: Counterexample Shrinking (TC-ORD-11)",
    tsSuite.testSuiteCommands.orderingCounterexampleShrinking,
  );

  // Payment Flow Verification
  runStep(
    "Payment Flow Validation (TC-PAY-01)",
    tsSuite.testSuiteCommands.paymentValidation,
  );

  //(UNCOMMENT TO USE)
  // Test to verify FAILED tests are correctly logged.
  // runStep("Intentional failure test", "node -e \"process.exit(1)\"");

  banner("AUTO TEST SUITE PASSED");
}

try {
  main();
  process.exit(0);
} catch (e) {
  banner("AUTO TEST SUITE FAILED");

  //Generates timestamp
  const timestamp = new Date().toISOString();
  console.error(`\nTimestamp: ${timestamp}`);

  //Logic for lvl identificaiton is in TBD
  //Logs the level (INFO/ERROR/FATAL)

  //Error message
  console.error(`\nError message: \n${e?.message ?? e}`);

  //Logs defect source
  console.error(`\nSource: \n${e.stack}`);

  process.exit(1);
}
