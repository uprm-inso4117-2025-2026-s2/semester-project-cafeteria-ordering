import { GestureResponderEvent, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { MenuItem } from "../models/food-item-class";

// Props passed to the MenuItemCard component
type Props = {
  menuItem: MenuItem; // represents a single menu item object
  onAddToCart: (item: MenuItem) => void; // Handler to add this item to the cart
  onPressItem: (item: MenuItem) => void; // Handler for when the user taps the card
};

/**
 * MenuItemCard
 * A reusable component that displays a single menu item with its name, price, image, ingredients,
 * and an Add to Cart button. Handles interaction with the item for ordering and navigation
 * This component does not manage a list of items
 * It receives a single MenuItem object and manages its rendering and interactions
 */
export default function MenuItemCard({ menuItem, onAddToCart, onPressItem }: Props) {
  // Prepare description text from the menuItem's ingredients
  // This creates a comma-separated string of ingredient names
  const descriptionText = menuItem.getIngredients()
    .map((ing) => ing.ingredients_names).join(", ") || "No ingredients available";


  /**
   * handleAddToCart
   * Prevents the press event from triggering the parent card
   * Ensures only avaolable items can be added
   * This component does not store or modify the item
   * It passes the object upward using onAddToCart(menuItem)
   * The parent component (in menu/index.tsx) is responsible for:
   *    - Adding the item to a cart
   *    - Sending it to a backend
   */  
  const handleAddToCart = (e: GestureResponderEvent) => {
    e.stopPropagation(); // Prevent the card press from firing
    if (!menuItem.isAvailable()) return; // Prevent adding unavailable items 
    onAddToCart(menuItem); // Pass full MenuItem object to handler
  };

  /**
   * handlePressItem
   * Triggered when the user taps the card
   * Send the MenuItem object to the parent handler, allowing navigation using the item's ID
   */
  const handlePressItem = () => {
    onPressItem(menuItem);
  };

  /**
   * Interaction with parent handlers:
   * - onAddToCart and onPressItem are passed from MenuScreen (menu/index.tsx)
   * - This component calls them ans passes back the MenuItem object
   * 
   * This creates a two-way flow:
   * - Parent -> passes data (menuitem)
   * - Child -> return data via handlers
   * 
   * This keeps UI logic in this component and business logic (cart, navigation) in the parent 
   */
  return (
    <Pressable style={styles.card} onPress={handlePressItem}>
        {menuItem.getImageUrl() && <Image source={{ uri: menuItem.getImageUrl() }} style={styles.image} />}
        <View style={styles.info}>
            <Text style={styles.name}>{menuItem.getName()}</Text>
            <Text style={styles.price}>${menuItem.getTotalPrice().toFixed(2)}</Text>
            <Text style={styles.description}>{descriptionText}</Text>
        </View>
        <Pressable 
            style={[
                styles.addButton, !menuItem.isAvailable() && styles.disabledButton,
            ]} onPress={handleAddToCart}
        >
            <Text style={styles.addButtonText}>{menuItem.isAvailable() ? "Add to Cart" : "Not Available"}</Text>
        </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  info: {
    flex: 1,
    paddingRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    },
  price: {
    fontSize: 16,
    color: "#4CAF50",
    marginVertical: 4,
  },
  description: {
    fontSize: 14,
    color: "#555",
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: "#999",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 8,
  },
});