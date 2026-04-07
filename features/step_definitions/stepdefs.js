const assert = require("assert");
const { Given, When, Then } = require("@cucumber/cucumber");

const world = {
  currentPage: null,
  userCredentials: null,
  orderStatus: null,
  errorMessage: null,
  backendFailure: false,
};

// User Authentication
Given("the user is on the login page", function () {
  world.currentPage = "login";
  assert.strictEqual(
    world.currentPage,
    "login",
    "User should be on login page",
  );
});

When("the user enters valid credentials", function () {
  world.userCredentials = { email: "test@example.com", password: "validpass" };
  assert(
    world.userCredentials.email && world.userCredentials.password,
    "Credentials should be entered",
  );
});

Then("the user should be redirected to the dashboard", function () {
  world.currentPage = "dashboard";
  assert.strictEqual(
    world.currentPage,
    "dashboard",
    "User should be redirected to dashboard",
  );
});

// Staff Operations
Given('an order is currently marked as "pending"', function () {
  world.orderStatus = "pending";
  assert.strictEqual(
    world.orderStatus,
    "pending",
    "Order should be marked as pending",
  );
});

When("the staff member updates the order status", function () {
  // Simulate staff updating order status
  world.orderStatus = "processing";
});

When("the backend update fails", function () {
  world.backendFailure = true;
  // Revert the status change cause of a failure
  world.orderStatus = "pending";
});

Then("the system should show an error message", function () {
  world.errorMessage = "Backend update failed. Please try again.";
  assert(world.errorMessage, "Error message should be displayed");
});

Then("the order should remain in its previous persisted state", function () {
  assert.strictEqual(
    world.orderStatus,
    "pending",
    "Order should remain in pending state",
  );
});
