import { Colors, Typography } from '@/constants/theme';
import { PerformanceDashboard } from '@/components/PerformanceDashboard';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function PerformanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={8}
          >
            <Text style={styles.backArrow}>‹ Settings</Text>
          </Pressable>

          <Image
            source={require('../../../documentation/branding/images/Light-Mode-Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.headerSpacer} />
        </View>

        <PerformanceDashboard />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.pastelSage,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mutedGray,
  },
  backButton: {
    minWidth: 90,
    paddingVertical: 4,
  },
  backArrow: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Typography.body.fontFamily,
    color: Colors.light.alternateText,
  },
  logo: {
    width: 44,
    height: 44,
  },
  headerSpacer: {
    minWidth: 90,
  },
});
