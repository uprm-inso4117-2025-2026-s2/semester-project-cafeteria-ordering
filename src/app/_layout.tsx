import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import OfflineBanner from '@/components/ui/offline-online-banner';
import { useFonts } from 'expo-font';
import { AuthProvider } from './authContext';
import { metricsCollector } from '@/lib/performance/metricsCollector';
import { regressionDetector } from '@/lib/performance/regressionDetector';

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
    
    // Start monitoring
    console.log('[Performance] Starting metrics collection...');
    
    // Set baseline after 30 seconds
    setTimeout(async () => {
      await regressionDetector.setBaseline('v1.0');
      
      // Log initial performance score
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

    // Set up regression alerting
    regressionDetector.onRegression((metric, baseline, current, severity) => {
      const message = `⚠️ Performance Alert [${severity.toUpperCase()}]: ${metric} degraded from ${baseline.toFixed(2)} to ${current.toFixed(2)}`;
      console.error(message);
      
      // Could also show in-app notification here
    });

    // Monitor memory pressure
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
    }, 60000); // Check every minute

    return () => {
      metricsCollector.stop();
      clearInterval(checkMemory);
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="PasswordRecovery" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <OfflineBanner />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
