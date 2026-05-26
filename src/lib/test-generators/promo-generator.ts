// src/lib/test-generators/promo-generator.ts
import { GeneratedPromoCode, GenerateOptions } from './types';

const CODE_PREFIXES = ['SAVE', 'DEAL', 'PROMO', 'DISCOUNT', 'WELCOME'];

export function generateRandomPromoCode(options: GenerateOptions = {}): GeneratedPromoCode {
  const prefix = CODE_PREFIXES[Math.floor(Math.random() * CODE_PREFIXES.length)];
  const codeNumber = Math.floor(Math.random() * 10000);
  
  return {
    id: `promo_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    code: `${prefix}${codeNumber}`,
    discountType: Math.random() > 0.5 ? 'percentage' : 'fixed',
    discountValue: Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 5 : Math.floor(Math.random() * 20) + 5,
    minPurchase: Math.floor(Math.random() * 20) + 5,
    maxDiscount: Math.random() > 0.7 ? Math.floor(Math.random() * 50) + 10 : undefined,
    expiresAt: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
    usageLimit: Math.floor(Math.random() * 1000) + 100,
    timesUsed: 0,
    active: true
  };
}

export function generateManyPromoCodes(count: number, options?: GenerateOptions): GeneratedPromoCode[] {
  return Array.from({ length: count }, () => generateRandomPromoCode(options));
}
