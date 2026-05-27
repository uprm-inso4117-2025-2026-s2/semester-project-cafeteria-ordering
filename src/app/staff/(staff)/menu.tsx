import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { fetchAllMenuItems, fetchMenuCategories, MenuCategory, MenuItemData } from '@/lib/menu';
import NewMenuItemModal from '@/components/NewMenuItemModal';
import StaffMenuItemRow from '@/components/StaffMenuItemRow';
import BaseDrawer from "@/components/StaffNavDrawer";

type Section = {
  title: string;
  data: MenuItemData[];
};

export default function StaffMenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');

  const categoryNameById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

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

  const sections = useMemo(() => {
    let result = buildSections(categories, items);

    if (categoryFilter !== null) {
      result = result.filter((s) => s.title === categoryFilter);
    }

    if (availabilityFilter !== 'all') {
      result = result
        .map((s) => ({
          ...s,
          data: s.data.filter((item) =>
            availabilityFilter === 'available' ? item.available : !item.available
          ),
        }))
        .filter((s) => s.data.length > 0);
    }

    if (priceSort !== 'none') {
      result = result.map((s) => ({
        ...s,
        data: [...s.data].sort((a, b) =>
          priceSort === 'asc' ? a.price - b.price : b.price - a.price
        ),
      }));
    }

    return result;
  }, [categories, items, categoryFilter, availabilityFilter, priceSort, buildSections]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [cats, its] = await Promise.all([fetchMenuCategories(), fetchAllMenuItems()]);
      setCategories(cats);
      setItems(its);
    } catch (e) {
      console.error('[StaffMenuScreen] loadData error:', e);
      setError('Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCategoryPress = useCallback(() => {
    setCategoryFilter((prev) => {
      const names = categories.map((c) => c.name);
      if (prev === null) return names[0] ?? null;
      const idx = names.indexOf(prev);
      return idx === -1 || idx === names.length - 1 ? null : names[idx + 1];
    });
  }, [categories]);

  const handleAvailabilityPress = useCallback(() => {
    setAvailabilityFilter((prev) => {
      if (prev === 'all') return 'available';
      if (prev === 'available') return 'unavailable';
      return 'all';
    });
  }, []);

  const handlePricePress = useCallback(() => {
    setPriceSort((prev) => {
      if (prev === 'none') return 'asc';
      if (prev === 'asc') return 'desc';
      return 'none';
    });
  }, []);

  const handleCreated = useCallback(
    (newItem: MenuItemData) => {
      setItems((prev) => [...prev, newItem]);
      setShowNewItemModal(false);
    },
    []
  );

  const handleUpdate = useCallback(
    (updatedItem: MenuItemData) => {
      setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
    },
    []
  );

  const handleDeleted = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      setExpandedItemId((prev) => (prev === id ? null : prev));
    },
    []
  );

return (
  <>
    <Stack.Screen options={{ headerShown: false }} />

    <BaseDrawer>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={8}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>

          <Image
            source={require("../../../../documentation/branding/images/Light-Mode-Logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Pressable
            style={styles.newItemButton}
            onPress={() => setShowNewItemModal(true)}
          >
            <Text style={styles.newItemText}>+ New Item</Text>
          </Pressable>
        </View>

        {/* Filter pills */}
        <View style={styles.filtersRow}>
          <Pressable
            style={[styles.filterPill, categoryFilter !== null && styles.filterPillActive]}
            onPress={handleCategoryPress}
          >
            <Text style={[styles.filterText, categoryFilter !== null && styles.filterTextActive]}>
              {categoryFilter ?? 'Category'} ▾
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterPill, availabilityFilter !== 'all' && styles.filterPillActive]}
            onPress={handleAvailabilityPress}
          >
            <Text style={[styles.filterText, availabilityFilter !== 'all' && styles.filterTextActive]}>
              {availabilityFilter === 'all' ? 'Availability' : availabilityFilter === 'available' ? 'Available' : 'Unavailable'} ▾
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterPill, priceSort !== 'none' && styles.filterPillActive]}
            onPress={handlePricePress}
          >
            <Text style={[styles.filterText, priceSort !== 'none' && styles.filterTextActive]}>
              {priceSort === 'none' ? 'Price' : priceSort === 'asc' ? 'Price: Low→High' : 'Price: High→Low'} ▾
            </Text>
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
              <StaffMenuItemRow
                item={item}
                categories={categories}
                categoryName={categoryNameById.get(item.category_id) ?? 'Unknown'}
                isExpanded={expandedItemId === item.id}
                onToggle={(id) => setExpandedItemId((prev) => (prev === id ? null : id))}
                onUpdate={handleUpdate}
                onDeleted={handleDeleted}
              />
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
    </BaseDrawer>

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
  filterPillActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  filterText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
    color: Colors.light.text,
  },
  filterTextActive: {
    color: Colors.light.secondaryText,
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
