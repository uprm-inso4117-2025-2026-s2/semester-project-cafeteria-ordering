import { Colors, Typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type SettingsItem = {
  label: string;
  description: string;
  route: string;
};

const SETTINGS_ITEMS: SettingsItem[] = [
  {
    label: 'Performance',
    description: 'View staff performance metrics and reports.',
    route: '/staff/Performance',
  },
  {
    label: 'Payments',
    description: 'View and manage customer payments.',
    route: '/staff/Payments',
  },
  {
    label: 'Special Status Requests',
    description: 'Review and approve or deny special customer requests.',
    route: '/staff/Special_Status_Request',
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Image
          source={require('../../../../documentation/branding/images/Light-Mode-Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>MANAGEMENT</Text>

        <View style={styles.listContainer}>
          {SETTINGS_ITEMS.map((item, index) => (
            <Pressable
              key={item.route}
              style={({ pressed }) => [
                styles.listItem,
                index < SETTINGS_ITEMS.length - 1 && styles.listItemBorder,
                pressed && styles.listItemPressed,
              ]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.listItemContent}>
                <Text style={styles.listItemLabel}>{item.label}</Text>
                <Text style={styles.listItemDescription}>{item.description}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.logoutSection}>
          <Pressable
            style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: Colors.pastelSage,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mutedGray,
    position: 'relative',
  },
  logo: {
    width: 44,
    height: 44,
    zIndex: 1,
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: Typography.heading.fontFamily,
    color: Colors.light.alternateText,
  },
  scrollContent: {
    paddingTop: 28,
    paddingHorizontal: 18,
    paddingBottom: 48,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Typography.subheading.fontFamily,
    color: Colors.mutedGray,
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.mutedGray,
    overflow: 'hidden',
    marginBottom: 32,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.mutedGray,
  },
  listItemPressed: {
    backgroundColor: Colors.pastelSage,
  },
  listItemContent: {
    flex: 1,
  },
  listItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Typography.subheading.fontFamily,
    color: Colors.light.text,
    marginBottom: 2,
  },
  listItemDescription: {
    fontSize: 13,
    fontFamily: Typography.body.fontFamily,
    color: Colors.mutedGray,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 22,
    color: Colors.mutedGray,
    marginLeft: 8,
  },
  logoutSection: {
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutButtonPressed: {
    backgroundColor: '#FFCDD2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Typography.subheading.fontFamily,
    color: '#C62828',
  },
});
