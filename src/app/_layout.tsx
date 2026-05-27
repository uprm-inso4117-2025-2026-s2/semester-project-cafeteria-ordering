import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

const StripeProvider = Platform.OS !== 'web'
  ? require('@stripe/stripe-react-native').StripeProvider
  : ({ children }: any) => children;

import OfflineBanner from '@/components/ui/offline-online-banner';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { metricsCollector } from '@/lib/performance/metricsCollector';
import { regressionDetector } from '@/lib/performance/regressionDetector';
import { useFonts } from 'expo-font';
import { ActivityIndicator, Text, View } from 'react-native';
import { AuthProvider, useAuth } from './authContext';

// Session logging helper
function logAuthGate(event: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[AuthGate][${timestamp}] ${event}`, data ? JSON.stringify(data) : '');
}

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { loggedIn, isInitialized, sessionChecked } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!isInitialized || !sessionChecked) {
      logAuthGate('Waiting for auth initialization', { isInitialized, sessionChecked });
      return;
    }

    if (isNavigating) {
      logAuthGate('Already navigating, skipping');
      return;
    }

    const first = segments[0];
    const inAuthScreens = first === 'login' || first === 'signup' || first === 'PasswordRecovery';
    const inProtectedGroup = first === '(tabs)' || first === 'staff';
    const inResetPassword = segments[1] === 'resetPassword';

    logAuthGate('Auth state check', {
      loggedIn,
      currentRoute: first,
      inAuthScreens,
      inProtectedGroup,
      inResetPassword,
      fullSegments: segments,
    });

    // Allow access to reset password page without being logged in
    if (inResetPassword) {
      logAuthGate('Allowing access to reset password page');
      return;
    }

    // Redirect logged-out users away from protected screens
    if (!loggedIn && inProtectedGroup) {
      logAuthGate('Redirecting unauthenticated user to login');
      setIsNavigating(true);
      router.replace('/login');
      setTimeout(() => setIsNavigating(false), 500);
      return;
    }

    // Redirect logged-in users away from auth screens
    if (loggedIn && inAuthScreens) {
      logAuthGate('Redirecting authenticated user to tabs');
      setIsNavigating(true);
      router.replace('/(tabs)');
      setTimeout(() => setIsNavigating(false), 500);
      return;
    }

    logAuthGate('Auth gate check passed, no redirect needed');
  }, [isInitialized, sessionChecked, loggedIn, router, segments, isNavigating]);

  // Return loading UI - moved to END of hooks
  if (!isInitialized || !sessionChecked) {
    return (
      <View style={{ 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: colorScheme === 'dark' ? '#1C1C1C' : '#FAFAFA' 
      }}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#FFCCBC' : '#2E7D32'} />
        <Text style={{ marginTop: 20, color: colorScheme === 'dark' ? '#FFFFFF' : '#424242' }}>
          Checking authentication...
        </Text>
      </View>
    );
  }

  return null;
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    Bitter: require('../assets/fonts/Bitter-VariableFont_wght.ttf'),
    Inter: require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
  });

  useEffect(() => {
    // Record app start time
    (global as any).__APP_START_TIME__ = Date.now();
    
    console.log('[Performance] Starting metrics collection...');
    
    // Set baseline after 30 seconds
    setTimeout(async () => {
      await regressionDetector.setBaseline('v1.0');
      
      const score = regressionDetector.getPerformanceScore();
      console.log(`[Performance] Initial score: ${score}/100`);
      
      metricsCollector.recordMetric({
        name: 'performance_score',
        value: score,
        unit: 'percent',
        timestamp: Date.now(),
        tags: { version: 'v1.0' }
      });
    }, 30000);

    regressionDetector.onRegression((metric, baseline, current, severity) => {
      const message = `⚠️ Performance Alert [${severity.toUpperCase()}]: ${metric} degraded from ${baseline.toFixed(2)} to ${current.toFixed(2)}`;
      console.error(message);
    });

    const checkMemory = setInterval(async () => {
      const systemMetrics = await metricsCollector.getCurrentSystemMetrics();
      if (systemMetrics && systemMetrics.memoryUsed / systemMetrics.totalMemory > 0.85) {
        console.warn('[Performance] High memory pressure detected!');
        metricsCollector.recordMetric({
          name: 'memory_pressure_warning',
          value: 1,
          unit: 'count',
          timestamp: Date.now(),
          tags: { 
            memory_used_mb: systemMetrics.memoryUsed / (1024 * 1024),
            total_memory_mb: systemMetrics.totalMemory / (1024 * 1024)
          }
        });
      }
    }, 60000);

    return () => {
      metricsCollector.stop();
      clearInterval(checkMemory);
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <StripeProvider publishableKey={
        process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      }>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGate />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login/index" options={{ headerShown: false }} />
          <Stack.Screen name="signup/index" options={{ headerShown: false }} />
          <Stack.Screen name="PasswordRecovery/index" options={{ headerShown: false }} />
          <Stack.Screen name="PasswordRecovery/resetPassword" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <OfflineBanner />
        <StatusBar style="auto" />
      </ThemeProvider>
      </StripeProvider>
    </AuthProvider>
  );
}
