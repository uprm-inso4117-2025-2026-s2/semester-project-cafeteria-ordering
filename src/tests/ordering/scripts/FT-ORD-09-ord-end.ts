import { strict as assert } from 'node:assert';

// FT-ORD-09: Fuzz tests for add-to-cart and remove-cart-item behavior.
import {
    addCartItem,
    clearCart,
    createBaseMenuItem,
    getCartItems,
    randomItemId,
    randomPrice,
    randomQuantity,
    randomString,
    removeCartItem,
    validateMenuItem
} from '../cases/TC-ORD-09-ord-end';


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

// Base test from TC-ORD-01 to ensure we start with a valid item before fuzzing
function testBaseState(): void {
    const item = createBaseMenuItem();
    assert.equal(item.getBasePrice(), 10.0, 'Starting base price must be 10.00');
    const ingredientNames = item.getIngredients().map((ing) => ing.ingredients_names);
    assert.deepEqual(ingredientNames, ['pasta', 'tomato sauce', 'meatballs'], 'Base ingredient names should match expected values');
    assertMenuItemValid('Base item', item);
    logPass('Base state initialized correctly');
}

/// New tests for add to cart fuzzing
function fuzzAddToCart(): void {
    clearCart();

    // Test 1: Add item with various quantities
    for (let round = 0; round < FUZZ_ROUNDS; round += 1) {
        clearCart();
        const item = createBaseMenuItem();
        const quantity = randomQuantity(0, 50);
        const addOns: any[] = [];

        addCartItem(item, quantity, addOns);
        const cartItems = getCartItems();

        assert.equal(cartItems.length, 1, `After adding item, cart should have 1 item (round ${round + 1})`);
        assert.equal(cartItems[0].quantity, quantity, `Item quantity should be ${quantity}`);
        assert.equal(cartItems[0].item.getId(), item.getId(), `Item IDs should match`);
    }
    logPass('Fuzz addToCart with various quantities handled correctly');

    // Test 2: Add multiple items to cart
    clearCart();
    for (let i = 0; i < 5; i += 1) {
        const item = createBaseMenuItem();
        item.modBasePrice(randomPrice(5, 20));
        const quantity = randomQuantity(1, 10);
        addCartItem(item, quantity, []);
    }
    const cartItems = getCartItems();
    assert.equal(cartItems.length, 5, 'Cart should contain 5 items');
    cartItems.forEach((cartItem) => {
        assert.ok(cartItem.quantity > 0, 'All quantities should be positive');
        assert.ok(validateMenuItem(cartItem.item), 'All menu items should be valid');
    });
    logPass('Fuzz addToCart with multiple items handled correctly');

    // Test 3: Add items with various add-ons
    clearCart();
    for (let round = 0; round < FUZZ_ROUNDS; round += 1) {
        clearCart();
        const item = createBaseMenuItem();
        const quantity = randomQuantity(1, 5);
        const addOnsCount = Math.floor(Math.random() * 5);
        const addOns = Array.from({ length: addOnsCount }, () => ({
            id: randomItemId(8),
            name: randomString(10),
            price: randomPrice(0, 5),
        }));

        addCartItem(item, quantity, addOns);
        const updatedCart = getCartItems();

        assert.equal(updatedCart.length, 1, `Cart should have 1 item after adding (round ${round + 1})`);
        assert.equal(updatedCart[0].addOns.length, addOnsCount, `Add-ons count should match`);
        assert.equal(updatedCart[0].quantity, quantity, `Quantity should be ${quantity}`);
    }
    logPass('Fuzz addToCart with various add-ons handled correctly');

    // Test 4: Edge case - add item with zero or large quantities
    clearCart();
    const edgeCases = [0, 1, 100, 999];
    edgeCases.forEach((qty, index) => {
        clearCart();
        const item = createBaseMenuItem();
        addCartItem(item, qty, []);
        const updatedCart = getCartItems();
        if (qty > 0) {
            assert.equal(updatedCart.length, 1, `Item with quantity ${qty} should be added`);
        }
    });
    logPass('Fuzz addToCart with edge case quantities handled correctly');
}

