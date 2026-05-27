import { strict as assert } from 'node:assert';

// FT-ORD-06: Fuzz tests for order modification.
import {
  cheeseExtra,
  createBaseMenuItem,
  randomIngredientId,
  randomIngredientName,
  randomPrice,
  randomIngredientList,
  validateMenuItem,
} from '../cases/TC-ORD-06-Modify-Order-Fuzz';

const STRING_LENGTHS = [1, 4, 8, 16, 32, 48];
const FUZZ_ROUNDS = 12;
let failureCount = 0;
let passCount = 0;

function printHeader(message: string): void {
  console.log('==============================');
  console.log(message);
  console.log('==============================');
}

function logPass(message: string): void {
  passCount += 1;
  console.log(`PASS: ${message}`);
}

function assertMenuItemValid(itemName: string, item: ReturnType<typeof createBaseMenuItem>): void {
  assert.ok(validateMenuItem(item), `${itemName} should remain valid after fuzz operations.`);
}

function testBaseState(): void {
  const item = createBaseMenuItem();
  assert.equal(item.getBasePrice(), 10.0, 'Starting base price must be 10.00');
  const ingredientNames = item.getIngredients().map((ing) => ing.ingredients_names);
  assert.deepEqual(ingredientNames, ['pasta', 'tomato sauce', 'meatballs'], 'Base ingredient names should match expected values');
  assertMenuItemValid('Base item', item);
  logPass('Base state initialized correctly');
}

function fuzzAddIngredient(): void {
  const item = createBaseMenuItem();
  STRING_LENGTHS.forEach((length) => {
    const fuzzIngredient = {
      ingredients_id: randomIngredientId(length),
      ingredients_names: randomIngredientName(length),
      ingredients_price: randomPrice(-1, 8),
    };
    item.addIngredient(fuzzIngredient);
    assertMenuItemValid(`Add ingredient round ${length}`, item);
  });

  const ingredientNames = item.getIngredients().map((ing) => ing.ingredients_names);
  if (!ingredientNames.includes('cheese')) {
    item.addIngredient(cheeseExtra);
  }
  logPass('Fuzz addIngredient calls handled without crashing');
}

function fuzzRemoveIngredient(): void {
  const item = createBaseMenuItem();
  STRING_LENGTHS.forEach((length) => {
    const randomId = randomIngredientId(length);
    item.removeIngredient(randomId);
    assertMenuItemValid(`Remove ingredient round ${length}`, item);
  });

  item.removeIngredient('ing2');
  assert.ok(!item.getIngredients().some((ing) => ing.ingredients_id === 'ing2'), 'Known ingredient removal should remove the item when present');
  logPass('Fuzz removeIngredient calls handled without crashing');
}

function fuzzModBasePrice(): void {
  const item = createBaseMenuItem();
  for (let round = 0; round < FUZZ_ROUNDS; round += 1) {
    const newPrice = randomPrice(-15, 50);
    item.modBasePrice(newPrice);
    assert.equal(item.getBasePrice(), newPrice, `Base price should update to the fuzzed value ${newPrice}`);
    assertMenuItemValid(`modBasePrice round ${round + 1}`, item);
  }
  logPass('Fuzz modBasePrice calls handled correctly');
}

function fuzzModIngredients(): void {
  const item = createBaseMenuItem();
  STRING_LENGTHS.forEach((length) => {
    const count = Math.max(0, Math.min(4, Math.floor(length / 10) + 1));
    const ingredients = randomIngredientList(count).map((ing) => ({
      ...ing,
      ingredients_id: randomIngredientId(length),
      ingredients_names: randomIngredientName(length),
    }));
    item.modIngredients(ingredients);
    assertMenuItemValid(`modIngredients round ${length}`, item);
    assert.equal(item.getIngredients().length, count, 'modIngredients should replace the ingredient list with the fuzzed list');
  });
  logPass('Fuzz modIngredients calls handled without crashing');
}

function runFuzzSuite(): void {
  printHeader('FT-ORD-06 Order Modification Fuzz Test');
  try {
    testBaseState();
    fuzzAddIngredient();
    fuzzRemoveIngredient();
    fuzzModBasePrice();
    fuzzModIngredients();

    if (failureCount === 0) {
      console.log(`\nRESULT: PASS — ${passCount} validations succeeded, ${failureCount} failures.`);
      process.exit(0);
    }
    console.error(`\nRESULT: FAIL — ${passCount} validations succeeded, ${failureCount} failures.`);
    process.exit(1);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\nRESULT: FAIL — ${error.message}`);
    } else {
      console.error('\nRESULT: FAIL — Unknown error');
    }
    process.exit(1);
  }
}

runFuzzSuite();
