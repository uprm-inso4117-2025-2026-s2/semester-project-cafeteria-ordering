import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import MenuItemCard from "../components/MenuItemCard";
import { MenuItem } from "../models/food-item-class";

const dummyMenuItems: MenuItem[] = [
    new MenuItem(
        "1",
        "cat1",
        "Classic Burger",
        [
            {ingredients_id: "ing1", ingredients_names: "Beef Patty",ingredients_price: 0},
            {ingredients_id: "ing2", ingredients_names: "Lettuce",ingredients_price: 0},
            {ingredients_id: "ing3", ingredients_names: "Tomato",ingredients_price: 0},
            {ingredients_id: "ing4", ingredients_names: "Cheese",ingredients_price: 0},
            {ingredients_id: "ing15", ingredients_names: "Bun",ingredients_price: 0},
        ],
        8.99,
        "https://thumbs.dreamstime.com/b/home-big-classic-burger-wooden-table-close-up-120662126.jpg",
        true,
        ["gluten"],
        10,
        new Date().toISOString(),
        new Date().toISOString()
    ),
    new MenuItem(
        "2",
        "cat1",
        "Veggie Pizza",
        [
            {ingredients_id: "ing5", ingredients_names: "Bell Peppers",ingredients_price: 0},
            {ingredients_id: "ing6", ingredients_names: "Spinach",ingredients_price: 0},
            {ingredients_id: "ing7", ingredients_names: "Mushrooms",ingredients_price: 0},
            {ingredients_id: "ing8", ingredients_names: "Onions",ingredients_price: 0},
            {ingredients_id: "ing4", ingredients_names: "Cheese",ingredients_price: 0},
        ],
        12.99,
        "https://media.istockphoto.com/id/842082336/photo/homemade-veggie-pizza-with-mushrooms-peppers.jpg?s=612x612&w=0&k=20&c=op1vZnGjlB_c3w6Z-ohPo0wn4QveujVKZu4vTZCOWnc=",
        true,
        ["dairy"],
        15,
        new Date().toISOString(),
        new Date().toISOString()
    ),
    new MenuItem(
        "3",
        "cat1",
        "Tuna Sandwich",
        [
            {ingredients_id: "ing9", ingredients_names: "Tuna",ingredients_price: 0},
            {ingredients_id: "ing10", ingredients_names: "Bread",ingredients_price: 0},
            {ingredients_id: "ing2", ingredients_names: "Lettuce",ingredients_price: 0},
            {ingredients_id: "ing3", ingredients_names: "Tomato",ingredients_price: 0},
        ],
            
        6.99,
        "https://t3.ftcdn.net/jpg/19/31/67/38/360_F_1931673826_Sc2ngY7eLs14phHdr5f1Tdz9jAPdZR5P.jpg",
        true,
        ["gluten"],
        10,
        new Date().toISOString(),
        new Date().toISOString()
    ),
    new MenuItem(
        "4",
        "cat2",
        "Latte",
        [
            {ingredients_id: "ing11", ingredients_names: "Milk",ingredients_price: 0},
            {ingredients_id: "ing12", ingredients_names: "Espresso",ingredients_price: 0},
        ],
        3.50,
        "https://www.shutterstock.com/image-photo/latte-black-takeaway-full-cup-600nw-2644775925.jpg",
        true,
        ["dairy"],
        4,
        new Date().toISOString(),
        new Date().toISOString()
    ),
    new MenuItem(
        "5",
        "cat1",
        "Chicken Wrap",
        [
            {ingredients_id: "ing13", ingredients_names: "Chicken",ingredients_price: 0},
            {ingredients_id: "ing14", ingredients_names: "Tortilla",ingredients_price: 0},
            {ingredients_id: "ing2", ingredients_names: "Lettuce",ingredients_price: 0},
        ],
        8.99,
        "https://media.istockphoto.com/id/589124512/photo/chicken-caesar-salad-sandwich-wraps.jpg?s=612x612&w=0&k=20&c=T3aHb8mKEaFz72HPti5Ep2WPxpZgqFpF962gntN99MY=",
        true,
        ["gluten"],
        10,
        new Date().toISOString(),
        new Date().toISOString()
    ),
];

export default function MenuScreen() {
  const router = useRouter();

  const handleAddToCart = (item: MenuItem) => {
  console.log(`Added to cart: ${item.getName()} - $${item.getTotalPrice().toFixed(2)}`);
};

const handlePressItem = (item: MenuItem) => {
  console.log(`Navigating to item page: ${item.getName()}`);
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
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  title: { fontSize: 28, fontWeight: "bold", marginVertical: 16, marginLeft: 16, paddingTop: 16 },
});