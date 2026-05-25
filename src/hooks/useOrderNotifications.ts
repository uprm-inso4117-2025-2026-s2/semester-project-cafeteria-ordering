import { supabase } from "@/lib/supabase";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useOrderNotifications() {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let active = true;

    async function setup() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      // Only staff members receive new-order push notifications
      if (profile?.role !== 'staff') return;

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      channelRef.current = supabase
        .channel("staff-order-notifications")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "orders" },
          async (payload) => {
            if (!active) return;
            const orderId = payload.new?.order_id ?? payload.new?.id ?? "unknown";
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "New order received",
                body: `Order #${orderId} is waiting.`,
              },
              trigger: null,
            });
          },
        )
        .subscribe();
    }

    setup();

    return () => {
      active = false;
      channelRef.current?.unsubscribe();
    };
  }, []);
}
