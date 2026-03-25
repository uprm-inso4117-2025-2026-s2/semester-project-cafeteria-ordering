/*

Any combination of the optional customization properties may be changed for a given instance.

Component usage examples:

    Default values:
        <InputField></InputField>

    Customized background color:
        <InputField backgroundColor='#000000'></InputField>

    Customized size:
        <InputField width={100} height={50}></InputField>

    Customized placeholder text:
        <InputField placeholderText='[placeholder text]'></InputField>

*/



import { Colors, Typography } from "@/constants/theme";
import React from 'react';
import { StyleSheet, TextInput } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  // Optional customization properties
  backgroundColor?: string;
  textColor?: string;
  width?: number;
  height?: number;
  placeholderText?: string;
};

export default function InputField({ backgroundColor, textColor, width, height, placeholderText: placeholderText }: Props) {
    const [text, onChangeText] = React.useState('');

    return (
      <SafeAreaProvider>
        <SafeAreaView>
          <TextInput style={[styles.input, {
            backgroundColor: backgroundColor ?? Colors.pastelSage, 
            color: textColor ?? Colors.light.alternateText,
            width: width ?? 300, 
            height: height ?? 40,}]} 
            onChangeText={onChangeText} value={text} placeholder={placeholderText ?? ''}/>
        </SafeAreaView>
      </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
  input: {
    padding: 16,
    margin: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    ...Typography.body
  },
});