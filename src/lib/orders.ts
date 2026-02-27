import { supabase } from './supabase'
import * as Notifications from 'expo-notifications'

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