import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { MenuItem } from './food-item-class';
import { OrderManager } from './order-class';
dotenv.config();

const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

const TEST_USER_ID = 'c8d6e790-503c-4a31-84ce-7f4b1b1fc05e';


async function runTest() {
    console.log('\n==============================================');
    console.log('       ORDER CLASS — SUPABASE TEST');
    console.log('==============================================\n');

    const { data: row, error: fetchError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .limit(1)
        .single();

    if (fetchError || !row) {
        console.error('Setup Error: Could not fetch a menu item from Supabase.');
        return;
    }






    console.log('\n==============================================');
    console.log('                 LOCAL TEST');
    console.log('==============================================\n');




    console.log(`Fetched menu item: "${row.name}" — $${row.price}`);




   
    const menuItem = new MenuItem(
        row.id,
        row.category_id,
        row.name,
        [],
        parseFloat(row.price),
        row.image_url ?? '',
        row.available,
        row.allergens ?? [],
        row.prep_time_minutes ?? 0,
        row.created_at,
        row.updated_at
    );




    // =====================================================
    // LOCAL TEST (NO DATABASE)
    // =====================================================

    console.log('\nTesting removeFoodItemFromOrder...');
    const manager2 = new OrderManager();
    manager2.addFoodItemToOrder(menuItem, []);
    manager2.addFoodItemToOrder(menuItem, []);
    console.log(`Items before remove: ${manager2.getOrderDraft()?.quantity}`);
    manager2.removeFoodItemFromOrder(menuItem);
    console.log(`Items after remove: ${manager2.getOrderDraft()?.quantity}`);

   





    console.log('\nTesting clearOrderList...');
    const manager3 = new OrderManager();
    manager3.addFoodItemToOrder(menuItem, []);
    manager3.addFoodItemToOrder(menuItem, []);
    manager3.clearOrderList();
    if (manager3.getOrderDraft() === null) {
        console.log('clearOrderList: Passed — order is empty after clear');
    } else {
        console.log('clearOrderList: Failed — order should be empty');
    }

    





    console.log('\nTesting setCustomerNote...');
    const manager4 = new OrderManager();
    manager4.addFoodItemToOrder(menuItem, []);
    manager4.setCustomerNote('Extra napkins please');
    const draftWithNote = manager4.getOrderDraft();
    if (draftWithNote?.customer_note === 'Extra napkins please') {
        console.log('setCustomerNote: Passed — note saved correctly');
    } else {
        console.log('setCustomerNote: Failed — note not saved');
    }







    console.log('\nTesting calculateTotal...');
    const manager5 = new OrderManager();
    manager5.addFoodItemToOrder(menuItem, []);
    manager5.addFoodItemToOrder(menuItem, []);
    const expectedTotal = menuItem.getBasePrice() * 2;
    const actualTotal = manager5.calculateTotal();
    if (Math.abs(actualTotal - expectedTotal) < 0.001) {
        console.log(`calculateTotal: Passed — $${actualTotal.toFixed(2)}`);
    } else {
        console.log(`calculateTotal: Failed — expected $${expectedTotal}, got $${actualTotal}`);
    }







    console.log('\nTesting getPickupCode...');
    const manager6 = new OrderManager();
    manager6.addFoodItemToOrder(menuItem, []);
    const confirmed2 = manager6.submitOrder(1, 'Test User');
    if (confirmed2.pickup_code.length === 4 && /^\d{4}$/.test(confirmed2.pickup_code)) {
        console.log(`getPickupCode: Passed — code is ${confirmed2.pickup_code}`);
    } else {
        console.log('getPickupCode: Failed — code should be 4 digits');
    }








    console.log('\nTesting submitOrder fields...');
    const manager7 = new OrderManager();
    manager7.addFoodItemToOrder(menuItem, []);
    manager7.setCustomerNote('Test note');
    const confirmed3 = manager7.submitOrder(1, 'Carlos');
    const checks = [
        { field: 'status', pass: confirmed3.status === 'confirmed' },
        { field: 'customer_name', pass: confirmed3.customer_name === 'Carlos' },
        { field: 'customer_note', pass: confirmed3.customer_note === 'Test note' },
        { field: 'orderId', pass: typeof confirmed3.order_id === 'number' },
        { field: 'placed_at', pass: confirmed3.placed_at instanceof Date },
        { field: 'pickup_code', pass: confirmed3.pickup_code.length === 4 },
        { field: 'total_amount', pass: confirmed3.total_amount === menuItem.getBasePrice() },
    ];
    checks.forEach(c => {
        console.log(`  ${c.pass ? 'Passed' : 'Failed'} — ${c.field}`);
    });












    // =====================================================
    // SUPABASE TEST (DATABASE)
    // =====================================================




    console.log('\n==============================================');
    console.log('                 DATABASE TEST');
    console.log('==============================================\n');


    console.log('\nInserting order into database...');
    const manager = new OrderManager();
    manager.addFoodItemToOrder(menuItem, []);
    manager.setCustomerNote('Supabase integration test');
    const draft = manager.getOrderDraft();



    if (!draft) {
        console.error('getOrderDraft() returned null.');
        return;
    }



    const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: TEST_USER_ID,
            total_amount: draft.total_amount,
            status: 'placed',
            notes: 'Supabase integration test',
        })
        .select('order_id')
        .single();

    if (orderError || !orderData) {
        console.error('Error inserting order:', orderError?.message);
        return;
    }


    const orderId = orderData.order_id;
    console.log('----------------------------------------------');
    console.log('Order inserted successfully');
    console.log(`CONFIRMATION ID: ${orderId}`);
    console.log('----------------------------------------------');

    
    const orderItems = draft.items.map(item => ({
        order_id: orderId,
        menu_item_id: item.menuItem.getId(),
        quantity: 1,
        unit_price: item.menuItem.getBasePrice(),
        special_instructions: null,
    }));



    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

    if (itemsError) {
        console.error('Error inserting order items:', itemsError.message);
        return;
    }



    console.log('Order items inserted successfully');



    const { data: verified } = await supabase
        .from('orders')
        .select('order_id')
        .eq('order_id', orderId)
        .single();

    if (verified) console.log('SUCCESS — Order verified in database');


    console.log('==============================================\n');
}

runTest();