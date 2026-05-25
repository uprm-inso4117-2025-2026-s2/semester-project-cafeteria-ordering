import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from './authContext';

export default function RootIndexRedirect() {
  const colorScheme = useColorScheme();
  const { loggedIn, isInitialized } = useAuth();

  if (!isInitialized) {
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

  return <Redirect href={loggedIn ? '/(tabs)' : '/login'} />;
}
