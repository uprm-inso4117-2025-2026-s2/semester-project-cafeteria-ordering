/*
Order Modification Fuzz Test Data
Author: Yadriel Rivera Rodriguez (@YadrielRivera)

Description
Global test data and fuzz helpers for order modification methods.
The fuzz script in `src/tests/ordering/scripts/FT-ORD-06-Order-Mod-Fuzz.ts`
uses these exports to generate random but syntactically valid inputs.
*/

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

function randomPrice(min = -5, max = 20): number {
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

