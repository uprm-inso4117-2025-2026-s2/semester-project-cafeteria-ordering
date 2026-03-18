// Matches a row from ingredients_table joined through
// menu_items_ingredients_relationship
export interface IngredientItem {
  ingredients_id: string;
  ingredients_names: string;
  ingredients_price: number;
}

// Matches a row from menu_items (after dropping the redundant ingredients column)
export interface MenuItemRow {
  id: string; //uuid
  category_id: string; //uuid
  name: string;
  price: number;
  image_url: string;
  available: boolean;
  allergens: string[];
  prep_time_minutes: number;
  created_at: string;
  updated_at: string;
}

export class MenuItem {
  private id: string;
  private category_id: string;
  private name: string;
  private ingredients: IngredientItem[]; // from relationship table
  private price: number;
  private image_url: string;
  private available: boolean;
  private allergens: string[];
  private prep_time_minutes: number;
  private created_at: string;
  private updated_at: string;

  // creates blank menu item
  constructor();

  // creates a MenuItem from Supabase data
  constructor(
    id: string,
    category_id: string,
    name: string,
    ingredients: IngredientItem[],
    price: number,
    image_url: string,
    available: boolean,
    allergens: string[],
    prep_time_minutes: number,
    created_at: string,
    updated_at: string
  );

  constructor(
    id?: string,
    category_id?: string,
    name?: string,
    ingredients?: IngredientItem[],
    price?: number,
    image_url?: string,
    available?: boolean,
    allergens?: string[],
    prep_time_minutes?: number,
    created_at?: string,
    updated_at?: string
  ) {
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
  static fromDatabaseRow(
    row: MenuItemRow,
    ingredients: IngredientItem[]
  ): MenuItem {
    return new MenuItem(
      row.id,
      row.category_id,
      row.name,
      ingredients,
      row.price,
      row.image_url,
      row.available,
      row.allergens,
      row.prep_time_minutes,
      row.created_at,
      row.updated_at
    );
  }

  // getters

  getId(): string {
    return this.id;
  }

  getCategoryId(): string {
    return this.category_id;
  }

  getName(): string {
    return this.name;
  }

  // Returns a copy to prevent direct mutation of the internal list
  getIngredients(): IngredientItem[] {
    return [...this.ingredients];
  }

  getBasePrice(): number {
    return this.price;
  }

  getImageUrl(): string {
    return this.image_url;
  }

  isAvailable(): boolean {
    return this.available;
  }

  getAllergens(): string[] {
    return [...this.allergens];
  }

  getPrepTime(): number {
    return this.prep_time_minutes;
  }

  getCreatedAt(): string {
    return this.created_at;
  }

  getUpdatedAt(): string {
    return this.updated_at;
  }

  // Returns price
  getTotalPrice(): number {
    return this.price;
  }

  // Call this before allowing a user to add the item to their cart.
  // Returns true if the item can be ordered, false otherwise.
  canOrder(): boolean {
    if (!this.available) {
      console.warn(`"${this.name}" is currently unavailable.`);
      return false;
    }
    return true;
  }


  // Adds an ingredient if not already present.
  addIngredient(ingredient: IngredientItem): void {
    const exists = this.ingredients.some(
      (ing) => ing.ingredients_id === ingredient.ingredients_id
    );
    if (exists) {
      console.warn(
        `Ingredient "${ingredient.ingredients_names}" is already in "${this.name}".`
      );
      return;
    }
    this.ingredients.push(ingredient);
    if (ingredient.ingredients_price) {
      this.price += ingredient.ingredients_price;
    }
  }

  // Removes an ingredient by its uuid.
  removeIngredient(ingredientId: string): void {
    const index = this.ingredients.findIndex(
      (ing) => ing.ingredients_id === ingredientId
    );
    if (index === -1) {
      console.warn(
        `Ingredient with id "${ingredientId}" not found in "${this.name}".`
      );
      return;
    }
    const removed = this.ingredients[index];
    if(removed.ingredients_price) {
      this.price -= removed.ingredients_price;
    }
    
    this.ingredients.splice(index, 1);
  }

  // Staff only Modifiers
  // These should only be used by staff/admin, not during ordering.

  modName(name: string): void {
    this.name = name;
  }

  modBasePrice(price: number): void {
    this.price = price;
  }

  modAvail(available: boolean): void {
    this.available = available;
  }

  modIngredients(ingredients: IngredientItem[]): void {
    this.ingredients = ingredients;
  }

  modImg(image_url: string): void {
    this.image_url = image_url;
  }
}