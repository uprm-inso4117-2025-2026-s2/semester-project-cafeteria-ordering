/*
TC-ORD-06: Order Modification Fuzz Test Data
Author: Yadriel Rivera Rodriguez (@YadrielRivera)

Description
Verifies that order modification methods are robust enough to manage erratic inputs that might affect the user experience
The fuzz script in `src/tests/ordering/scripts/FT-ORD-06-Order-Mod-Fuzz.ts`
uses these exports to generate random but syntactically valid inputs.
The goal is try to find flaws from these random, but syntactically correct inputs

Preconditions: 
- There exists a menu item
- There exists extra ingredients
- Menu item is modifiable
*/

// Test data

import { IngredientItem, MenuItem } from '../../../models/food-item-class';
import { cheeseExtra, createBaseMenuItem, baseIngredients } from '../cases/TC-ORD-01-Modify-Order';



function randomString(length: number): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}

function randomIngredientId(length = 10): string {
  return `ing_${randomString(length)}`;
}

function randomIngredientName(length = 16): string {
  return randomString(length);
}

function randomPrice(min = Number.MIN_VALUE, max = Number.MAX_VALUE): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function randomFuzzIngredient(): IngredientItem {
  return {
    ingredients_id: randomIngredientId(),
    ingredients_names: randomIngredientName(),
    ingredients_price: randomPrice(-2, 10),
  };
}

function randomIngredientList(count: number): IngredientItem[] {
  return Array.from({ length: count }, () => randomFuzzIngredient());
}

function validateMenuItem(item: MenuItem): boolean {
  const ingredients = item.getIngredients();
  const ids = ingredients.map((ing) => ing.ingredients_id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    return false;
  }
  const price = item.getBasePrice();
  return Number.isFinite(price);
}

export {
    baseIngredients,
    cheeseExtra,
    createBaseMenuItem, IngredientItem,
    MenuItem, randomFuzzIngredient, randomIngredientId, randomIngredientList, randomIngredientName,
    randomPrice, randomString, validateMenuItem
};

/* 
Test Step | Expected Result
1 | Initialize a new order item with base meal state | No errors are raised
2 | Call `addIngredient()` with random valid string IDs and names | The item accepts new ingredients or safely rejects duplicates without crashing
3 | Call `removeIngredient()` with random ingredient IDs | The method handles unknown IDs gracefully and preserves a valid item state
4 | Call `modBasePrice()` with random numeric values | The base price updates to the fuzzed value and remains a finite number
5 | Call `modIngredients()` with randomized ingredient arrays | The ingredient list replaces correctly and the item stays valid
6 | Confirm final fuzz suite result | The test outputs a clear PASS or FAIL summary after all fuzz operations

Notes
- This suite uses random but syntactically valid strings and ingredient data.
- It validates robustness against erratic inputs rather than semantic menu relationships.
- Validation checks ensure unique ingredient IDs and a finite base price after each operation.
- Execute the fuzz suite with `npx tsx src/tests/ordering/scripts/FT-ORD-06-Order-Mod-Fuzz.ts`.

Author: Yadriel Rivera Rodriguez
Reviewer: <Lucas Matos>
Date Created: 2026-05-20

Reviewed By
<reviewer(s) fill this part>

*/

