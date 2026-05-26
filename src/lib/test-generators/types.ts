// src/lib/test-generators/types.ts

export interface GeneratedUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'student' | 'staff' | 'faculty';
  dietaryPreferences: string[];
  createdAt: Date;
}

export interface GeneratedMenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  basePrice: number;
  totalPrice: number;
  ingredients: string[];
  imageUrl: string | null;
  available: boolean;
  allergens: string[];
  prepTimeMinutes: number;
}

export interface GeneratedOrder {
  id: string;
  userId: string;
  items: GeneratedOrderItem[];
  total: number;
  status: 'Pending' | 'Preparing' | 'Ready for Pickup' | 'Completed' | 'Cancelled';
  specialInstructions: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  addOns: string[];
  specialInstructions: string;
}

export interface GeneratedPayment {
  id: string;
  orderId: string;
  amount: number;
  method: 'card' | 'cash' | 'meal_plan';
  cardInfo?: {
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  };
  billingAddress?: GeneratedAddress;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
}

export interface GeneratedAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface GeneratedPromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  expiresAt: Date;
  usageLimit: number;
  timesUsed: number;
  active: boolean;
}

export interface GenerateOptions {
  includeEdgeCases?: boolean;
  includeInvalid?: boolean;
  seed?: number;
}
