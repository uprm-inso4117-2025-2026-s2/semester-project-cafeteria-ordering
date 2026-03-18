import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import MenuItemCard from "../../components/MenuItemCard";
import { dummyMenuItems } from "../../dummyData/menuData";
import { MenuItem } from "../../models/food-item-class";

/**
 * MenuScreen (index.tsx)
 * This screen display the list of available menu items.
 * Currently, data is sourced from a dummy data file (src/dummyData/menuData.ts)
 */
export default function MenuScreen() {
  const router = useRouter();

  /**
   * handleAddToCart
   * Receives full MenuItem object from MenuItemCard,
   * which gives it access to all its methods and properties
   * This function should be used to manage the item:
   *    - Add it to a cart
   *    - Send it to backend API
   */
  const handleAddToCart = (menuItem: MenuItem) => {
    console.log("Added to cart:", menuItem);
  };

  /**
   * handlePressItem
   * Triggered when a MenuItemCard is pressed
   * Receives the full MenuItem object
   * Navigates to the ItemPage using the item's ID
   * ID is passed via the URL and retrieved in [id].tsx
   */
  const handlePressItem = (menuItem: MenuItem) => {
    console.log("Navigating to item page:", menuItem);
    router.push(`/menu/${menuItem.getId()}`); // Placeholder route for item modification view
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      {/**
       * FlatList
       * data: array of MenuItem objects
       * keyExtractor: ensures each item has unique key
       * renderItem: defines how each item is displayed
       */}
      <FlatList
        data={dummyMenuItems}
        keyExtractor={(menuItem) => menuItem.getId()}
        renderItem={({ item : menuItem }) => (
          /**
           * MenuItemCard
           * menuItem: the MenuItem object
           * onAddToCart: handler for adding item to cart
           * onPressItem: handler for navigating to the item page
           */
          <MenuItemCard
            menuItem={menuItem}
            onAddToCart={handleAddToCart}
            onPressItem={handlePressItem}
          />
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F5F5" 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginVertical: 16, 
    marginLeft: 16, 
    paddingTop: 16 
  },
});

/**
 * 1. Data Preparation:
 *    - Menu items are stored in dummyMenuItems (array of MenuItem objects)
 *    - Each MenuItem contains:
 *        - id, category id, name, ingredients, price, image url, availability, allergens, prep time, and a created at and updated at time.
 * 2. Rendering Items:
 *    - FlatList iterates over dummyMenuItems
 *    - Each item is passed to MenuItemCard
 * 3. User Interactions:
 *    - Add to Cart:
 *        MenuItemCard → handleAddToCart → logs or stores item
 *    - View Item Details:
 *        MenuItemCard → handlePressItem → router.push(`/menu/:id`)
 * 4. Navigation Flow:
 *    - Selecting an item navigates to:
 *        /menu/[id].tsx (ItemPage)
 *    - The ID is used to retrieve the full item data
 */

