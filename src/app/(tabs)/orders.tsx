//THIS IS A PLACEHOLDER (replace later)
// 
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function OrdersScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Orders</Text>
    <Text
    style={[
        styles.subtitle,
        {
        color: colorScheme === 'dark'
            ? Colors.dark.secondaryText
            : Colors.light.text,
        },
    ]}
    >
        View your active and past orders here.
    </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    ...Typography.heading,
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
});
