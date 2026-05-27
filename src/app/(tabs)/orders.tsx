import { getCachedOrderHistory } from '@/cache/orderHistoryCache'
import { OrderHistoryItem } from '@/lib/orders'
import { Colors, Typography } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { supabase } from '@/lib/supabase'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native'

export default function OrdersScreen() {
  const colorScheme = useColorScheme() ?? 'light'
  const theme = Colors[colorScheme]
  const [orders, setOrders] = useState<OrderHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      async function loadOrders() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }
        const result = await getCachedOrderHistory(user.id)
        setOrders(result)
        setLoading(false)
      }
      loadOrders()
    }, [])
  )

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.tint} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text, ...Typography.heading }]}>
        Orders
      </Text>
      {orders.length === 0 ? (
        <Text style={[styles.subtitle, { color: theme.text, ...Typography.body }]}>
          No orders yet.
        </Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.order_id}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderColor: Colors.softGray }]}>
              <Text style={[styles.orderId, { color: theme.text, ...Typography.body }]}>
                Order #{item.order_id.slice(0, 8)}
              </Text>
              <Text style={[{ color: Colors.mutedGray, ...Typography.body }]}>
                {item.order_status} · ${item.total_amount.toFixed(2)}
              </Text>
              <Text style={[{ color: Colors.mutedGray, ...Typography.body, fontSize: 12 }]}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  title: { fontSize: 28, marginBottom: 16 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderId: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
})