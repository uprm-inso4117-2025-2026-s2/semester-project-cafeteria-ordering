import { MenuItem } from "@/models/food-item-class";
import * as fc from "fast-check";

import {
    maxAddonPrice,
    maxItemPrice,
    maxQuantity,
    minAddonPrice,
    minItemPrice,
    minQuantity,
} from "../cases/TC-ORD-05_property_based_cart_calculations";


interface TestAddOn {
  name: string;
  price: number;
}

interface TestCartItem {
  menuItem: MenuItem;
  quantity: number;
  addOns: TestAddOn[];
}

// Cart Calculation Logic that mirrors subtotal logic from payment.tsx

function calculateCartSubtotal(cartItems: TestCartItem[]): number {
  return cartItems.reduce((sum, item) => {

    const addOnsTotal = item.addOns.reduce(
      (addonSum, addon) => addonSum + addon.price,
      0
    );

    return (
      sum +
      item.quantity *
      (item.menuItem.getTotalPrice() + addOnsTotal)
    );

  }, 0);
}

// Randomized Test Data Generators

const addOnArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 20 }),

  price: fc
    .integer({
      min: minAddonPrice,
      max: maxAddonPrice,
    })
    .map((price) => price / 100),
});

const cartItemArbitrary = fc
  .record({
    id: fc.uuid(),

    name: fc.string({
      minLength: 1,
      maxLength: 30,
    }),

    price: fc
      .integer({
        min: minItemPrice,
        max: maxItemPrice,
      })
      .map((price) => price / 100),

    quantity: fc.integer({
      min: minQuantity,
      max: maxQuantity,
    }),

    addOns: fc.array(addOnArbitrary, {
      minLength: 0,
      maxLength: 5,
    }),
  })

  .map((item) => ({
    menuItem: new MenuItem(
      item.id,
      "category-test",
      item.name,
      [],
      item.price,
      "",
      true,
      [],
      10,
      new Date().toISOString(),
      new Date().toISOString()
    ),

    quantity: item.quantity,

    addOns: item.addOns,
  }));

const cartArbitrary = fc.array(cartItemArbitrary, {
  minLength: 1,
  maxLength: 10,
});

// Test Suite

describe("TC-ORD-05 Property Based Cart Calculations", () => {

  test("cart subtotal is never negative", () => {

    fc.assert(
      fc.property(cartArbitrary, (cart) => {

        const subtotal = calculateCartSubtotal(cart);

        expect(subtotal).toBeGreaterThanOrEqual(0);

      })
    );

  });

  test("adding an item increases or maintains the subtotal", () => {

    fc.assert(
      fc.property(cartArbitrary, cartItemArbitrary, (cart, newItem) => {

        const originalSubtotal = calculateCartSubtotal(cart);

        const updatedSubtotal =
          calculateCartSubtotal([...cart, newItem]);

        expect(updatedSubtotal)
          .toBeGreaterThanOrEqual(originalSubtotal);

      })
    );

  });

  test("reducing cart contents decreases or maintains subtotal", () => {

    fc.assert(
      fc.property(cartArbitrary, (cart) => {

        const originalSubtotal =
          calculateCartSubtotal(cart);

        const updatedSubtotal =
          calculateCartSubtotal(cart.slice(1));

        expect(updatedSubtotal)
          .toBeLessThanOrEqual(originalSubtotal);

      })
    );

  });

  test("recalculating the same cart returns the same subtotal", () => {

    fc.assert(
      fc.property(cartArbitrary, (cart) => {

        const firstSubtotal =
          calculateCartSubtotal(cart);

        const secondSubtotal =
          calculateCartSubtotal(cart);

        expect(secondSubtotal)
          .toBe(firstSubtotal);

      })
    );

  });

  test("add-on prices are included in subtotal", () => {

    fc.assert(
      fc.property(cartItemArbitrary, addOnArbitrary, (item, addOn) => {

        const itemWithoutAddon = {
          ...item,
          addOns: [],
        };

        const itemWithAddon = {
          ...item,
          addOns: [addOn],
        };

        const subtotalWithoutAddon =
          calculateCartSubtotal([itemWithoutAddon]);

        const subtotalWithAddon =
          calculateCartSubtotal([itemWithAddon]);

        expect(subtotalWithAddon)
          .toBeGreaterThanOrEqual(subtotalWithoutAddon);

      })
    );

  });

});