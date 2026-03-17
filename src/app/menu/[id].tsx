import { Stack } from "expo-router";
import { Text, View } from "react-native";

export default function ItemPage() {
  return (
    <>
        <Stack.Screen options={{ title: "Item Details" }} />
        <View>
        <Text>Item Page</Text>
        </View>
    </>
  );
}