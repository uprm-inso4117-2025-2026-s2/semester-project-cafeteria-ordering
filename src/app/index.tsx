import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';

export default function RootIndexRedirect() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
        setIsStaff(profile?.role === 'staff');
      }
      setIsLoading(false);
    }
    init();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colorScheme === 'dark' ? '#1C1C1C' : '#FAFAFA' }}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#FFCCBC' : '#2E7D32'} />
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/signup" />;
  if (isStaff) return <Redirect href="/staff/ViewOrders" />;
  return <Redirect href="/(tabs)" />;
}
