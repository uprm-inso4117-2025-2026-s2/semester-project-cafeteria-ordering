import { Colors, Typography } from '@/constants/theme';
import { dummyMenuItems } from '@/dummyData/menuData';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import darkLogo from '../../../documentation/branding/images/Dark-Mode-Logo.png';
import lightLogo from '../../../documentation/branding/images/Light-Mode-Logo.png';
import { useAuth } from '../authContext';

// UI categories 
const categories = ['Rating', 'Breakfast', 'Lunch'];

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme];

  const { user, loggedIn } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Rating');

  const categoryMap: Record<string, string> = {
    Rating: 'all',
    Breakfast: 'cat2',
    Lunch: 'cat1',
  };

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return dummyMenuItems.filter((item) => {
      const matchesSearch =
        item.getName().toLowerCase().includes(query) ||
        item
          .getIngredients()
          .some((ingredient) =>
            ingredient.ingredients_names.toLowerCase().includes(query)
          );

      const mappedCategory = categoryMap[selectedCategory];

      const matchesCategory =
        mappedCategory === 'all' ||
        item.getCategoryId() === mappedCategory;

      if (!query) return matchesCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const bestSeller = dummyMenuItems[0];

  return (
    <ScrollView
      style={[
        styles.screen,
        {
          backgroundColor: isDark
            ? Colors.dark.background
            : Colors.light.background,
        },
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextBlock}>
          <Image
            source={isDark ? darkLogo : lightLogo}
            style={styles.logo}
            contentFit="contain"
          />

          {loggedIn ? (
            <ThemedText style={styles.greeting}>
              Welcome {user?.fullName}!
            </ThemedText>
          ) : (
            <ThemedText style={[styles.greeting, { color: theme.text }]}>
              Hi, User!
            </ThemedText>
          )}

          <Text
            style={[
              styles.subGreeting,
              {
                color: isDark
                  ? Colors.dark.secondaryText
                  : Colors.light.text,
              },
            ]}
          >
            Ready to order?
          </Text>
        </View>

        {/* 👇 THIS IS THE IMPORTANT PART */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {/* Edit Profile Button */}
          <Pressable
            style={styles.cartButton}
            onPress={() => router.push('/edit-profile')}
          >
            <Ionicons name="person-outline" size={30} color={theme.text} />
          </Pressable>

          {/* Cart Button */}
          <Pressable
            style={styles.cartButton}
            onPress={() => router.push('/cart')}
          >
            <Ionicons
              name="cart-outline"
              size={30}
              color={isDark ? Colors.dark.text : Colors.light.text}
            />
          </Pressable>
        </View>
      </View>

      {/* Search bar */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: isDark ? '#E8E2EA' : '#E7E2EA',
          },
        ]}
      >
        <Ionicons name="search-outline" size={22} color="#555" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search"
          placeholderTextColor="#666"
          style={styles.searchInput}
        />
      </View>

      {/* Best Seller */}
      {bestSeller && (
        <Pressable
          style={[
            styles.bestSellerCard,
            { backgroundColor: Colors.primaryGreen },
          ]}
          onPress={() => router.push(`/menu/${bestSeller.getId()}`)}
        >
          <View style={styles.bestSellerText}>
            <Text style={styles.bestSellerLabel}>Best Seller</Text>
            <Text style={styles.bestSellerTitle}>
              {bestSeller.getName()}
            </Text>
            <View style={styles.metaRow}>
              <Ionicons name="star" size={16} color={Colors.pastelPeach} />
              <Text style={styles.metaText}>4.9</Text>
              <Text style={styles.metaText}>
                ${bestSeller.getTotalPrice().toFixed(2)}
              </Text>
            </View>
          </View>

          <Image
            source={{ uri: bestSeller.getImageUrl() }}
            style={styles.bestSellerImage}
            contentFit="cover"
          />
        </Pressable>
      )}

      {/* Categories */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Category
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {categories.map((category) => {
          const active = selectedCategory === category;

          return (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.chip,
                {
                  backgroundColor: active
                    ? Colors.primaryGreen
                    : Colors.pastelSage,
                },
              ]}
            >
              <Text style={styles.chipText}>{category}</Text>
              <Ionicons name="chevron-down" size={16} />
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Menu items */}
      <View style={styles.list}>
        {filteredItems.map((item) => (
          <Pressable
            key={item.getId()}
            style={[styles.menuCard, { backgroundColor: Colors.primaryGreen }]}
            onPress={() => router.push(`/menu/${item.getId()}`)}
          >
            <Image
              source={{ uri: item.getImageUrl() }}
              style={styles.menuImage}
              contentFit="cover"
            />

            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>{item.getName()}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="star" size={16} color={Colors.pastelPeach} />
                <Text style={styles.metaText}>4.9</Text>
                <Text style={styles.metaText}>
                  ${item.getTotalPrice().toFixed(2)}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextBlock: { flex: 1 },
  logo: { width: 92, height: 92, alignSelf: 'center' },
  greeting: { ...Typography.heading, fontSize: 32 },
  subGreeting: { ...Typography.subheading, fontSize: 20 },
  cartButton: { padding: 8 },
  searchBar: {
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  searchInput: { flex: 1 },
  bestSellerCard: { borderRadius: 12, padding: 16, flexDirection: 'row' },
  bestSellerText: { flex: 1 },
  bestSellerLabel: { fontSize: 16 },
  bestSellerTitle: { fontSize: 24 },
  bestSellerImage: { width: 128, height: 128 },
  sectionTitle: { fontSize: 20, marginVertical: 12 },
  chipRow: { flexDirection: 'row', gap: 12 },
  chip: { padding: 12, borderRadius: 999, flexDirection: 'row' },
  chipText: { fontSize: 16 },
  list: { gap: 14 },
  menuCard: { borderRadius: 12, padding: 10 },
  menuImage: { width: '100%', height: 120 },
  menuInfo: { padding: 6 },
  menuTitle: { fontSize: 16 },
  metaRow: { flexDirection: 'row', gap: 10 },
  metaText: { fontSize: 16 },
});