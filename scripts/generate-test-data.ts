// scripts/generate-test-data.ts
import {
  generateRandomUser,
  generateRandomMenuItem,
  generateRandomOrder,
  generateManyUsers,
  generateManyMenuItems,
  generateManyOrders,
  generateTestDataset
} from '../src/lib/test-generators/index';  // ← Added /index.ts

import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🧪 Starting Test Data Generation (Local Only - No Database)\n');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const isBatch = args.includes('--batch');
  const isEdge = args.includes('--edge');
  const batchSize = parseInt(args.find(arg => !arg.startsWith('--')) || '10');
  
  if (isEdge) {
    console.log('⚠️ Generating Edge Cases Only:\n');
    
    const edgeUsers = generateManyUsers(5, { includeEdgeCases: true });
    const edgeItems = generateManyMenuItems(5, { includeEdgeCases: true });
    const edgeOrders = generateManyOrders(5, { includeEdgeCases: true });
    
    console.log(`✅ Generated ${edgeUsers.length} edge users`);
    console.log(`✅ Generated ${edgeItems.length} edge menu items`);
    console.log(`✅ Generated ${edgeOrders.length} edge orders`);
    
    const output = {
      generatedAt: new Date().toISOString(),
      type: 'edge-cases',
      users: edgeUsers,
      menuItems: edgeItems,
      orders: edgeOrders
    };
    
    fs.writeFileSync(
      path.join(process.cwd(), 'test-data-edge-cases.json'),
      JSON.stringify(output, null, 2)
    );
    console.log('\n💾 Edge cases saved to test-data-edge-cases.json');
    
  } else if (isBatch) {
    console.log(`📊 Generating Batch Data: ${batchSize} items each\n`);
    
    const startTime = Date.now();
    
    const users = generateManyUsers(batchSize);
    const menuItems = generateManyMenuItems(batchSize);
    const orders = generateManyOrders(Math.floor(batchSize / 2));
    
    const endTime = Date.now();
    
    console.log(`✅ Generated ${users.length} users`);
    console.log(`✅ Generated ${menuItems.length} menu items`);
    console.log(`✅ Generated ${orders.length} orders`);
    console.log(`⏱️  Time taken: ${endTime - startTime}ms`);
    
    const output = {
      generatedAt: new Date().toISOString(),
      type: 'batch',
      count: { users: users.length, menuItems: menuItems.length, orders: orders.length },
      users,
      menuItems,
      orders
    };
    
    fs.writeFileSync(
      path.join(process.cwd(), 'test-data-batch.json'),
      JSON.stringify(output, null, 2)
    );
    console.log('\n💾 Batch data saved to test-data-batch.json');
    
  } else {
    console.log('📝 Generating Sample Data (5 items each):\n');
    
    console.log('--- Single Examples ---');
    const singleUser = generateRandomUser();
    console.log('User:', JSON.stringify(singleUser, null, 2));
    
    const singleMenuItem = generateRandomMenuItem();
    console.log('\nMenu Item:', JSON.stringify(singleMenuItem, null, 2));
    
    const singleOrder = generateRandomOrder();
    console.log('\nOrder:', JSON.stringify(singleOrder, null, 2));
    
    console.log('\n--- Small Batches (5 each) ---');
    const users = generateManyUsers(5);
    const menuItems = generateManyMenuItems(5);
    const orders = generateManyOrders(5);
    
    console.log(`✅ Generated ${users.length} users`);
    console.log(`✅ Generated ${menuItems.length} menu items`);
    console.log(`✅ Generated ${orders.length} orders`);
    
    const output = {
      generatedAt: new Date().toISOString(),
      type: 'sample',
      examples: { user: singleUser, menuItem: singleMenuItem, order: singleOrder },
      batches: { users, menuItems, orders }
    };
    
    fs.writeFileSync(
      path.join(process.cwd(), 'test-data-sample.json'),
      JSON.stringify(output, null, 2)
    );
    console.log('\n💾 Sample data saved to test-data-sample.json');
  }
  
  console.log('\n✨ Done! No database writes were performed - all data is local.');
}

main().catch(console.error);
