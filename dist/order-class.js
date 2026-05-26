"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderManager = void 0;
exports.toIngredientId = toIngredientId;
function toIngredientId(value) {
    return value;
}
class OrderManager {
    items = [];
    customerNote = "";
    addFoodItemToOrder(item, ingredients) {
        if (!item.isAvailable()) {
            throw new Error(`Menu item "${item.getName()}" is not currently available.`);
        }
        const allowedIds = new Set(item.getIngredients().map(i => i.ingredients_id));
        for (const ing of ingredients) {
            if (!allowedIds.has(ing.ingredients_id)) {
                throw new Error(`Ingredient "${ing.ingredients_names}" is not a valid option for "${item.getName()}".`);
            }
        }
        const seen = new Set();
        const deduped = ingredients.filter(ing => {
            if (seen.has(ing.ingredients_id))
                return false;
            seen.add(ing.ingredients_id);
            return true;
        });
        this.items.push({ menuItem: item, selectedIngredients: deduped });
    }
    removeFoodItemFromOrder(item) {
        const idx = this.items.findLastIndex(o => o.menuItem.getId() === item.getId());
        if (idx === -1) {
            throw new Error(`Item "${item.getName()}" not found in the order.`);
        }
        this.items.splice(idx, 1);
    }
    clearOrderList() {
        this.items = [];
    }
    submitOrder(customerId, customerName) {
        if (this.items.length === 0) {
            throw new Error("Cannot submit an empty order.");
        }
        const confirmed = {
            orderId: Math.floor(Math.random() * 900000) + 100000,
            status: "confirmed",
            quantity: this.items.length,
            totalAmount: this.calculateTotal(),
            customerNote: this.customerNote,
            placedAt: new Date(),
            pickupCode: this.getPickupCode(Date.now()),
            items: this.items,
            customerId,
            customerName,
        };
        this.clearOrderList();
        return confirmed;
    }
    getPickupCode(orderId) {
        return (orderId % 10000).toString().padStart(4, "0");
    }
    setCustomerNote(note) {
        this.customerNote = note;
    }
    calculateTotal() {
        return this.items.reduce((sum, o) => sum + o.menuItem.getBasePrice(), 0);
    }
    getDraftOrder() {
        if (this.items.length === 0)
            return null;
        return {
            orderId: null,
            status: "pending",
            quantity: this.items.length,
            totalAmount: this.calculateTotal(),
            customerNote: this.customerNote,
            placedAt: null,
            pickupCode: null,
            items: this.items,
        };
    }
}
exports.OrderManager = OrderManager;
