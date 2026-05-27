import { Redirect } from 'expo-router';
import { ActivityIndicator, View, Text } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from './authContext';

export default function RootIndexRedirect() {
  const colorScheme = useColorScheme();
  const { loggedIn, isInitialized, sessionChecked } = useAuth();

  // Show loading state while checking session
  if (!isInitialized || !sessionChecked) {
    console.log('[Session] Waiting for session initialization...');
    return (
      <View style={{ 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: colorScheme === 'dark' ? '#1C1C1C' : '#FAFAFA' 
      }}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#FFCCBC' : '#2E7D32'} />
        <Text style={{ marginTop: 20, color: colorScheme === 'dark' ? '#FFFFFF' : '#424242' }}>
          Restoring session...
        </Text>
      </View>
    );
  }

  console.log(`[Session] Redirecting based on auth state: loggedIn=${loggedIn}`);
  return <Redirect href={loggedIn ? '/(tabs)' : '/login'} />;
}
