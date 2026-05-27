// Run with: npx tsx src/tests/ordering/scripts/IT-ORD-05-Place_and_Confirm_Order.ts

import * as dotenv from 'dotenv'
dotenv.config()

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)

async function submitOrderLogic(userId: string, cartItems: any[], total: number) {
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total_amount: total,
      status: 'placed',
      notes: 'Integration Test — Place Order & Order Confirmation',
      pickup_code: Math.floor(1000 + Math.random() * 9000).toString()
    })
    .select('id')
    .single()

  if (orderError) throw orderError
  const orderId = orderData.id

  const itemsToInsert = cartItems.map(item => ({
    order_id: orderId,
    menu_item_id: item.id,
    quantity: 1,
    unit_price: item.price
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert)
  if (itemsError) throw itemsError

  return orderId
}

async function getOrderIDLogic(id: string) {
  const { data } = await supabase
    .from('orders')
    .select('id')
    .eq('id', id)
    .single()
  return data?.id
}

async function runShowcase() {
  console.log('\n==============================================')
  console.log('  Integration Test: Place Order & Order Confirmation')
  console.log('  src/tests/ordering/scripts/IT-ORD-05-Place_and_Confirm_Order.ts')
  console.log('==============================================')

  const LUIS_ID = '99295f81-7beb-4975-97ac-1d3990812243'
  const { data: item } = await supabase.from('menu_items').select('*').limit(1).single()

  if (!item) return console.error('Setup Error: No menu items found.')

  try {
    console.log(`\nPlacing order for: ${item.name}...`)

    const cart = [{ id: item.id, price: parseFloat(item.price) }]
    const newId = await submitOrderLogic(LUIS_ID, cart, parseFloat(item.price))

    console.log('----------------------------------------------')
    console.log('✅ Order placed successfully')
    console.log(`   CONFIRMATION ID: ${newId}`)
    console.log('----------------------------------------------')

    console.log('\nVerifying order ID retrieval...')
    const verifiedId = await getOrderIDLogic(newId)

    if (verifiedId === newId) {
      console.log('✅ Order ID verified — confirmation matches placed order')
      console.log('==============================================\n')
    } else {
      console.error('❌ Order ID mismatch — confirmation does not match')
    }
  } catch (err: any) {
    console.error('\n❌ ERROR:', err.message)
  }
}

runShowcase()
