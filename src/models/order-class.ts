// For testing the order in Supabase.
// Run from the root folder: npx tsx src/models/order-class-supabase-test.ts
// After testing is finished, remove files: order-class-supabase-test.ts, food-item-class.js and order-class.js
// Their locations are:
// src/models/order-class-supabase-test.ts
// dist\food-item-class.js
// dist\order-class.js
// These previous files should not be in production.



import { IngredientItem, MenuItem } from "./food-item-class.js";


declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };


export type IngredientId = Brand<string, "IngredientId">;


export function toIngredientId(value: string): IngredientId {
  return value as IngredientId;
}

export type IngredientSet = ReadonlySet<IngredientId>;


export interface OrderItem {
  readonly menuItem: MenuItem;
  readonly selectedIngredients: IngredientItem[];
}


export type NonEmptyArray<T> = [T, ...T[]];


export type OrderStatus =
  | "placed"      
  | "confirmed"   
  | "preparing"   
  | "ready"       
  | "completed";  


export interface OrderDraft {
  readonly order_id: null;
  readonly status: "pending";
  readonly is_available: boolean;
  readonly quantity: number;
  readonly total_amount: number;
  readonly customer_note: string;
  readonly placed_at: null;
  readonly pickup_code: null;
  readonly items: NonEmptyArray<OrderItem>;
}


export interface OrderConfirmed {
  readonly order_id: number;
  readonly status: OrderStatus;
  readonly is_available: boolean;
  readonly quantity: number;
  readonly total_amount: number;
  readonly customer_note: string;
  readonly placed_at: Date;
  readonly pickup_code: string;
  readonly items: NonEmptyArray<OrderItem>;
  readonly customer_id: number | null;
  readonly customer_name: string;
}


export type Order = OrderDraft | OrderConfirmed;


export class OrderManager {
  private items: OrderItem[] = [];
  private customer_note: string = "";




  addFoodItemToOrder(item: MenuItem, ingredients: IngredientItem[]): void {
    if (!item.isAvailable()) {
      throw new Error(`Menu item "${item.getName()}" is not currently available.`);
    }

    const allowedIds = new Set(item.getIngredients().map(i => i.ingredients_id));
    for (const ing of ingredients) {
      if (!allowedIds.has(ing.ingredients_id)) {
        throw new Error(
          `Ingredient "${ing.ingredients_names}" is not a valid option for "${item.getName()}".`
        );
      }
    }

    const seen = new Set<string>();
    const deduped = ingredients.filter(ing => {
      if (seen.has(ing.ingredients_id)) return false;
      seen.add(ing.ingredients_id);
      return true;
    });

    this.items.push({ menuItem: item, selectedIngredients: deduped });
  }


  removeFoodItemFromOrder(item: MenuItem): void {
    const idx = this.items.findLastIndex(o => o.menuItem.getId() === item.getId());
    if (idx === -1) {
      throw new Error(`Item "${item.getName()}" not found in the order.`);
    }
    this.items.splice(idx, 1);
  }

  
  clearOrderList(): void {
    this.items = [];
  }

  
  submitOrder(customer_id: number, customer_name: string): OrderConfirmed {
    if (this.items.length === 0) {
      throw new Error("Cannot submit an empty order.");
    }

    const confirmed: OrderConfirmed = {
      order_id: Math.floor(Math.random() * 900000) + 100000,
      status: "confirmed",
      is_available: true,
      quantity: this.items.length,
      total_amount: this.calculateTotal(),
      customer_note: this.customer_note,
      placed_at: new Date(),
      pickup_code: this.getPickupCode(Date.now()),
      items: this.items as unknown as NonEmptyArray<OrderItem>,
      customer_id,
      customer_name,
    };

    this.clearOrderList();
    return confirmed;
  }


  getPickupCode(order_id: number): string {
    return (order_id % 10000).toString().padStart(4, "0");
  }







  setCustomerNote(note: string): void {
    this.customer_note = note;
  }


  calculateTotal(): number {
    return this.items.reduce((sum, o) => sum + o.menuItem.getBasePrice(), 0);
  }

  getOrderDraft(): OrderDraft | null {
    if (this.items.length === 0) return null;
    return {
      order_id: null,
      status: "pending",
      is_available: true,
      quantity: this.items.length,
      total_amount: this.calculateTotal(),
      customer_note: this.customer_note,
      placed_at: null,
      pickup_code: null,
      items: this.items as unknown as NonEmptyArray<OrderItem>,
    };
  }



}