/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2E7D32';
const tintColorDark = '#FFCCBC';

export const Colors = {
  light: {
    text: '#424242',
    secondaryText: '#FAFAFA', // Use when bg color is #2E7D32
    alternateText: '#1C1C1C', // Use when bg color is #FFCCBC
    background: '#FAFAFA',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF',
    secondaryText: '#BDBDBD',
    alternateText: '#1C1C1C', // Use when bg color is #FFCCBC
    background: '#1C1C1C',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
  primaryGreen: '#2E7D32',
  pastelSage: '#A5D6A7',
  pastelPeach: '#FFCCBC',
  softGray: '#EEEEEE',
  mutedGray: '#BDBDBD'
};

export const Typography = {
  heading: {
    fontFamily: "Bitter",
  },

  subheading: {
    fontFamily: "Inter",
  },

  body: {
    fontFamily: "Inter",
  },

  button: {
    fontFamily: "Inter",
  },
};
