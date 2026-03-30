import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';

export default function RootIndexRedirect() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuthState() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (!isMounted) return;

      setIsAuthenticated(!error && !!session?.user);
      setIsLoading(false);
    }

    initializeAuthState();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colorScheme === 'dark' ? '#1C1C1C' : '#FAFAFA',
        }}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#FFCCBC' : '#2E7D32'} />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/menu' : '/signup'} />;
}
