import { GestureResponderEvent, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { MenuItem } from "../models/food-item-class";

type Props = {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onPressItem: (item: MenuItem) => void;
};

export default function MenuItemCard({ item, onAddToCart, onPressItem }: Props) {
  const descriptionText = item.getIngredients()
    .map((ing) => ing.ingredients_names).join(", ") || "No ingredients available";

  const handleAddToCart = (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (!item.isAvailable()) return;
    onAddToCart(item);
  };

  return (
    <Pressable style={styles.card} onPress={() => onPressItem(item)}>
        {item.getImageUrl() && <Image source={{ uri: item.getImageUrl() }} style={styles.image} />}
        <View style={styles.info}>
            <Text style={styles.name}>{item.getName()}</Text>
            <Text style={styles.price}>${item.getTotalPrice().toFixed(2)}</Text>
            <Text style={styles.description}>{descriptionText}</Text>
        </View>
        <Pressable 
            style={[
                styles.addButton, !item.isAvailable() && styles.disabledButton,
            ]} onPress={handleAddToCart}
        >
            <Text style={styles.addButtonText}>{item.isAvailable() ? "Add to Cart" : "Not Available"}</Text>
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