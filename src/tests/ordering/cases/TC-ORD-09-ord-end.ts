/*
Add to cart fuzz test TC
Author: Horeb Cotto Rosado @horebcotto21

Description
<insert purpose of the test>
<insert type of tests to be run (unit, integration, etc)>

Preconditions
* <insert precondition1>
* <insert precondition2>
* src\lib\cart-items.ts
*/

//Test Data
import { removeCartItem, addCartItem, clearCart, getCartItems } from '../../../lib/cart-items';
import { IngredientItem, MenuItem } from '../../../models/food-item-class';
import { baseIngredients, cheeseExtra, createBaseMenuItem } from '../cases/TC-ORD-01-Modify-Order';




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

function randomItemId(length = 10): string {
    return `item_${randomString(length)}`;
}

function randomQuantity(min = 0, max = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    addCartItem,
    baseIngredients,
    cheeseExtra,
    clearCart,
    createBaseMenuItem,
    getCartItems,
    IngredientItem,
    MenuItem,
    randomFuzzIngredient,
    randomIngredientId,
    randomIngredientList,
    randomIngredientName,
    randomItemId,
    randomPrice,
    randomQuantity,
    randomString,
    removeCartItem,
    validateMenuItem
};
/*
Test Steps
<insert sequence of steps that will take place when executing the test>

. <insert step1>
. <insert step2>

Expected Results
<insert expected system behavior >

Notes
<insert notes, only if additional infromation is deemed necessary>

Reviewed By
<reviewer(s) fill this part>

====
*NOTE:* if there are any uncertainties, refer to the document in found within the following directory: `../../documentation/QualityAssurance/Test_Plan/test_strategy/define_test_case_design.adoc`. DO NOT INCLUDE THIS NOTE IN THE PRODUCED FILE.
====
*/