// src/lib/test-generators/__tests__/generators.test.ts
import {
  generateRandomUser,
  generateRandomMenuItem,
  generateRandomOrder,
  generateManyUsers,
  generateManyMenuItems,
  generateManyOrders
} from '../index';

describe('Test Generators', () => {
  
  describe('User Generator', () => {
    test('should generate a valid user', () => {
      const user = generateRandomUser();
      
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('fullName');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('phone');
      expect(user).toHaveProperty('role');
      expect(user.fullName.length).toBeGreaterThan(0);
      expect(user.email).toContain('@');
    });
    
    test('should generate edge cases when requested', () => {
      const user = generateRandomUser({ includeEdgeCases: true });
      expect(user).toBeDefined();
    });
    
    test('should generate invalid data when requested', () => {
      const user = generateRandomUser({ includeInvalid: true });
      expect(user).toBeDefined();
    });
    
    test('should generate multiple users', () => {
      const users = generateManyUsers(10);
      expect(users).toHaveLength(10);
      users.forEach(user => {
        expect(user.email).toContain('@');
      });
    });
  });
  
  describe('Menu Item Generator', () => {
    test('should generate a valid menu item', () => {
      const item = generateRandomMenuItem();
      
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('basePrice');
      expect(item).toHaveProperty('available');
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.basePrice).toBeGreaterThan(0);
    });
    
    test('should generate edge cases', () => {
      const item = generateRandomMenuItem({ includeEdgeCases: true });
      expect(item).toBeDefined();
    });
    
    test('should generate multiple menu items', () => {
      const items = generateManyMenuItems(20);
      expect(items).toHaveLength(20);
    });
  });
  
  describe('Order Generator', () => {
    test('should generate a valid order', () => {
      const order = generateRandomOrder();
      
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('userId');
      expect(order).toHaveProperty('items');
      expect(order).toHaveProperty('total');
      expect(Array.isArray(order.items)).toBe(true);
    });
    
    test('order total should match sum of items', () => {
      const order = generateRandomOrder();
      const calculatedTotal = order.items.reduce(
        (sum, item) => sum + (item.unitPrice * item.quantity),
        0
      );
      expect(calculatedTotal).toBe(order.total);
    });
    
    test('should generate multiple orders', () => {
      const orders = generateManyOrders(5);
      expect(orders).toHaveLength(5);
    });
  });
  
  describe('Performance', () => {
    test('should generate 100 users quickly (< 1 second)', () => {
      const start = Date.now();
      generateManyUsers(100);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });
    
    test('should generate 100 menu items quickly (< 1 second)', () => {
      const start = Date.now();
      generateManyMenuItems(100);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });
  });
});
