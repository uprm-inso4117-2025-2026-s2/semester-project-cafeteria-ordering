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

import darkLogo from '../../../documentation/branding/images/Dark-Mode-Logo.png';
import lightLogo from '../../../documentation/branding/images/Light-Mode-Logo.png';

import MenuItemCard from '@/components/MenuItemCard';
import { MenuItem } from '@/models/food-item-class';


//UI categories 
const categories = ['Rating', 'Breakfast', 'Lunch'];

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme];

  //search input and seleted category state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Rating');

  //mapping UI category names to actual category IDs in the menu data
  const categoryMap: Record<string, string> = {
    Rating: 'all',
    Breakfast: 'cat2',
    Lunch: 'cat1',
  };

  //filter items based on category and search
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

  const handleAddToCart = (menuItem: MenuItem) => {
    console.log('Added to cart:', menuItem);
  };

  const handlePressItem = (menuItem: MenuItem) => {
    router.push(`/menu/${menuItem.getId()}`);
  };

  //best seller is just the first item for now!!!!!

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
      {/* Header*/}
      <View style={styles.header}>
        <View style={styles.headerTextBlock}>
          <Image
            source={isDark ? darkLogo : lightLogo}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={[styles.greeting, { color: theme.text }]}>
            Hi, User!
          </Text>
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

        {/* Cart button leads to placeholder*/}
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

      {/* search bar*/}
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

      {/* best seller card*/}
      {bestSeller && (
        <Pressable
          style={[
            styles.bestSellerCard,
            { backgroundColor: Colors.primaryGreen },
          ]}
          onPress={() => router.push(`/menu/${bestSeller.getId()}`)}
        >
          <View style={styles.bestSellerText}>
            <Text
              style={[
                styles.bestSellerLabel,
                { color: Colors.light.secondaryText },
              ]}
            >
              Best Seller
            </Text>
            <Text
              style={[
                styles.bestSellerTitle,
                { color: Colors.light.secondaryText },
              ]}
            >
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
      {/* category section*/}
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
                  opacity: active ? 1 : 0.95,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: active
                      ? Colors.light.secondaryText
                      : Colors.light.alternateText,
                  },
                ]}
              >
                {category}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={
                  active
                    ? Colors.light.secondaryText
                    : Colors.light.alternateText
                }
              />
            </Pressable>
          );
        })}
      </ScrollView>

      {/* menu items list*/}
      <View style={styles.list}>
        {filteredItems.map((menuItem) => (
          <MenuItemCard
            key={menuItem.getId()}
            menuItem={menuItem}
            onAddToCart={handleAddToCart}
            onPressItem={handlePressItem}
          />
        ))}
      </View>
    </ScrollView>
  );
}

// styles for the home screen
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTextBlock: {
    flex: 1,
  },
  logo: {
    width: 92,
    height: 92,
    marginBottom: 8,
    alignSelf: 'center',
  },
  greeting: {
    ...Typography.heading,
    fontSize: 32,
    fontWeight: '600',
  },
  subGreeting: {
    ...Typography.subheading,
    fontSize: 20,
    fontWeight: '500',
    marginTop: 4,
  },
  cartButton: {
    padding: 8,
    marginBottom: 6,
  },
  searchBar: {
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    fontSize: 16,
    color: '#424242',
  },
  bestSellerCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  bestSellerText: {
    flex: 1,
    paddingRight: 12,
  },
  bestSellerLabel: {
    ...Typography.body,
    fontSize: 16,
    marginBottom: 8,
  },
  bestSellerTitle: {
    ...Typography.heading,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
  },
  bestSellerImage: {
    width: 128,
    height: 128,
    borderRadius: 16,
  },
  sectionTitle: {
    ...Typography.heading,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  chipRow: {
    gap: 12,
    paddingBottom: 12,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 6,
  },
  chipText: {
    ...Typography.button,
    fontSize: 16,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaText: {
    ...Typography.body,
    fontSize: 16,
    color: Colors.light.secondaryText,
  },
});