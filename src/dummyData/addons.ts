/**
 * AddOn Interface
 *
 * Represents an additional item or customization that can be added to a menu item
 *
 * Properties:
 * - `id` (string): Unique identifier for the add-on
 * - `name` (string): Display name of the add-on
 * - `price` (number): Additional cost of the add-on in USD
 */

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export const availableAddOns: AddOn[] = [
  { id: "addon1", name: "Extra Cheese", price: 1.0 },
  { id: "addon2", name: "Fries", price: 1.5 },
  { id: "addon3", name: "Fruit Side", price: 2.5 },
  { id: "addon4", name: "Extra Sauce", price: 0.5 },
];