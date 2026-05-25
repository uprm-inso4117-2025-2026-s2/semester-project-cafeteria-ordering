type CartItem = {
  item: any;
  quantity: number;
  addOns: any[];
};

let cartItems: CartItem[] = [];

export const addCartItem = (
  item: any,
  quantity: number = 1,
  addOns: any[] = []
) => {
  cartItems.push({ item, quantity, addOns });
  console.log('Cart Updated:', cartItems);
};

export const getCartItems = () => {
  return cartItems;
};