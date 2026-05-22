// src/lib/test-generators/menu-generator.ts

import { GeneratedMenuItem, GenerateOptions } from './types';

const CATEGORIES = ['cat1', 'cat2', 'cat3', 'cat4', 'cat5'];
const CATEGORY_NAMES = ['Lunch', 'Breakfast', 'Dinner', 'Drinks', 'Snacks'];

const MENU_ITEMS = {
  Breakfast: [
    'Classic Pancakes', 'Omelette', 'Breakfast Burrito', 'Avocado Toast',
    'Greek Yogurt Parfait', 'French Toast', 'Eggs Benedict', 'Smoothie Bowl'
  ],
  Lunch: [
    'Grilled Chicken Sandwich', 'Caesar Salad', 'Quinoa Bowl', 'Turkey Club',
    'Vegetable Wrap', 'Tomato Soup', 'Tuna Melt', 'Caprese Panini'
  ],
  Dinner: [
    'Grilled Salmon', 'Beef Stew', 'Vegetable Lasagna', 'Chicken Alfredo',
    'Beef Burger', 'Shrimp Scampi', 'Tofu Stir Fry', 'Pork Chop'
  ],
  Drinks: [
    'Fresh Orange Juice', 'Iced Coffee', 'Green Tea', 'Smoothie',
    'Lemonade', 'Hot Chocolate', 'Matcha Latte', 'Sparkling Water'
  ],
  Snacks: [
    'Potato Chips', 'Fruit Cup', 'Granola Bar', 'Hummus with Pita',
    'Trail Mix', 'Cookie', 'Brownie', 'Apple Slices'
  ]
};

const INGREDIENTS = {
  Breakfast: ['Eggs', 'Bacon', 'Cheese', 'Bread', 'Butter', 'Milk', 'Syrup', 'Berries'],
  Lunch: ['Lettuce', 'Tomato', 'Chicken', 'Bread', 'Mayo', 'Avocado', 'Bacon', 'Turkey'],
  Dinner: ['Beef', 'Pasta', 'Tomato Sauce', 'Cheese', 'Garlic', 'Herbs', 'Vegetables'],
  Drinks: ['Water', 'Sugar', 'Milk', 'Ice', 'Coffee Beans', 'Tea Leaves', 'Fruit'],
  Snacks: ['Potato', 'Salt', 'Oil', 'Chocolate', 'Nuts', 'Fruit', 'Grains']
};

const ALLERGENS = ['Nuts', 'Dairy', 'Gluten', 'Soy', 'Eggs', 'Shellfish', 'Fish', 'Sesame'];

function getRandomCategory(): { id: string; name: string } {
  const index = Math.floor(Math.random() * CATEGORIES.length);
  return { id: CATEGORIES[index], name: CATEGORY_NAMES[index] };
}

function getRandomItemName(categoryName: string): string {
  const items = MENU_ITEMS[categoryName as keyof typeof MENU_ITEMS] || MENU_ITEMS.Lunch;
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomIngredients(categoryName: string): string[] {
  const ingredientList = INGREDIENTS[categoryName as keyof typeof INGREDIENTS] || INGREDIENTS.Lunch;
  const numIngredients = Math.floor(Math.random() * 5) + 2; // 2-6 ingredients
  const shuffled = [...ingredientList];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, numIngredients);
}

function getRandomAllergens(ingredients: string[]): string[] {
  const allergenMap: Record<string, string[]> = {
    'Milk': ['Dairy'],
    'Cheese': ['Dairy'],
    'Butter': ['Dairy'],
    'Eggs': ['Eggs'],
    'Bread': ['Gluten'],
    'Pasta': ['Gluten'],
    'Nuts': ['Nuts'],
    'Peanuts': ['Nuts'],
    'Soy': ['Soy'],
    'Shellfish': ['Shellfish'],
    'Fish': ['Fish']
  };
  
  const detectedAllergens = new Set<string>();
  ingredients.forEach(ingredient => {
    const matchedAllergens = allergenMap[ingredient] || [];
    matchedAllergens.forEach(a => detectedAllergens.add(a));
  });
  
  // Add some random allergens for variety
  if (Math.random() > 0.7) {
    const randomAllergen = ALLERGENS[Math.floor(Math.random() * ALLERGENS.length)];
    detectedAllergens.add(randomAllergen);
  }
  
  return Array.from(detectedAllergens);
}

function generateDescription(name: string, ingredients: string[]): string {
  if (ingredients.length === 0) {
    return `Delicious ${name.toLowerCase()} freshly prepared.`;
  }
  if (ingredients.length === 1) {
    return `Fresh ${name.toLowerCase()} made with ${ingredients[0].toLowerCase()}.`;
  }
  const ingredientList = ingredients.slice(0, -1).join(', ');
  const lastIngredient = ingredients[ingredients.length - 1];
  return `Delicious ${name.toLowerCase()} made with ${ingredientList} and ${lastIngredient.toLowerCase()}.`;
}

