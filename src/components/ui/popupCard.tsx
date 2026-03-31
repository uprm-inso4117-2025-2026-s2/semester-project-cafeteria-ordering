/*

Any combination of the optional customization properties may be changed for a given instance.
'children' refers to any nodes and/or components added to popup card.

Component usage examples:

    Default values:
        <PopupCard visible={true}>
          <ThemedText>default text</ThemedText>
        </PopupCard>

    Customized background color:
        <PopupCard visible={true} backgroundColor='#fff'>
          <ThemedText>default text</ThemedText>
        </PopupCard>

    Customized size:
        <PopupCard visible={showPopup} width={200} height={250}>
          <ThemedText>default text</ThemedText>
        </PopupCard>

*/



import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ReactNode } from 'react';
import { Modal, StyleSheet, View, ViewStyle } from 'react-native';

type PopupCardProps = {
  visible: boolean;
  children: ReactNode;

  // Optional customization properties
  backgroundColor?: string;
  width?: number;
  height?: number;

  style?: ViewStyle;
};

export default function PopupCard({ visible, children, backgroundColor, width, height, style, }: PopupCardProps) {
  const backgroundColorDefault = useThemeColor(
    { light: Colors.light.background, dark: Colors.dark.background },
    'background'
  );

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: backgroundColor ?? backgroundColorDefault, width, height}, style]}>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // dark background
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 280,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    elevation: 5,
  },
});