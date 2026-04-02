import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Colors, Typography } from '../constants/theme';
import { MenuItemData } from '../lib/menu';

type Props = {
  item: MenuItemData;
  onPress: (item: MenuItemData) => void;
  onDelete: (item: MenuItemData) => void;
};

/**
 * StaffMenuItemRow
 * A swipeable row for the staff menu list.
 * Swipe right to reveal the red delete button on the left.
 * Tap the row to view item details.
 */
export default function StaffMenuItemRow({ item, onPress, onDelete }: Props) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderLeftActions = () => (
    <Pressable
      style={styles.deleteAction}
      onPress={() => {
        swipeableRef.current?.close();
        onDelete(item);
      }}
    >
      <Text style={styles.deleteIcon}>🗑</Text>
    </Pressable>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      friction={2}
      leftThreshold={40}
    >
      <Pressable style={styles.row} onPress={() => onPress(item)}>
        <View style={styles.imagePlaceholder} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.meta}>
            ${Number(item.price).toFixed(2)}
            {' | '}
            {item.available ? 'In stock' : 'Out of stock'}
          </Text>
        </View>
        <Text style={styles.dotsMenu}>•••</Text>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  deleteAction: {
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    marginVertical: 6,
    marginLeft: 16,
    borderRadius: 10,
  },
  deleteIcon: {
    fontSize: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.pastelSage,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 10,
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 6,
  },
  imagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 6,
    backgroundColor: Colors.primaryGreen,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: Typography.heading.fontFamily,
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 2,
  },
  meta: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 14,
    color: Colors.light.icon,
  },
  dotsMenu: {
    fontSize: 16,
    color: Colors.light.text,
    paddingHorizontal: 4,
    letterSpacing: 1,
  },
});
