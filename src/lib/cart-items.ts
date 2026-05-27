import { MenuItem } from "@/models/food-item-class";

type CartItem = {
  item: MenuItem;
  quantity: number;
  addOns: any[];
};

let cartItems: CartItem[] = [];

export const addCartItem = (
  item: MenuItem,
  quantity: number = 1,
  addOns: any[] = []
) => {
  cartItems.push({ item, quantity, addOns });
  console.log('Cart Updated:', cartItems);
};

export const removeCartItem = (itemId: string) => {
  const index = cartItems.findIndex((c) => c.item.getId() === itemId);
  if (index !== -1) {
    cartItems.splice(index, 1);
  }
  console.log('Cart Updated:', cartItems);
};

export const clearCart = () => {
  cartItems = [];
  console.log('Cart Cleared');
}

export const getCartItems = () => {
  return cartItems;
};