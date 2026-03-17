import { GestureResponderEvent, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MenuItem } from "../models/food-item-class";

type Props = {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onPressItem: (item: MenuItem) => void;
};

export default function MenuItemCard({ item, onAddToCart, onPressItem }: Props) {
  const descriptionText = [
    ...item.getIngredients().map((ing) => ing.ingredients_names),
    // ...(item.getAllergens() || []),
    ].join(", ") || "No ingredients listed";

  const handleAddToCart = (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (item.canOrder()) onAddToCart(item);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPressItem(item)}>
      {item.getImageUrl() ? (
        <Image source={{ uri: item.getImageUrl() }} style={styles.image} />
      ) : null}
      <View style={styles.info}>
        <Text style={styles.name}>{item.getName()}</Text>
        <Text style={styles.price}>${item.getTotalPrice().toFixed(2)}</Text>
        <Text style={styles.description}>{descriptionText}</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
        <Text style={styles.addButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </TouchableOpacity>
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