//THIS IS A PLACEHOLDER (replace later)
// 

import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function CartScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Ionicons
        name="cart-outline"
        size={60}
        color={isDark ? Colors.dark.text : Colors.light.alternateText}
        style={styles.icon}
      />

      <Text style={[styles.title, { color: theme.text }]}>
        Your Cart
      </Text>

      <Text
        style={[
          styles.message,
          {
            color: isDark
              ? Colors.dark.secondaryText
              : Colors.light.text,
          },
        ]}
      >
        Selected items will appear here before checkout.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    ...Typography.heading,
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 10,
  },
  message: {
    ...Typography.body,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});