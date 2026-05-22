// src/lib/test-generators/order-generator.ts

import { GeneratedOrder, GeneratedOrderItem, GeneratedMenuItem, GenerateOptions } from './types';
import { generateRandomMenuItem } from './menu-generator';
import { generateRandomUser } from './user-generator';

const ORDER_STATUSES = ['Pending', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'] as const;
const SPECIAL_INSTRUCTIONS = [
  '', 'No onions please', 'Extra sauce', 'Make it spicy', 'Less salt',
  'Gluten-free option', 'Vegan please', 'Extra napkins', 'No cheese',
  'Well done', 'Add pickles', 'Double meat', 'Light ice', 'Room temperature'
];

const ADD_ONS = [
  'Extra Cheese', 'Bacon', 'Avocado', 'Extra Sauce', 'Double Meat',
  'Side Salad', 'Fries', 'Onion Rings', 'Extra Dressing', 'Add Egg'
];

function generateRandomQuantity(): number {
  // Weighted distribution: mostly 1-3 items, occasional larger orders
  const rand = Math.random();
  if (rand < 0.6) return 1;
  if (rand < 0.8) return 2;
  if (rand < 0.9) return 3;
  if (rand < 0.95) return Math.floor(Math.random() * 7) + 4; // 4-10
  return Math.floor(Math.random() * 90) + 10; // 10-100 (large order)
}

function generateRandomAddOns(): string[] {
  const numAddOns = Math.floor(Math.random() * 3);
  const shuffled = [...ADD_ONS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, numAddOns);
}

function generateRandomSpecialInstructions(): string {
  if (Math.random() > 0.4) return '';
  return SPECIAL_INSTRUCTIONS[Math.floor(Math.random() * SPECIAL_INSTRUCTIONS.length)];
}

function generateOrderItem(menuItem?: GeneratedMenuItem): GeneratedOrderItem {
  const item = menuItem || generateRandomMenuItem();
  const quantity = generateRandomQuantity();
  const addOns = generateRandomAddOns();
  const addOnPrice = addOns.length * 1.50; // $1.50 per add-on
  
  return {
    menuItemId: item.id,
    name: item.name,
    quantity,
    unitPrice: item.basePrice + addOnPrice,
    addOns,
    specialInstructions: generateRandomSpecialInstructions(),
  };
}

export function generateRandomOrder(options: GenerateOptions = {}): GeneratedOrder {
  const { includeEdgeCases = false, includeInvalid = false, seed } = options;
  
  if (seed !== undefined) {
    Math.seedrandom?.(seed.toString());
  }

  const numItems = includeEdgeCases && Math.random() < 0.1 ? 50 : Math.floor(Math.random() * 5) + 1;
  const items = Array.from({ length: numItems }, () => generateOrderItem());
  const total = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const user = generateRandomUser();
  
  let status = ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)];
  let createdAt = new Date();
  let updatedAt = new Date();
  
  // Edge cases for status and dates
  if (includeEdgeCases && Math.random() < 0.1) {
    const edgeType = Math.floor(Math.random() * 3);
    switch (edgeType) {
      case 0: // Very old order
        createdAt = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        updatedAt = createdAt;
        status = 'Completed';
        break;
      case 1: // Future order (invalid)
        createdAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        updatedAt = createdAt;
        break;
      case 2: // Cancelled order with items
        status = 'Cancelled';
        break;
    }
  }
  
  // Invalid inputs
  if (includeInvalid && Math.random() < 0.1) {
    const invalidType = Math.floor(Math.random() * 3);
    switch (invalidType) {
      case 0: // Empty order
        return {
          id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          userId: user.id,
          items: [],
          total: 0,
          status: 'Pending',
          specialInstructions: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      case 1: // Negative total (shouldn't happen but tests should catch)
        return {
          id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          userId: user.id,
          items,
          total: -total,
          status: 'Pending',
          specialInstructions: generateRandomSpecialInstructions(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      case 2: // Invalid user ID
        return {
          id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          userId: '',
          items,
          total,
          status: 'Pending',
          specialInstructions: generateRandomSpecialInstructions(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
    }
  }
  
  return {
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    userId: user.id,
    items,
    total: Number(total.toFixed(2)),
    status,
    specialInstructions: generateRandomSpecialInstructions(),
    createdAt,
    updatedAt,
  };
}

export function generateManyOrders(count: number, options?: GenerateOptions): GeneratedOrder[] {
  return Array.from({ length: count }, () => generateRandomOrder(options));
}
