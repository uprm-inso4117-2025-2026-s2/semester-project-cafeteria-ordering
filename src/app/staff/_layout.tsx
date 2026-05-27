import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  useOrderNotifications();

  return (
    <Tabs
      initialRouteName="(staff)/ViewOrders"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>

      <Tabs.Screen
        name="(staff)/ViewOrders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />

      <Tabs.Screen
        name="(staff)/Dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="(staff)/menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="fork.knife" color={color} />,
        }}
      />

      <Tabs.Screen
        name="(staff)/Settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />

      {/* Hidden from tab bar — accessible via Settings */}
      <Tabs.Screen name="ViewOrders" options={{ href: null }} />
      <Tabs.Screen name="ViewOrdersMock" options={{ href: null }} />
      <Tabs.Screen name="Performance" options={{ href: null }} />
      <Tabs.Screen name="(staff)/Payments" options={{ href: null }} />
      <Tabs.Screen name="(staff)/Special_Status_Request" options={{ href: null }} />

    </Tabs>
  );
}
