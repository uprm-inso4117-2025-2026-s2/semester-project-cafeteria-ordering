/*

Any combination of the optional customization properties may be changed for a given instance.

Component usage examples:

    Default values:
        <PrimaryButton title="[button text]" onPress={() => console.log("Pressed!")}/>

    Customized background color:
        <PrimaryButton title="[button text]" backgroundColor="#000000" onPress={() => console.log("Pressed!")}/>

    Customized size:
        <PrimaryButton title="[button text]" width={100} height={50} onPress={() => console.log("Pressed!")}/>

*/



import { Colors, Typography } from "@/constants/theme";
import { Pressable, StyleSheet, Text, TextStyle, ViewStyle } from "react-native";

type Props = {
  title: string;
  onPress?: () => void;

  // Optional customization properties
  backgroundColor?: string;
  textColor?: string;
  width?: number;
  height?: number;

  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function PrimaryButton({ title, onPress, backgroundColor, textColor, width, height, style, textStyle }: Props) {
  return (
    <Pressable style={[styles.button, {
        backgroundColor: backgroundColor ?? Colors.primaryGreen, width, height: height ?? 40}, style]} 
        onPress={onPress}>
      <Text style={[styles.text, {color: textColor ?? Colors.light.secondaryText}, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    margin: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    ...Typography.button
  },
});