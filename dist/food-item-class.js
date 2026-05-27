"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuItem = void 0;
class MenuItem {
    id;
    category_id;
    name;
    ingredients; // from relationship table
    price;
    image_url;
    available;
    allergens;
    prep_time_minutes;
    created_at;
    updated_at;
    constructor(id, category_id, name, ingredients, price, image_url, available, allergens, prep_time_minutes, created_at, updated_at) {
        this.id = id ?? "";
        this.category_id = category_id ?? "";
        this.name = name ?? "";
        this.ingredients = ingredients ?? [];
        this.price = price ?? 0;
        this.image_url = image_url ?? "";
        this.available = available ?? false;
        this.allergens = allergens ?? [];
        this.prep_time_minutes = prep_time_minutes ?? 0;
        this.created_at = created_at ?? "";
        this.updated_at = updated_at ?? "";
    }
    // Static Factory: Build from a Supabase row + joined ingredients
    // Usage:
    //   const { data: row } = await supabase
    //     .from('menu_items')
    //     .select('*')
    //     .eq('id', someId)
    //     .single();
    //
    //   const { data: relRows } = await supabase
    //     .from('menu_items_ingredients_relationship')
    //     .select('ingredients_table(*)')
    //     .eq('menu_item_id', someId);
    //
    //   const ingredients = relRows.map(r => r.ingredients_table);
    //   const item = MenuItem.fromDatabaseRow(row, ingredients);
    static fromDatabaseRow(row, ingredients) {
        return new MenuItem(row.id, row.category_id, row.name, ingredients, row.price, row.image_url, row.available, row.allergens, row.prep_time_minutes, row.created_at, row.updated_at);
    }
    // getters
    getId() {
        return this.id;
    }
    getCategoryId() {
        return this.category_id;
    }
    getName() {
        return this.name;
    }
    // Returns a copy to prevent direct mutation of the internal list
    getIngredients() {
        return [...this.ingredients];
    }
    getBasePrice() {
        return this.price;
    }
    getImageUrl() {
        return this.image_url;
    }
    isAvailable() {
        return this.available;
    }
    getAllergens() {
        return [...this.allergens];
    }
    getPrepTime() {
        return this.prep_time_minutes;
    }
    getCreatedAt() {
        return this.created_at;
    }
    getUpdatedAt() {
        return this.updated_at;
    }
    // Returns price
    getTotalPrice() {
        return this.price;
    }
    // Call this before allowing a user to add the item to their cart.
    // Returns true if the item can be ordered, false otherwise.
    canOrder() {
        if (!this.available) {
            console.warn(`"${this.name}" is currently unavailable.`);
            return false;
        }
        return true;
    }
    // Adds an ingredient if not already present.
    addIngredient(ingredient) {
        const exists = this.ingredients.some((ing) => ing.ingredients_id === ingredient.ingredients_id);
        if (exists) {
            console.warn(`Ingredient "${ingredient.ingredients_names}" is already in "${this.name}".`);
            return;
        }
        this.ingredients.push(ingredient);
        if (ingredient.ingredients_price) {
            this.price += ingredient.ingredients_price;
        }
    }
    // Removes an ingredient by its uuid.
    removeIngredient(ingredientId) {
        const index = this.ingredients.findIndex((ing) => ing.ingredients_id === ingredientId);
        if (index === -1) {
            console.warn(`Ingredient with id "${ingredientId}" not found in "${this.name}".`);
            return;
        }
        const removed = this.ingredients[index];
        if (removed.ingredients_price) {
            this.price -= removed.ingredients_price;
        }
        this.ingredients.splice(index, 1);
    }
    // Staff only Modifiers
    // These should only be used by staff/admin, not during ordering.
    modName(name) {
        this.name = name;
    }
    modBasePrice(price) {
        this.price = price;
    }
    modAvail(available) {
        this.available = available;
    }
    modIngredients(ingredients) {
        this.ingredients = ingredients;
    }
    modImg(image_url) {
        this.image_url = image_url;
    }
}
exports.MenuItem = MenuItem;