/// New tests for remove from cart fuzzing
function fuzzRemovFromCart(): void {
    // Test 1: Remove from empty cart - should not crash
    clearCart();
    for (let round = 0; round < FUZZ_ROUNDS; round += 1) {
        const randomId = randomItemId(10);
        removeCartItem(randomId);
        const cartItems = getCartItems();
        assert.equal(cartItems.length, 0, `Cart should remain empty after removing from empty cart (round ${round + 1})`);
    }
    logPass('Fuzz removeCartItem from empty cart handled correctly');

    // Test 2: Remove valid item from cart with single item
    clearCart();
    const singleItem = createBaseMenuItem();
    const singleItemId = singleItem.getId();
    addCartItem(singleItem, 1, []);

    assert.equal(getCartItems().length, 1, 'Cart should have 1 item before removal');
    removeCartItem(singleItemId);
    assert.equal(getCartItems().length, 0, 'Cart should be empty after removing the only item');
    logPass('Fuzz removeCartItem single item handled correctly');

    // Test 3: Remove from cart with multiple items (same ID)
    clearCart();
    for (let i = 0; i < 5; i += 1) {
        const item = createBaseMenuItem();
        item.modBasePrice(randomPrice(5, 20));
        addCartItem(item, randomQuantity(1, 5), []);
    }

    assert.equal(getCartItems().length, 5, 'Cart should have 5 items');
    const itemIdToRemove = getCartItems()[0].item.getId();

    // Remove items - note: all items have the same ID so removing by ID removes the first one
    for (let round = 0; round < 3; round += 1) {
        const cartBefore = getCartItems().length;
        removeCartItem(itemIdToRemove);
        const cartAfter = getCartItems().length;

        assert.equal(cartAfter, cartBefore - 1, `Removing item should reduce cart by 1 (round ${round + 1})`);
    }
    logPass('Fuzz removeCartItem from multi-item cart handled correctly');

    // Test 4: Remove with invalid/non-existent IDs
    clearCart();
    const item = createBaseMenuItem();
    addCartItem(item, 1, []);

    const invalidIds = [
        randomItemId(20),
        randomString(15),
        '',
        'non_existent_id_12345'
    ];

    invalidIds.forEach((invalidId) => {
        const cartSizeBefore = getCartItems().length;
        removeCartItem(invalidId);
        const cartSizeAfter = getCartItems().length;

        assert.equal(cartSizeAfter, cartSizeBefore, `Removing non-existent item should not affect cart`);
    });
    logPass('Fuzz removeCartItem with invalid IDs handled correctly');

    // Test 5: Remove same item multiple times
    clearCart();
    const multiItem = createBaseMenuItem();
    const multiItemId = multiItem.getId();
    addCartItem(multiItem, 2, []);

    removeCartItem(multiItemId);
    assert.equal(getCartItems().length, 0, 'First removal should clear the item');

    removeCartItem(multiItemId);
    assert.equal(getCartItems().length, 0, 'Second removal of same item should not crash');
    logPass('Fuzz removeCartItem multiple removals handled correctly');

    // Test 6: Remove items with various ID string patterns
    clearCart();
    for (let round = 0; round < FUZZ_ROUNDS; round += 1) {
        clearCart();
        const item = createBaseMenuItem();
        addCartItem(item, 1, []);

        // Generate random invalid IDs with various patterns
        const randomIdPatterns = [
            randomString(5),
            `item_${randomString(10)}_${Math.random()}`,
            randomItemId(Math.floor(Math.random() * 50)),
        ];

        randomIdPatterns.forEach((pattern) => {
            removeCartItem(pattern);
        });

        const cartItems = getCartItems();
        assert.equal(cartItems.length, 1, `Original item should still be in cart after fuzzing with invalid IDs (round ${round + 1})`);
    }
    logPass('Fuzz removeCartItem with various ID patterns handled correctly');

    // Test 7: Stress test - add and remove many items
    clearCart();
    const addedCount = 20;
    for (let i = 0; i < addedCount; i += 1) {
        const item = createBaseMenuItem();
        addCartItem(item, randomQuantity(1, 3), []);
    }

    assert.equal(getCartItems().length, addedCount, `Cart should have ${addedCount} items after adding`);

    // Remove all items one by one
    while (getCartItems().length > 0) {
        const currentCart = getCartItems();
        const firstItemId = currentCart[0].item.getId();
        removeCartItem(firstItemId);
    }

    assert.equal(getCartItems().length, 0, 'Cart should be empty after removing all items');
    logPass('Fuzz removeCartItem stress test handled correctly');
}


function runFuzzSuite(): void {
    printHeader('FT-ORD-09 Add to Cart and Remove Cart Item Fuzz Test');
    try {
        testBaseState();
        fuzzAddToCart();
        fuzzRemovFromCart();

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
