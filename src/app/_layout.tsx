import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import OfflineBanner from '@/components/ui/offline-online-banner';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { metricsCollector } from '@/lib/performance/metricsCollector';
import { regressionDetector } from '@/lib/performance/regressionDetector';
import { useFonts } from 'expo-font';
import { AuthProvider, useAuth } from './authContext';
import { View, ActivityIndicator, Text } from 'react-native';

// Session logging helper
function logAuthGate(event: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[AuthGate][${timestamp}] ${event}`, data ? JSON.stringify(data) : '');
}

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isInitialized, sessionChecked, guestUpgradeState } = useAuth();
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
    
    // Check if this is a profile-related screen
    const isProfileScreen = first === '(tabs)' && (segments[1] === 'profile' || segments[1] === 'edit-profile' || segments[1] === 'profile-order-history');
    const isOrderFlow = first === '(tabs)' && (segments[1] === 'index' || segments[1] === 'orders' || segments[1] === 'payment' || !segments[1] || segments[1] === 'menu');

    logAuthGate('Auth state check', {
      hasUser: !!user,
      isGuest: guestUpgradeState.isGuest,
      currentRoute: first,
      segment1: segments[1],
      isProfileScreen,
      isOrderFlow,
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

    // Handle guest users
    if (guestUpgradeState.isGuest && !user) {
      // Profile screens require upgrade (login/signup)
      if (isProfileScreen) {
        logAuthGate('Guest user trying to access profile - requiring upgrade');
        setIsNavigating(true);
        const preservedRoute = encodeURIComponent(segments.join('/'));
        router.replace(`/login?upgrade=guest&returnTo=${preservedRoute}`);
        setTimeout(() => setIsNavigating(false), 500);
        return;
      }
      
      // Ordering flow is allowed for guests
      if (isOrderFlow) {
        logAuthGate('Guest user allowed to access ordering flow');
        return;
      }
    }

    // If user is NOT logged in and trying to access protected routes (and not a guest)
    if (!user && !guestUpgradeState.isGuest && inProtectedGroup) {
      logAuthGate('No user and not a guest - redirecting to login');
      setIsNavigating(true);
      router.replace('/login' as any);
      setTimeout(() => setIsNavigating(false), 500);
      return;
    }

    // If user IS logged in and trying to access auth screens
    if (user && inAuthScreens) {
      logAuthGate('User is logged in - redirecting to tabs');
      setIsNavigating(true);
      router.replace('/(tabs)');
      setTimeout(() => setIsNavigating(false), 500);
      return;
    }

    logAuthGate('Auth gate check passed, no redirect needed');
  }, [isInitialized, sessionChecked, user, guestUpgradeState.isGuest, router, segments, isNavigating]);

  // Return loading UI
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
    </AuthProvider>
  );
}
