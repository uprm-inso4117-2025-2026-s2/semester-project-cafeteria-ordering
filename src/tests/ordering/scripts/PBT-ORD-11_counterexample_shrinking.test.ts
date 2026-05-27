import * as fc from "fast-check";
import { failureThreshold } from "../cases/TC-ORD-11_counterexample_shrinking_failure_analysis";


interface CartItem {
  price: number;
  quantity: number;
}

//Cart Calculation Logic
function calculateSubtotal(cart: CartItem[]): number {

  return cart.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

}

//Random Test Data Generators
const cartItemArbitrary = fc.record({

  price: fc.integer({
    min: 1,
    max: 50,
  }),

  quantity: fc.integer({
    min: 1,
    max: 10,
  }),

});

const cartArbitrary = fc.array(cartItemArbitrary, {
  minLength: 1,
  maxLength: 10,
});

// Test Suite
describe("TC-ORD-11 Counterexample Shrinking", () => {

  test("fast-check shrinks failing cart subtotal examples", () => {

    expect(() => {

      fc.assert(

        fc.property(cartArbitrary, (cart) => {

          const subtotal =
            calculateSubtotal(cart);

          expect(subtotal)
            .toBeLessThan(failureThreshold);

        }),

        {
          verbose: true,
        }

      );

    }).toThrow();

  });

});
