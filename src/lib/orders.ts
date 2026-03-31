import { MenuItem } from '@/models/food-item-class'
import * as Notifications from 'expo-notifications'
import { supabase } from './supabase'

export type OrderStatus =
  | 'Pending'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Completed'

export interface Order {
  student_id: string
  items: any
  total: number
}

// Create Order
export async function createOrder(order: Order) {
  const { data, error } = await supabase.from('orders').insert({student_id: order.student_id, items: order.items, total: order.total, status: 'Pending',})

  if (error) {
    console.error('Error when creating order:', error.message)
    return null
  }

  await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Order Confirmed',
    body: 'Your order has been successfully placed.',
  },
  trigger: null,
})

  return data
}

// Update Order Status
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
) {
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', orderId)

  if (error) {
    console.error('Error when updating order:', error.message)
    return null
  }

  if (status === 'Ready for Pickup') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Order is Ready!',
        body: 'Your order is ready for pickup.',
      },
      trigger: null,
    })
  }

  return data
}


export function subscribeToOrders(callback: (payload: any) => void) {
  const channel = supabase.channel('orders-channel')

  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'orders',
    },
    (payload) => {
      callback(payload)
    }
  )

  channel.subscribe()

  return channel
}

//check if cart isint empty and returns order id
export async function submitOrder(
  cartItems: MenuItem[],
  userId: string,
  notes?: string
): Promise<string | null> {
  if (!cartItems || cartItems.length === 0) {
    console.error('Cannot submit an empty order.')
    return null
  }
 
  // Calculate total from cart items
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.getTotalPrice(),
    0
  )
 
  // Insert into orders table
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total_amount: totalAmount,
      order_status: 'Pending',
      notes: notes ?? null,
    })
    .select('order_id')
    .single()
 
  if (orderError || !orderData) {
    console.error('Error creating order:', orderError?.message)
    return null
  }
 
  const orderId: string = orderData.order_id
 
  // Build order_items rows from cart
  const orderItems = cartItems.map((item) => ({
    order_id: orderId,
    menu_item_id: item.getId(),
    quantity: 1,
    unit_price: item.getTotalPrice(),
    special_instructions: null,
  }))
 
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
 
  if (itemsError) {
    console.error('Error inserting order items:', itemsError.message)
    return null
  }
 
  // Notify the customer that the order was placed
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Order Confirmed',
      body: `Your order has been placed! Confirmation ID: ${orderId}`,
    },
    trigger: null,
  })
 
  return orderId
}
 
//Retrieves the unique order ID for a placed order from the database.

export async function getOrderID(orderId: string): Promise<string | null> {
  if (!orderId) {
    console.error('No order ID provided.')
    return null
  }
 
  const { data, error } = await supabase
    .from('orders')
    .select('order_id')
    .eq('order_id', orderId)
    .single()
 
  if (error || !data) {
    console.error('Error retrieving order ID:', error?.message)
    return null
  }
 
  return data.order_id
}