import { StyleSheet, Text, type TextProps } from 'react-native';

import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'heading' | 'defaultSemiBold' | 'subheading' | 'body' | 'button' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'heading' ? styles.heading : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subheading' ? styles.subheading : undefined,
        type === 'body' ? styles.body : undefined,
        type === 'button' ? styles.button : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 32,
    ...Typography.heading
  },
  subheading: {
    fontSize: 20,
    fontWeight: '500',
    ...Typography.subheading
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    ...Typography.body
  },
  button: {
    fontSize: 16,
    fontWeight: "600",
    ...Typography.button
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    textDecorationLine: 'underline',
    ...Typography.body
  },
});