export function generateRandomMenuItem(options: GenerateOptions = {}): GeneratedMenuItem {
  const { includeEdgeCases = false, includeInvalid = false, seed } = options;
  
  if (seed !== undefined) {
    Math.seedrandom?.(seed.toString());
  }

  const category = getRandomCategory();
  const itemName = getRandomItemName(category.name);
  const ingredients = getRandomIngredients(category.name);
  const basePrice = Number((Math.random() * 20 + 3).toFixed(2)); // $3-23
  const allergens = getRandomAllergens(ingredients);
  const available = Math.random() > 0.15; // 85% available

  // Edge cases
  if (includeEdgeCases && Math.random() < 0.15) {
    const edgeType = Math.floor(Math.random() * 5);
    switch (edgeType) {
      case 0: // Very expensive
        return {
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          categoryId: category.id,
          name: `${itemName} (Premium Edition)`,
          description: generateDescription(itemName, ingredients),
          basePrice: 99.99,
          totalPrice: 99.99,
          ingredients,
          imageUrl: null,
          available: true,
          allergens,
          prepTimeMinutes: 45,
        };
      case 1: // Very cheap (almost free)
        return {
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          categoryId: category.id,
          name: `Sample ${itemName}`,
          description: generateDescription(itemName, ingredients),
          basePrice: 0.50,
          totalPrice: 0.50,
          ingredients,
          imageUrl: null,
          available: true,
          allergens,
          prepTimeMinutes: 5,
        };
      case 2: // Unavailable item
        return {
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          categoryId: category.id,
          name: itemName,
          description: generateDescription(itemName, ingredients),
          basePrice,
          totalPrice: basePrice,
          ingredients,
          imageUrl: null,
          available: false,
          allergens,
          prepTimeMinutes: Math.floor(Math.random() * 30) + 10,
        };
      case 3: // Very long name
        return {
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          categoryId: category.id,
          name: itemName + ' ' + 'Extra'.repeat(20),
          description: generateDescription(itemName, ingredients),
          basePrice,
          totalPrice: basePrice,
          ingredients,
          imageUrl: null,
          available,
          allergens,
          prepTimeMinutes: Math.floor(Math.random() * 30) + 10,
        };
      default: // Many allergens
        return {
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          categoryId: category.id,
          name: itemName,
          description: `Contains: ${ALLERGENS.join(', ')}. ${generateDescription(itemName, ingredients)}`,
          basePrice,
          totalPrice: basePrice,
          ingredients,
          imageUrl: null,
          available,
          allergens: [...ALLERGENS],
          prepTimeMinutes: Math.floor(Math.random() * 30) + 10,
        };
    }
  }

  // Invalid inputs
  if (includeInvalid && Math.random() < 0.1) {
    const invalidType = Math.floor(Math.random() * 4);
    switch (invalidType) {
      case 0: // Negative price
        return {
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          categoryId: category.id,
          name: itemName,
          description: generateDescription(itemName, ingredients),
          basePrice: -5,
          totalPrice: -5,
          ingredients,
          imageUrl: null,
          available,
          allergens,
          prepTimeMinutes: Math.floor(Math.random() * 30) + 10,
        };
      case 1: // Empty name
        return {
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          categoryId: category.id,
          name: '',
          description: '',
          basePrice,
          totalPrice: basePrice,
          ingredients: [],
          imageUrl: null,
          available,
          allergens: [],
          prepTimeMinutes: 0,
        };
      case 2: // Zero prep time
        return {
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          categoryId: category.id,
          name: itemName,
          description: generateDescription(itemName, ingredients),
          basePrice,
          totalPrice: basePrice,
          ingredients,
          imageUrl: null,
          available,
          allergens,
          prepTimeMinutes: 0,
        };
      default: // Extremely high price
        return {
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          categoryId: category.id,
          name: itemName,
          description: generateDescription(itemName, ingredients),
          basePrice: 999999,
          totalPrice: 999999,
          ingredients,
          imageUrl: null,
          available,
          allergens,
          prepTimeMinutes: Math.floor(Math.random() * 30) + 10,
        };
    }
  }

  // Normal random item
  const addOnMultiplier = 1 + (Math.random() * 0.5); // 0-50% add-on for total price
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    categoryId: category.id,
    name: itemName,
    description: generateDescription(itemName, ingredients),
    basePrice,
    totalPrice: Number((basePrice * addOnMultiplier).toFixed(2)),
    ingredients,
    imageUrl: Math.random() > 0.7 ? `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/200/200` : null,
    available,
    allergens,
    prepTimeMinutes: Math.floor(Math.random() * 30) + 10,
  };
}

export function generateManyMenuItems(count: number, options?: GenerateOptions): GeneratedMenuItem[] {
  return Array.from({ length: count }, () => generateRandomMenuItem(options));
}
