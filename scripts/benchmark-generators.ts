// scripts/benchmark-generators.ts
import {
  generateRandomUser,
  generateRandomMenuItem,
  generateRandomOrder,
  generateManyUsers,
  generateManyMenuItems,
  generateManyOrders
} from '../src/lib/test-generators';

async function benchmark() {
  console.log('🚀 Running Performance Benchmarks (Local Only)\n');
  
  const args = process.argv.slice(2);
  const isVerbose = args.includes('--verbose');
  const iterations = 1000;
  
  console.log(`Generating ${iterations} items each...\n`);
  
  // Benchmark single generation
  console.log('📈 Single Generation Speed:');
  console.log('--------------------------');
  
  // Users
  let start = Date.now();
  const users_sample = [];
  for (let i = 0; i < iterations; i++) {
    users_sample.push(generateRandomUser());
  }
  let userTime = Date.now() - start;
  console.log(`✅ Users: ${userTime}ms (${(userTime/iterations).toFixed(3)}ms avg) - ${(iterations / (userTime/1000)).toFixed(0)} users/sec`);
  
  // Menu Items
  start = Date.now();
  const items_sample = [];
  for (let i = 0; i < iterations; i++) {
    items_sample.push(generateRandomMenuItem());
  }
  let menuTime = Date.now() - start;
  console.log(`✅ Menu Items: ${menuTime}ms (${(menuTime/iterations).toFixed(3)}ms avg) - ${(iterations / (menuTime/1000)).toFixed(0)} items/sec`);
  
  // Orders (more complex)
  start = Date.now();
  const orders_sample = [];
  for (let i = 0; i < iterations; i++) {
    orders_sample.push(generateRandomOrder());
  }
  let orderTime = Date.now() - start;
  console.log(`✅ Orders: ${orderTime}ms (${(orderTime/iterations).toFixed(3)}ms avg) - ${(iterations / (orderTime/1000)).toFixed(0)} orders/sec`);
  
  // Batch generation comparison
  console.log('\n📊 Batch Generation Performance:');
  console.log('--------------------------------');
  
  start = Date.now();
  const users1000 = generateManyUsers(1000);
  let batchTime = Date.now() - start;
  console.log(`✅ 1000 users (batch): ${batchTime}ms (${batchTime/1000}ms per user avg)`);
  
  start = Date.now();
  const items1000 = generateManyMenuItems(1000);
  batchTime = Date.now() - start;
  console.log(`✅ 1000 menu items (batch): ${batchTime}ms (${batchTime/1000}ms per item avg)`);
  
  start = Date.now();
  const orders500 = generateManyOrders(500);
  batchTime = Date.now() - start;
  console.log(`✅ 500 orders (batch): ${batchTime}ms (${batchTime/500}ms per order avg)`);
  
  // Memory usage
  console.log('\n💾 Memory Usage:');
  console.log('----------------');
  const dataSize = JSON.stringify(users1000).length;
  console.log(`1000 users: ~${(dataSize / 1024).toFixed(2)} KB`);
  console.log(`1000 items: ~${(JSON.stringify(items1000).length / 1024).toFixed(2)} KB`);
  console.log(`500 orders: ~${(JSON.stringify(orders500).length / 1024 / 1024).toFixed(2)} MB`);
  
  if (isVerbose) {
    console.log('\n🔍 Sample Data (Verbose Mode):');
    console.log('-----------------------------');
    console.log('First User:', JSON.stringify(users1000[0], null, 2));
    console.log('\nFirst Menu Item:', JSON.stringify(items1000[0], null, 2));
    console.log('\nFirst Order:', JSON.stringify(orders500[0], null, 2));
  }
  
  console.log('\n✨ All data is local - no database writes performed!');
}

benchmark().catch(console.error);
