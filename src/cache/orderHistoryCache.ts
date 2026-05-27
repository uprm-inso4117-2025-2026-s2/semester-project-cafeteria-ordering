import AsyncStorage from '@react-native-async-storage/async-storage'
import { getOrdersByUserId, OrderHistoryItem } from '../lib/orders'
import { CACHE_KEYS } from './cacheKeys'

export async function getCachedOrderHistory(userId: string): Promise<OrderHistoryItem[]> {
  try {
    const fresh = await getOrdersByUserId(userId)
    await AsyncStorage.setItem(CACHE_KEYS.ORDER_HISTORY, JSON.stringify(fresh))
    return fresh
  } catch {
    // offline — fall back to cache
    const cached = await AsyncStorage.getItem(CACHE_KEYS.ORDER_HISTORY)
    if (cached) return JSON.parse(cached)
  }
  return []
}