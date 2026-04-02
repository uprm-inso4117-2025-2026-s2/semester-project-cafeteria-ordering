//THIS IS A PLACEHOLDER (replace later)

import { StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import PrimaryButton from '@/components/ui/primaryButton';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '../authContext';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { user, loggedIn, logout } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
      <Text
        style={[
          styles.subtitle,
          {
            color:
              colorScheme === 'dark'
                ? Colors.dark.secondaryText
                : Colors.light.text,
          },
        ]}
      >
        Manage your account details here.
      </Text>
      {loggedIn ? (
        <>
        <ThemedText type='body'>Name: {user?.fullName}</ThemedText>
        <ThemedText type='body'>Email: {user?.email}</ThemedText>
        <PrimaryButton title='Log out' onPress={logout}></PrimaryButton>
        </>
      ) : (
        <ThemedText type='body'>Please log in</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
