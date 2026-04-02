//THIS IS A PLACEHOLDER (replace later)

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import PrimaryButton from '@/components/ui/primaryButton';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      setEmail(session?.user?.email ?? null);
      setIsLoading(false);
    }

    loadSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setAuthMessage('Session cleared.');
    } catch {
      setAuthMessage('Unable to clear session right now. Try again.');
    }
    router.replace('/login' as any);
  };

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

      {isLoading ? (
        <ActivityIndicator size="small" color={theme.text} />
      ) : email ? (
        <>
        <ThemedText type='body'>Email: {email}</ThemedText>
        </>
      ) : (
        <ThemedText type='body'>Please log in</ThemedText>
      )}

      <PrimaryButton
        title={email ? 'Log out' : 'Reset session and go to login'}
        onPress={handleSignOut}
      ></PrimaryButton>

      {authMessage && <ThemedText type='body'>{authMessage}</ThemedText>}
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
