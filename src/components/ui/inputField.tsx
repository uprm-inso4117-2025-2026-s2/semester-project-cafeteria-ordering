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
import { StyleSheet, TextInput, TextStyle } from "react-native";

type Props = {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;

  // Optional customization properties
  backgroundColor?: string;
  textColor?: string;
  width?: number;
  height?: number;
  placeholderText?: string;

  inputStyle?: TextStyle;
};

export default function InputField({ label, value, onChangeText: onChangeTextProp, backgroundColor, textColor, width, height, placeholderText: placeholderText, inputStyle }: Props) {
    return (
      <TextInput style={[styles.input, {
        backgroundColor: backgroundColor ?? Colors.pastelSage, 
        color: textColor ?? Colors.light.alternateText,
        width: width ?? 300, 
        height: height ?? 40,}, inputStyle]} 
        value={value}
        onChangeText={(value) => {
          if (onChangeTextProp) onChangeTextProp(value);
        }}
        placeholder={placeholderText ?? ''} nativeID={label ?? ''}/>
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