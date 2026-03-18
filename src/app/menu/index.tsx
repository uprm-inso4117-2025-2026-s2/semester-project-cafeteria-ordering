import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import MenuItemCard from "../../components/MenuItemCard";
import { dummyMenuItems } from "../../dummyData/menuData";
import { MenuItem } from "../../models/food-item-class";

export default function MenuScreen() {
  const router = useRouter();

  const handleAddToCart = (item: MenuItem) => {
  console.log("Added to cart:", item);
};

const handlePressItem = (item: MenuItem) => {
  console.log("Navigating to item page:", item);
  router.push(`/menu/${item.getId()}`); // Placeholder route for item modification view
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      <FlatList
        data={dummyMenuItems}
        keyExtractor={(item) => item.getId()}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
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