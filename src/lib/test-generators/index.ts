// src/lib/test-generators/index.ts
export * from './types';
export {
  generateRandomUser,
  generateManyUsers
} from './user-generator';

export {
  generateRandomMenuItem,
  generateManyMenuItems
} from './menu-generator';

export {
  generateRandomOrder,
  generateManyOrders
} from './order-generator';

export {
  generateRandomPayment,
  generateManyPayments
} from './payment-generator';

export {
  generateRandomPromoCode,
  generateManyPromoCodes
} from './promo-generator';

export function generateTestDataset(options: {
  users?: number;
  menuItems?: number;
  orders?: number;
  includeEdgeCases?: boolean;
  includeInvalid?: boolean;
}) {
  const dataset = {
    users: options.users ? generateManyUsers(options.users, {
      includeEdgeCases: options.includeEdgeCases,
      includeInvalid: options.includeInvalid
    }) : [],
    
    menuItems: options.menuItems ? generateManyMenuItems(options.menuItems, {
      includeEdgeCases: options.includeEdgeCases,
      includeInvalid: options.includeInvalid
    }) : [],
    
    orders: options.orders ? generateManyOrders(options.orders, {
      includeEdgeCases: options.includeEdgeCases,
      includeInvalid: options.includeInvalid
    }) : [],
    
    metadata: {
      generatedAt: new Date(),
      includeEdgeCases: options.includeEdgeCases,
      includeInvalid: options.includeInvalid
    }
  };
  
  return dataset;
}
