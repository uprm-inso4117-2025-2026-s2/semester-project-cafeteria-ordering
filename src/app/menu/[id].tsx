import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { availableAddOns } from "../../dummyData/addons";
import { dummyMenuItems } from "../../dummyData/menuData";
import { MenuItem } from "../../models/food-item-class";

/**
 * ItemPage ([id].tsx)
 * This screen represents the individual item modification page
 * Currently, it is dynamically routed based on the item's ID.
 * Example: /menu/1 -> loads item with id = 1
 */


/**
 * generateDescription
 * @param item - MenuItem object
 * @returns string description of the item including its ingredients
 *
 * This function generates a readable description for a menu item.
 * If no ingredients exist, it returns a default message.
 * If 1 ingredient, it returns that ingredient.
 * If 2 ingredients, it joins them with "and".
 * If 3 or more, it joins all with commas, with "and" before the last item.
 */
function generateDescription(item: MenuItem): string {
  const ingredients = item.getIngredients().map(i => i.ingredients_names);

  if (ingredients.length === 0) {
    return "Delicious and freshly prepared.";
  }
  const formatted =
    ingredients.length === 1
      ? ingredients[0]
      : ingredients.length === 2
      ? ingredients.join(" and ")
      : `${ingredients.slice(0, -1).join(", ")}, and ${ingredients.slice(-1)}`;

  return `Includes ${formatted}.`;
}

/**
 * ItemPage Component
 *
 * Main screen component for viewing and customizing a menu item.
 * Handles:
 * - Displaying item image, name, price, and description
 * - Adjusting quantity
 * - Selecting add-ons
 * - Adding item to cart
 */
