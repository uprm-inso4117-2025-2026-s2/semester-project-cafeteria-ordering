import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography } from '@/constants/theme';
import { deleteMenuItem, fetchAllMenuItems, fetchMenuCategories, MenuCategory, MenuItemData } from '@/lib/menu';
import NewMenuItemModal from '@/components/NewMenuItemModal';
import StaffMenuItemRow from '@/components/StaffMenuItemRow';

type Section = {
  title: string;
  data: MenuItemData[];
};

export default function StaffMenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [sections, setSections] = useState<Section[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewItemModal, setShowNewItemModal] = useState(false);

  const buildSections = useCallback(
    (cats: MenuCategory[], its: MenuItemData[]): Section[] =>
      cats
        .map((cat) => ({
          title: cat.name,
          data: its.filter((item) => item.category_id === cat.id),
        }))
        .filter((s) => s.data.length > 0),
    []
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [cats, its] = await Promise.all([fetchMenuCategories(), fetchAllMenuItems()]);
      setCategories(cats);
      setItems(its);
      setSections(buildSections(cats, its));
    } catch (e) {
      console.error('[StaffMenuScreen] loadData error:', e);
      setError('Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  }, [buildSections]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreated = useCallback(
    (newItem: MenuItemData) => {
      const updated = [...items, newItem];
      setItems(updated);
      setSections(buildSections(categories, updated));
      setShowNewItemModal(false);
    },
    [items, categories, buildSections]
  );

  const handleDelete = useCallback(
    (item: MenuItemData) => {
      Alert.alert('Delete Item', `Are you sure you want to delete "${item.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMenuItem(item.id);
              const updated = items.filter((i) => i.id !== item.id);
              setItems(updated);
              setSections(buildSections(categories, updated));
            } catch {
              Alert.alert('Error', 'Failed to delete item.');
            }
          },
        },
      ]);
    },
    [items, categories, buildSections]
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Pressable style={styles.newItemButton} onPress={() => setShowNewItemModal(true)}>
            <Text style={styles.newItemText}>+ New Item</Text>
          </Pressable>
        </View>

        {/* Filter pills */}
        <View style={styles.filtersRow}>
          <Pressable style={styles.filterPill}>
            <Text style={styles.filterText}>Category ▾</Text>
          </Pressable>
          <Pressable style={styles.filterPill}>
            <Text style={styles.filterText}>Availability ▾</Text>
          </Pressable>
          <Pressable style={styles.filterPill}>
            <Text style={styles.filterText}>Price ▾</Text>
          </Pressable>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primaryGreen} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={loadData} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <StaffMenuItemRow item={item} onPress={() => {}} onDelete={handleDelete} />
            )}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.sectionDivider} />
              </View>
            )}
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            stickySectionHeadersEnabled={false}
          />
        )}
      </View>
      <NewMenuItemModal
        visible={showNewItemModal}
        categories={categories}
        onClose={() => setShowNewItemModal(false)}
        onCreated={handleCreated}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.pastelSage,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    alignItems: 'center',
    padding: 4,
  },
  backArrow: {
    color: Colors.light.text,
    fontSize: 24,
    fontWeight: '400',
  },
  logo: {
    width: 52,
    height: 52,
  },
  newItemButton: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  newItemText: {
    color: Colors.light.secondaryText,
    fontFamily: Typography.button.fontFamily,
    fontWeight: '600',
    fontSize: 14,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
  },
  filterPill: {
    borderWidth: 1,
    borderColor: Colors.mutedGray,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  filterText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
    color: Colors.light.text,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: Colors.light.background,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: Typography.heading.fontFamily,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.mutedGray,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 16,
    color: Colors.light.text,
  },
  retryButton: {
    backgroundColor: Colors.primaryGreen,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.light.secondaryText,
    fontFamily: Typography.button.fontFamily,
    fontWeight: '600',
    fontSize: 15,
  },
});
