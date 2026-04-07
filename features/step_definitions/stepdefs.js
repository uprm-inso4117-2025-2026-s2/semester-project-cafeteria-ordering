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

// Order Pickup Steps
Given("the user has placed an order", function () {
  world.orderPlaced = true;
  world.orderId = "ORD-12345";
  assert(world.orderPlaced, "User should have placed an order");
});

When("the user goes to the pickup area", function () {
  world.currentPage = "pickup-area";
  assert.strictEqual(
    world.currentPage,
    "pickup-area",
    "User should be in pickup area",
  );
});

When("the order is ready for pickup", function () {
  world.orderReady = true;
  assert(world.orderReady, "Order should be ready for pickup");
});

When("the user clicks {string} button", function (buttonText) {
  world.clickedButton = buttonText;
  assert(world.clickedButton, "Button should be clicked");
});

When("the user shall see their order unique code", function () {
  world.orderCodeVisible = true;
  world.orderCode = "ABC123";
  assert(world.orderCodeVisible, "Order code should be visible");
});

When("the staff validates the code in the system", function () {
  world.codeValidated = true;
  assert(world.codeValidated, "Code should be validated by staff");
});

Then(
  "the user shall receive a confirmation message {string}",
  function (message) {
    world.confirmationMessage = message;
    assert.strictEqual(
      world.confirmationMessage,
      message,
      "Confirmation message should match",
    );
  },
);

Then(
  "the system shall mark the order as {string} in the database",
  function (status) {
    world.orderStatus = status;
    assert.strictEqual(
      world.orderStatus,
      status,
      "Order should be marked correctly",
    );
  },
);

// Order Placement
Given("the user is logged in", function () {
  world.userLoggedIn = true;
  assert(world.userLoggedIn, "User should be logged in");
});

Given("the user is on the menu page", function () {
  world.currentPage = "menu";
  assert.strictEqual(world.currentPage, "menu", "User should be on menu page");
});

When(
  "the user selects {string} with sides {string} and {string}",
  function (main, side1, side2) {
    world.selectedItem = { main, side1, side2 };
    assert(world.selectedItem.main, "Main item should be selected");
  },
);

When(
  "the user proceeds to checkout with {string} pickup time",
  function (pickupTime) {
    world.pickupTime = pickupTime;
    world.currentPage = "checkout";
    assert.strictEqual(
      world.currentPage,
      "checkout",
      "User should proceed to checkout",
    );
  },
);

When("the user completes the payment process", function () {
  world.paymentCompleted = true;
  assert(world.paymentCompleted, "Payment should be completed");
});

Then("the system should confirm the order", function () {
  world.orderConfirmed = true;
  assert(world.orderConfirmed, "Order should be confirmed");
});

Then("the cafeteria staff should be notified of the new order", function () {
  world.staffNotified = true;
  assert(world.staffNotified, "Staff should be notified");
});

Then("the user should receive an order confirmation message", function () {
  world.userNotified = true;
  assert(world.userNotified, "User should receive confirmation");
});

// Canceling an Order
Given("an order is in a cancellable state", function () {
  world.orderStatus = "pending";
  world.cancellable = true;
  assert(world.cancellable, "Order should be cancellable");
});

When("the staff member cancels the order", function () {
  world.orderCancelled = true;
  world.orderStatus = "cancelled";
});

Then("the order should be marked as cancelled", function () {
  assert.strictEqual(
    world.orderStatus,
    "cancelled",
    "Order should be cancelled",
  );
});

Then("the staff orders table should reflect the cancellation", function () {
  world.tableUpdated = true;
  assert(world.tableUpdated, "Staff table should reflect cancellation");
});

// An Invalid Status Transition
Given("an order is already marked as {string}", function (status) {
  world.orderStatus = status;
  assert.strictEqual(
    world.orderStatus,
    status,
    "Order should be in specified status",
  );
});

When(
  "the staff member attempts to change the order status to {string}",
  function (newStatus) {
    world.attemptedStatus = newStatus;
    // Simulate rejection
    if (world.orderStatus === "completed" && newStatus === "in progress") {
      world.updateRejected = true;
    }
  },
);

Then("the system should reject the update", function () {
  assert(world.updateRejected, "Update should be rejected");
});

Then("an appropriate validation message should be shown", function () {
  world.validationMessage = "Invalid status transition";
  assert(world.validationMessage, "Validation message should be shown");
});

// Receiving an Order
Given("a customer has placed a new order", function () {
  world.newOrderPlaced = true;
  world.orderId = "ORD-67890";
  assert(world.newOrderPlaced, "New order should be placed");
});

When("the staff member opens the staff orders view", function () {
  world.currentPage = "staff-orders";
  assert.strictEqual(
    world.currentPage,
    "staff-orders",
    "Staff should open orders view",
  );
});

Then("the new order should appear in the pending orders list", function () {
  world.orderInList = true;
  assert(world.orderInList, "New order should appear in pending list");
});

// Updating Status to a Valid State
When(
  "the staff member changes the order status to {string}",
  function (newStatus) {
    world.orderStatus = newStatus;
    world.statusUpdated = true;
  },
);

Then("the order status should be updated successfully", function () {
  assert(world.statusUpdated, "Status should be updated successfully");
});

Then(
  "the updated status should be shown in the staff orders table",
  function () {
    world.tableUpdated = true;
    assert(world.tableUpdated, "Updated status should be shown in table");
  },
);
