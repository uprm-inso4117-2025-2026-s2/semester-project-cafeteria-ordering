// app/staff/Performance.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import BaseDrawer from '@/components/StaffNavDrawer';
import { PerformanceDashboard } from '@/components/PerformanceDashboard';
import { Colors } from '@/constants/theme';

export default function PerformanceScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BaseDrawer>
        <View style={styles.container}>
          <PerformanceDashboard />
        </View>
      </BaseDrawer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});
