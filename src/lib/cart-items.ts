import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuItem, Ingredient } from "@/models/food-item-class";

type CartItem = {
  item: MenuItem;
  quantity: number;
  addOns: any[];
};

// Key for storing cart in AsyncStorage
const CART_STORAGE_KEY = '@cart_items';
const GUEST_SESSION_KEY = '@guest_session_data';

// Function to rehydrate MenuItem from stored data
const rehydrateMenuItem = (data: any): MenuItem => {
  // Create a new MenuItem instance
  const menuItem = new MenuItem(
    data.id,
    data.name,
    data.basePrice,
    data.categoryId,
    data.ingredients?.map((i: any) => new Ingredient(i.ingredients_names, i.ingredients_id)) || [],
    data.imageUrl,
    data.isAvailable,
    data.allergens || [],
    data.preparationTime || 0
  );
  return menuItem;
};

// Helper to load cart from storage with rehydration
const loadCartFromStorage = async (): Promise<CartItem[]> => {
  try {
    const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      // Rehydrate MenuItem objects
      return parsedCart.map((cartItem: any) => ({
        item: rehydrateMenuItem(cartItem.item),
        quantity: cartItem.quantity,
        addOns: cartItem.addOns,
      }));
    }
  } catch (error) {
    console.error('Error loading cart from storage:', error);
  }
  return [];
};

// Helper to save cart to storage
const saveCartToStorage = async (cart: CartItem[]) => {
  try {
    // Convert MenuItem to serializable format
    const serializableCart = cart.map(cartItem => ({
      item: {
        id: cartItem.item.getId(),
        name: cartItem.item.getName(),
        basePrice: cartItem.item.getBasePrice(),
        totalPrice: cartItem.item.getTotalPrice(),
        categoryId: cartItem.item.getCategoryId(),
        ingredients: cartItem.item.getIngredients(),
        imageUrl: cartItem.item.getImageUrl(),
        isAvailable: cartItem.item.isAvailable(),
        allergens: cartItem.item.getAllergens(),
        preparationTime: cartItem.item.getPreparationTime(),
      },
      quantity: cartItem.quantity,
      addOns: cartItem.addOns,
    }));
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(serializableCart));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

// In-memory cache for quick access
let cartItemsCache: CartItem[] = [];
let isCacheLoaded = false;

// Initialize cart from storage
const initializeCart = async () => {
  if (!isCacheLoaded) {
    cartItemsCache = await loadCartFromStorage();
    isCacheLoaded = true;
  }
  return cartItemsCache;
};

export const addCartItem = async (
  item: MenuItem,
  quantity: number = 1,
  addOns: any[] = []
) => {
  await initializeCart();
  cartItemsCache.push({ item, quantity, addOns });
  await saveCartToStorage(cartItemsCache);
  console.log('Cart Updated:', cartItemsCache);
};

export const removeCartItem = async (itemId: string) => {
  await initializeCart();
  const index = cartItemsCache.findIndex((c) => c.item.getId() === itemId);
  if (index !== -1) {
    cartItemsCache.splice(index, 1);
    await saveCartToStorage(cartItemsCache);
  }
  console.log('Cart Updated:', cartItemsCache);
};

export const clearCart = async () => {
  cartItemsCache = [];
  await saveCartToStorage(cartItemsCache);
  console.log('Cart Cleared');
};

export const getCartItems = async () => {
  await initializeCart();
  return cartItemsCache;
};

// Sync getter for when you need immediate value (use with caution)
export const getCartItemsSync = () => {
  return cartItemsCache;
};

// Merge guest cart with user cart after login/signup
export const mergeGuestCartWithUserCart = async (userId: string) => {
  try {
    await initializeCart();
    
    // Check if there are guest cart items
    if (!cartItemsCache || cartItemsCache.length === 0) {
      console.log('No guest cart items to merge');
      return;
    }
    
    // Get user's existing cart from storage
    const userCartKey = `@cart_items_user_${userId}`;
    const userCartJson = await AsyncStorage.getItem(userCartKey);
    let userCart: CartItem[] = [];
    
    if (userCartJson) {
      const parsedUserCart = JSON.parse(userCartJson);
      // Rehydrate user cart items
      userCart = parsedUserCart.map((cartItem: any) => ({
        item: rehydrateMenuItem(cartItem.item),
        quantity: cartItem.quantity,
        addOns: cartItem.addOns,
      }));
    }
    
    // Merge guest cart with user cart
    const mergedCart = [...userCart];
    
    for (const guestItem of cartItemsCache) {
      const existingIndex = mergedCart.findIndex(
        item => item.item.getId() === guestItem.item.getId()
      );
      
      if (existingIndex >= 0) {
        // Item exists, update quantity and add-ons
        mergedCart[existingIndex].quantity += guestItem.quantity;
        // Merge add-ons (avoid duplicates)
        const existingAddonIds = mergedCart[existingIndex].addOns.map((a: any) => a.id);
        const newAddons = guestItem.addOns.filter((a: any) => !existingAddonIds.includes(a.id));
        mergedCart[existingIndex].addOns = [...mergedCart[existingIndex].addOns, ...newAddons];
      } else {
        // Add new item
        mergedCart.push(guestItem);
      }
    }
    
    // Save merged cart - serialize properly
    const serializableMergedCart = mergedCart.map(cartItem => ({
      item: {
        id: cartItem.item.getId(),
        name: cartItem.item.getName(),
        basePrice: cartItem.item.getBasePrice(),
        totalPrice: cartItem.item.getTotalPrice(),
        categoryId: cartItem.item.getCategoryId(),
        ingredients: cartItem.item.getIngredients(),
        imageUrl: cartItem.item.getImageUrl(),
        isAvailable: cartItem.item.isAvailable(),
        allergens: cartItem.item.getAllergens(),
        preparationTime: cartItem.item.getPreparationTime(),
      },
      quantity: cartItem.quantity,
      addOns: cartItem.addOns,
    }));
    
    await AsyncStorage.setItem(userCartKey, JSON.stringify(serializableMergedCart));
    
    // Set the merged cart as the current cart
    cartItemsCache = mergedCart;
    await saveCartToStorage(cartItemsCache);
    
    // Mark that guest session has been upgraded
    await AsyncStorage.setItem(GUEST_SESSION_KEY, JSON.stringify({ 
      upgraded: true, 
      userId, 
      upgradedAt: new Date().toISOString() 
    }));
    
    console.log('Guest cart merged successfully', { 
      mergedItemsCount: mergedCart.length 
    });
    
    return mergedCart;
  } catch (error) {
    console.error('Error merging guest cart:', error);
    throw error;
  }
};

// Function to check if user has guest data before upgrade
export const hasGuestData = async (): Promise<boolean> => {
  try {
    await initializeCart();
    return cartItemsCache.length > 0;
  } catch (error) {
    console.error('Error checking guest data:', error);
    return false;
  }
};

// Function to clear guest data after upgrade
export const clearGuestData = async () => {
  try {
    cartItemsCache = [];
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
    console.log('Guest data cleared after upgrade');
  } catch (error) {
    console.error('Error clearing guest data:', error);
  }
};

// Initialize cart on app start
initializeCart().catch(console.error);
