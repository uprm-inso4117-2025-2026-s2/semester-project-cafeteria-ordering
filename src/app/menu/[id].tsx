import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { dummyMenuItems } from "../../dummyData/menuData";


export default function ItemPage() {
    const { id } = useLocalSearchParams();
    const item = dummyMenuItems.find((menuItem) => menuItem.getId() === id);

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