export default function ItemPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const item = dummyMenuItems.find((menuItem) => menuItem.getId() === id);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const colors = isDark ? darkColors : lightColors;
    const [count, setCount] = useState(1);
    const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
    const isAvailable = item?.isAvailable();

    /**
     * handleAddToCart
     *
     * Logs the item, quantity, and selected add-ons.
     * Placeholder for actual cart logic.
     */
    const handleAddToCart = () => {
        if (!item) return;
            const selected = availableAddOns.filter((addon) =>
                selectedAddOns.includes(addon.id)
            );
        console.log({
            item: item.getName(),
            quantity: count,
            addOns: selected,
        });
    };

    /**
     * toggleAddOn
     * @param id - ID of the add-on to toggle
     *
     * Adds or removes an add-on from the selectedAddOns array.
     */
    const toggleAddOn = (id: string) => {
        setSelectedAddOns((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    return (
    <>
        {/* Configure page header */}
        <Stack.Screen 
            options={{ 
                title: item ? item.getName() : "Item Details",
                headerStyle: {backgroundColor: colors.background},
                headerTitleStyle: {
                    fontFamily: "Inter",
                    fontWeight: "500",
                    color: colors.textPrimary,
                },
            }} 
        />
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            {/* Item image */}
            <View style={[styles.imageBox, { backgroundColor: colors.background}]}>
                <Image
                source={{ uri: item?.getImageUrl() }}
                style={styles.image}
                />
            </View>
            {/* Item details */}
            <View style={styles.content}>
                {/* Name and Price */}
                <View style={styles.rowBetween}>
                    <Text style={[styles.heading, {color:colors.textPrimary}]}>
                        {item ? item.getName() : "Item Name"}
                    </Text>
                    <Text style={[styles.subheading, {color:colors.textPrimary}]}>
                        ${item?.getBasePrice().toFixed(2)}
                    </Text>
                </View>
                {/* Description */}
                <Text style={[styles.body, { color: colors.textSecondary }]}>
                     {item ? generateDescription(item) : "Item Description"}
                </Text>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                {/* Quantity Selector */}
                <Text style={[styles.subheading, { color: colors.textPrimary }]}>
                    Choose a Quantity
                </Text>
                
                <View style={styles.rowBetween}>
                    <View style={styles.counter}>
                        <Pressable
                        disabled={!isAvailable}
                        style={({ pressed }) => [
                            styles.circleBtn,
                            {
                                backgroundColor: !isAvailable
                                    ? colors.textSecondary 
                                    : pressed
                                    ? colors.primary 
                                    : colors.secondary,
                                opacity: isAvailable ? 1 : 0.5,
                            },
                        ]}
                        onPress={() => setCount(Math.max(1, count - 1))}
                        >
                            <Text style={styles.btnText}>-</Text>
                        </Pressable>
                        <Text style={[styles.body, { color: colors.textPrimary }]}>
                            {count}
                        </Text>
                        <Pressable
                        disabled={!isAvailable}
                        style={({ pressed }) => [
                            styles.circleBtn,
                            {
                                backgroundColor: !isAvailable
                                    ? colors.textSecondary
                                    : pressed
                                    ? colors.primary
                                    : colors.secondary,
                                opacity: isAvailable ? 1 : 0.5,
                            },
                        ]}
                        onPress={() => setCount(count + 1)}
                        >
                            <Text style={styles.btnText}>+</Text>
                        </Pressable>
                    </View>
                    {/* Add to Cart Button */}
                    <Pressable
                    disabled={!isAvailable}
                    style={({ pressed }) => [
                        styles.addButton,
                        {
                            backgroundColor: isAvailable
                                ? pressed
                                    ? colors.secondary
                                    : colors.primary
                                : colors.textSecondary,
                            opacity: isAvailable ? 1 : 0.6,
                        },
                    ]}
                    onPress={handleAddToCart}
                    >
                        <Text style={styles.addButtonText}>{isAvailable ? "+ Add to Cart" : "Not Available"}</Text>
                    </Pressable>
                </View>
                {/* Add-Ons */}
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    
                    <Text style={[styles.subheading, { color: colors.textPrimary }]}>
                        Add-ons
                    </Text>

                    <View style={styles.row}>
                        {availableAddOns.map((addon) => {
                            const isSelected = selectedAddOns.includes(addon.id);
                            return (
                                <Pressable
                                key={addon.id}
                                onPress={() => toggleAddOn(addon.id)}
                                style={[
                                styles.pill,
                                { backgroundColor: isSelected ? colors.primary : colors.secondary },
                                ]}
                                >
                                    <Text style={[styles.body,{ color: isSelected ? "#FAFAFA" : colors.textPrimary },]}>
                                        {addon.name} (+${addon.price.toFixed(2)})
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </View>
        </>
    );
}

const lightColors = {
    background: "#FAFAFA",
    card: "#EEEEEE",
    primary: "#2E7D32",
    secondary: "#A5D6A7",
    accent: "#FFCCBC",
    textPrimary: "#424242",
    textSecondary: "#BDBDBD",
    border: "#FFCCBC",
};

const darkColors = {
    background: "#1C1C1C",
    card: "#2A2A2A",
    primary: "#2E7D32",
    secondary: "#A5D6A7",
    accent: "#FFCCBC",
    textPrimary: "#FFFFFF",
    textSecondary: "#BDBDBD",
    border: "#A5D6A7",
}

const styles = StyleSheet.create({
    container: { 
        flex: 1,  
    },
    imageBox: {
        height: 200,
        justifyContent: "center",
        alignItems: "center",
    },
    imageText: {
        fontSize: 20,
        fontFamily: "Inter",
        fontStyle: "italic",
    },
    content: {
        padding: 16,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginVertical: 8,
    },
    heading: {
        fontSize: 32,
        fontWeight: "600",
        fontFamily: "Bitter",
    },
    subheading: {
        fontSize: 20,
        fontWeight: "500",
        fontFamily: "Inter",
        marginVertical: 8,
    },
    body: {
        fontSize: 16,
        fontWeight: "400",
        fontFamily: "Inter",
        marginBottom: 8,
    },
    divider: {
        height: 1,
        marginVertical: 12,
        color: "#FFCCBC",
    },
    counter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    circleBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    btnText: {
        fontSize: 20,
        fontFamily: "Inter",
        fontWeight: "500",
    },
    addButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    addButtonText: {
        color: "#FAFAFA",
        fontFamily: "Inter",
        fontWeight: "500",
        fontSize: 16,
    },
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
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
 *    - Page displays item's image, name, base price, and dynamically generated description
 *    - Users can adjust quantity and select add-ons
 *    - "Add to Cart" logs item, quantity, and selected add-ons (placeholder)
 * 4. Future improvements:
 *    - Replace dummyMenuItems with API call
 *    - Implement actual cart functionality
 *    - Allow ingredient customization (add/remove ingredients)
 */