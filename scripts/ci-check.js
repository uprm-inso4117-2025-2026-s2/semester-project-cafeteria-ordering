const { execSync } = require("child_process");

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

  const tsSuite = require("../build/ci-build/auto_test_suite.js");

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
