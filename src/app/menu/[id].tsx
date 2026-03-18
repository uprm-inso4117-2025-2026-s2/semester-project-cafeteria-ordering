import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { dummyMenuItems } from "../../dummyData/menuData";

/**
 * ItemPage ([id].tsx)
 * This screen represents the individual item modification page
 * Currently, it is dynamically routed based on the item's ID.
 * Example: /menu/1 -> loads item with id = 1
 */

export default function ItemPage() {
    const { id } = useLocalSearchParams<{ id: string }>(); // Retrieves parameters from URL
    const item = dummyMenuItems.find((menuItem) => menuItem.getId() === id); // Searches dummyMenuItems (src/dummyData/menuData.ts) for matching ID

    return (
    <>
        <Stack.Screen options={{ title: item ? item.getName() : "Item Details" }} />
        <View style={styles.container}>
            <Text style={styles.title}>
                {item ? item.getName() : "Item not found"}
            </Text>
        </View>
    </>
  );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#FFFFFF", 
        justifyContent: "center", 
        alignItems: "center" 
    },
    title: { 
        fontSize: 24, 
        fontWeight: "bold",
        color: "#000000",
    },
});

/**
 * 1. Navigation from MenuItemCard:
 *    - When a user taps a menu item, MenuScreen calls:
 *        router.push(`/menu/${menuItem.getId()}`)
 *
 *    - This navigates to:
 *        /menu/[id].tsx
 * 2. Data flow:
 *    - The ID is passed through the URL
 *    - This page retrieves it using useLocalSearchParams()
 *    - Then finds the corresponding MenuItem from the data source
 * 3. Current behavior:
 *    - Displays the item's name
 *    - Sets the page title dynamically
 *
 * 4. Future improvements:
 *    - Display price, ingredients, and image
 *    - Allow customization (add/remove ingredients)
 *    - Add "Add to Cart" from this page
 *    - Replace dummyMenuItems with a database/API call
 */