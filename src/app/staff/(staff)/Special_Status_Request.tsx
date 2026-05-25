import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function SpecialStatusRequestScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={8}
        >
          <Text style={styles.backArrow}>‹ Settings</Text>
        </Pressable>

        <Image
          source={require('../../../../documentation/branding/images/Light-Mode-Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Special Status Requests</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>
          Review special status requests from customers and approve or deny them as needed.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    ...Typography.heading,
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
});
