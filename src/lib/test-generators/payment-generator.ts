// src/lib/test-generators/payment-generator.ts
import { GeneratedPayment, GeneratedAddress, GenerateOptions } from './types';

export function generateRandomPayment(options: GenerateOptions = {}): GeneratedPayment {
  const amount = Number((Math.random() * 100 + 5).toFixed(2));
  const methods = ['card', 'cash', 'meal_plan'] as const;
  const method = methods[Math.floor(Math.random() * methods.length)];
  
  return {
    id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    amount,
    method,
    status: 'completed',
    timestamp: new Date()
  };
}

export function generateManyPayments(count: number, options?: GenerateOptions): GeneratedPayment[] {
  return Array.from({ length: count }, () => generateRandomPayment(options));
}
