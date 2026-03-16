import { strict as assert } from 'node:assert';
import { IngredientItem, MenuItem } from '../../../models/food-item-class';

// Test data setup
const baseIngredients: IngredientItem[] = [
  { ingredients_id: 'ing1', ingredients_names: 'pasta', ingredients_price: 0 },
  { ingredients_id: 'ing2', ingredients_names: 'tomato sauce', ingredients_price: 0 },
  { ingredients_id: 'ing3', ingredients_names: 'meatballs', ingredients_price: 0 },
];

const cheeseExtra: IngredientItem = { ingredients_id: 'ing4', ingredients_names: 'cheese', ingredients_price: 2.00 };
const candyExtra: IngredientItem = { ingredients_id: 'ing5', ingredients_names: 'candy', ingredients_price: 1.00 };

// Helper to create base menu item (deep copy ingredients to avoid test pollution)
function createBaseMenuItem(): MenuItem {
  const ingredientsCopy: IngredientItem[] = baseIngredients.map((ing) => ({ ...ing }));
  return new MenuItem(
    'item1',
    'cat1',
    'Spaghetti Bolognese',
    ingredientsCopy,
    10.00,
    'image.jpg',
    true,
    [],
    15,
    '2023-01-01',
    '2023-01-01'
  );
}

// Unit Tests for Order Modification
console.log('Running TC-ORD-01 Unit Tests for Order Modification...');

// Test 1: Initialize order item with base meal state
function testBaseState() {

  const item = createBaseMenuItem();
  assert.equal(item.getBasePrice(), 10.00, 'Base price should be 10.00');

  const ingredients = item.getIngredients();
  assert.deepEqual(ingredients.map(i => i.ingredients_names), ['pasta', 'tomato sauce', 'meatballs'], 'Base ingredients should match');

  console.log('Test 1 passed: Base state initialized correctly');
}

// Test 2: Add valid extra and adjust price
function testAddExtra() {

  const item = createBaseMenuItem();
  item.addIngredient(cheeseExtra);
  assert.equal(item.getBasePrice(), 12.00, 'Price should increase by 2.00 to 12.00');

  const ingredients = item.getIngredients();
  assert(ingredients.some(i => i.ingredients_names === 'cheese'), 'Cheese should be added to ingredients');

  console.log('Test 2 passed: Valid extra added and price adjusted');

}

// Test 3: Remove ingredient and adjust price (assuming meatballs have price, but in base they are 0)
function testRemoveIngredient() {

  const item = createBaseMenuItem();

  // Remove meatballs (price 0, so no change)
  item.removeIngredient('ing3');
  assert.equal(item.getBasePrice(), 10.00, 'Price should remain 10.00 since meatballs price is 0');
  const ingredients = item.getIngredients();

  assert(!ingredients.some(i => i.ingredients_names === 'meatballs'), 'Meatballs should be removed');
  console.log('Test 3 passed: Ingredient removed, price adjusted accordingly');
}

// Test 4: Attempt to add invalid extra (since there's no validation to confirm which ingredients belong to each meal, it will add, but we can test duplicate prevention)
function testAddInvalidExtra() {

  const item = createBaseMenuItem();

  // add cheese and price increases to 12
  item.addIngredient(cheeseExtra);

  // add duplicate, should warn
  console.log("Adding cheese for the second time...")
  item.addIngredient(cheeseExtra);
  const ingredients = item.getIngredients();
  const cheeseCount = ingredients.filter(i => i.ingredients_names === 'cheese').length;

  assert.equal(cheeseCount, 1, 'Duplicate ingredient should not be added');
  assert.equal(item.getBasePrice(), 12.00, 'Price should not change on duplicate add');
  console.log('Test 4 passed: Duplicate extra not added, price unchanged');
}

// Test 5: Modify base price directly
function testModBasePrice() {

  const item = createBaseMenuItem();
  item.modBasePrice(15.00);

  assert.equal(item.getBasePrice(), 15.00, 'Base price should be modified to 15.00');

  console.log('Test 5 passed: Base price modified correctly');
}

// Test 6: Modify ingredients list directly (staff method)
function testModIngredients() {

  const item = createBaseMenuItem();

  const newIngredients: IngredientItem[] = [
    { ingredients_id: 'ing1', ingredients_names: 'pasta', ingredients_price: 0 },
    { ingredients_id: 'ing6', ingredients_names: 'new sauce', ingredients_price: 1.50 },
  ];

  item.modIngredients(newIngredients);

  const ingredients = item.getIngredients();
  assert.deepEqual(ingredients.map(i => i.ingredients_names), ['pasta', 'new sauce'], 'Ingredients should be replaced');

  assert.equal(item.getBasePrice(), 10.00, 'Price should remain unchanged as modIngredients doesn\'t adjust price');

  console.log('Test 6 passed: Ingredients list modified correctly');
}

// Run all tests
try {

  testBaseState();
  testAddExtra();
  testRemoveIngredient();
  testAddInvalidExtra();
  testModBasePrice();
  testModIngredients();

  console.log('\nAll unit tests for TC-ORD-01 passed successfully.');
} catch (error) {

  if (error instanceof Error) {
    console.error('Test failed:', error.message);
  } else {
    console.error('Test failed:', error);
  }
  process.exit(1);

}
