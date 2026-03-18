import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MenuItem } from '@/models/food-item-class';
import { Fonts } from '@/constants/theme';

const formatCardNumber = (value: string) => {
  const digits = value.replace(/[^0-9]/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (value: string) => {
  const digits = value.replace(/[^0-9]/g, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
};

const formatCvc = (value: string) => {
  return value.replace(/[^0-9]/g, '').slice(0, 3);
};

const formatZip = (value: string) => {
  return value.replace(/[^0-9]/g, '').slice(0, 5);
};

type OrderItem = {
  menuItem: MenuItem;
  quantity: number;
};

export default function PaymentScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const [headerHeight, setHeaderHeight] = useState(0);

  const colors = {
    background: isDark ? '#121212' : '#FAFAFA',
    primaryText: isDark ? '#F5F5F5' : '#3F3F3F',
    secondaryText: isDark ? '#EAEAEA' : '#333333',
    mutedText: isDark ? '#D0D0D0' : '#7A7A7A',
    placeholderText: '#B8B8B8',
    inputBackground: isDark ? '#181818' : '#FFFFFF',
    inputBorder: isDark ? '#BDBDBD' : '#D8D8D8',
    sectionDivider: isDark ? '#EBC6B8' : '#EDC2B0',
    summaryBackground: '#B7D6B0',
    summaryText: '#4A4A4A',
    green: '#4D8B3B',
    greenLight: '#A8CFA3',
    white: '#FFFFFF',
    black: '#000000',
  };

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [country, setCountry] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);

  // Replace this example array with real cart/order data later.
  const orderItems: OrderItem[] = [
    {
      menuItem: new MenuItem(
        '1',
        'ItemType?',
        'ItemName',
        [],
        0, // Should be ItemPrice when determined
        '',
        true,
        [],
        0, // PrepTimeMinutes from food-item-class
        '',
        ''
      ),
      quantity: 1,
    },
  ];

  // Order subtotal from added items
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.quantity * item.menuItem.getTotalPrice(),
    0
  );

  // Fill these in later when we get the formula or amount.
  const additionalFees: number | null = null;
  const tax: number | null = null;

  // Total will stay 0 for values that are still TBD
  const total = subtotal + (additionalFees ?? 0) + (tax ?? 0);

  const handlePayNow = () => {
    console.log({
      cardNumber,
      expiry,
      cvc,
      cardholderName,
      country,
      address1,
      address2,
      city,
      zip,
      savePaymentInfo,
      orderItems: orderItems.map((item) => ({
        id: item.menuItem.getId(),
        name: item.menuItem.getName(),
        unitPrice: item.menuItem.getTotalPrice(),
        quantity: item.quantity,
      })),
      additionalFees,
      tax,
    });

    // Placeholder until we have button action
    alert('Payment button pressed');
  };

  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Fixed Header: Back button and screen title */}
      <View
        onLayout={handleHeaderLayout}
        style={[
          styles.fixedHeader,
          {
            backgroundColor: colors.background,
          },
        ]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[styles.backButton, { borderColor: colors.greenLight }]}
            onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={colors.greenLight} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.primaryText }]}>
            Order Summary
          </Text>
        </View>
      </View>

      {/* Scrollable Content: Everything except the Order Summary header */}
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Spacer so content starts below fixed header */}
        <View style={{ height: headerHeight + 16 }} />

        {/* Order Summary: Nice neat display of cart Items hopefully */}
        <View style={styles.itemsSection}>
          {orderItems.map((item) => (
            <View key={item.menuItem.getId()} style={styles.itemRow}>
              <Text style={[styles.itemText, { color: colors.primaryText }]}>
                {item.quantity}x
              </Text>

              <View style={styles.itemInfo}>
                <Text style={[styles.itemText, { color: colors.primaryText }]}>
                  {item.menuItem.getName()}
                </Text>
                <Text style={[styles.subText, { color: colors.mutedText }]}>
                  ${item.menuItem.getTotalPrice().toFixed(2)} each
                </Text>
              </View>

              <Text style={[styles.itemText, { color: colors.primaryText }]}>
                ${(item.quantity * item.menuItem.getTotalPrice()).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Section Divider: Between item list and totals box */}
        <View
          style={[
            styles.sectionDivider,
            { borderBottomColor: colors.sectionDivider },
          ]}
        />

        {/* Totals Display: Subtotal, fees, tax, and final total */}
        <View
          style={[
            styles.summaryBox,
            { backgroundColor: colors.summaryBackground },
          ]}>
          {/* Number of items */}
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.summaryText }]}>
              {orderItems.length} Items
            </Text>
            <Text style={[styles.summaryValue, { color: colors.summaryText }]}>
              ${subtotal.toFixed(2)}
            </Text>
          </View>

          {/* Subtotal */}
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.summaryText }]}>
              Subtotal:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.summaryText }]}>
              ${subtotal.toFixed(2)}
            </Text>
          </View>

          {/* Additional fees placeholder */}
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.summaryText }]}>
              Additional Fees:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.summaryText }]}>
              TBD
            </Text>
          </View>

          {/* Tax placeholder */}
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.summaryText }]}>
              Tax:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.summaryText }]}>
              TBD
            </Text>
          </View>

          <View style={styles.totalDivider} />

          {/* Final amount due */}
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.summaryText }]}>
              Total Payment Due:
            </Text>
            <Text style={[styles.totalValue, { color: colors.summaryText }]}>
              ${total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Section Divider between order summary and payment method */}
        <View
          style={[
            styles.sectionDivider,
            { borderBottomColor: colors.sectionDivider },
          ]}
        />

        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
          Payment Method
        </Text>

        {/* Payment Method: Selected card option */}
        <View style={styles.paymentMethodRow}>
          <View
            style={[
              styles.radioOuter,
              { borderColor: isDark ? colors.white : colors.black },
            ]}>
            <View
              style={[
                styles.radioInner,
                { backgroundColor: isDark ? colors.white : colors.black },
              ]}
            />
          </View>
          <Text style={[styles.radioLabel, { color: colors.primaryText }]}>
            Card
          </Text>
        </View>

        <Text style={[styles.label, { color: colors.primaryText }]}>
          Card Information
        </Text>

        {/* Card number */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
              color: colors.secondaryText,
            },
          ]}
          placeholder="1234 1234 1234 1234"
          placeholderTextColor={colors.placeholderText}
          value={cardNumber}
          onChangeText={(text) => setCardNumber(formatCardNumber(text))}
          keyboardType="number-pad"
          inputMode="numeric"
          autoCorrect={false}
          autoCapitalize="none"
          maxLength={19}
        />

        {/* Month/Year and CVC */}
        <View style={styles.row}>
          {/* Month/Year */}
          <TextInput
            style={[
              styles.input,
              styles.halfInput,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.secondaryText,
              },
            ]}
            placeholder="MM / YY"
            placeholderTextColor={colors.placeholderText}
            value={expiry}
            onChangeText={(text) => setExpiry(formatExpiry(text))}
            keyboardType="number-pad"
            inputMode="numeric"
            autoCorrect={false}
            autoCapitalize="none"
            maxLength={5}
          />

          {/* CVC */}
          <TextInput
            style={[
              styles.input,
              styles.halfInput,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.secondaryText,
              },
            ]}
            placeholder="CVC"
            placeholderTextColor={colors.placeholderText}
            value={cvc}
            onChangeText={(text) => setCvc(formatCvc(text))}
            keyboardType="number-pad"
            inputMode="numeric"
            autoCorrect={false}
            autoCapitalize="none"
            maxLength={3}
          />
        </View>

        <Text style={[styles.label, { color: colors.primaryText }]}>
          Cardholder Name
        </Text>

        {/* Full name on card */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
              color: colors.secondaryText,
            },
          ]}
          placeholder="Full name on card"
          placeholderTextColor={colors.placeholderText}
          value={cardholderName}
          onChangeText={setCardholderName}
          autoCorrect={false}
        />

        <Text style={[styles.label, { color: colors.primaryText }]}>
          Billing Address
        </Text>

        {/* Country */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
              color: colors.secondaryText,
            },
          ]}
          placeholder="Country"
          placeholderTextColor={colors.placeholderText}
          value={country}
          onChangeText={setCountry}
        />

        {/* Address line 1 */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
              color: colors.secondaryText,
            },
          ]}
          placeholder="Address Line 1"
          placeholderTextColor={colors.placeholderText}
          value={address1}
          onChangeText={setAddress1}
        />

        {/* Address line 2 */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
              color: colors.secondaryText,
            },
          ]}
          placeholder="Address Line 2"
          placeholderTextColor={colors.placeholderText}
          value={address2}
          onChangeText={setAddress2}
        />

        {/* City and ZIP */}
        <View style={styles.row}>
          {/* City */}
          <TextInput
            style={[
              styles.input,
              styles.halfInput,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.secondaryText,
              },
            ]}
            placeholder="City"
            placeholderTextColor={colors.placeholderText}
            value={city}
            onChangeText={setCity}
          />

          {/* ZIP */}
          <TextInput
            style={[
              styles.input,
              styles.halfInput,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.secondaryText,
              },
            ]}
            placeholder="ZIP"
            placeholderTextColor={colors.placeholderText}
            value={zip}
            onChangeText={(text) => setZip(formatZip(text))}
            keyboardType="number-pad"
            inputMode="numeric"
            autoCorrect={false}
            autoCapitalize="none"
            maxLength={5}
          />
        </View>

        {/* Save payment information checkbox */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setSavePaymentInfo(!savePaymentInfo)}>
          <View
            style={[
              styles.checkbox,
              {
                borderColor: colors.inputBorder,
                backgroundColor: 'transparent',
              },
              savePaymentInfo && styles.checkboxChecked,
            ]}>
            {savePaymentInfo && (
              <Ionicons name="checkmark" size={16} color={colors.white} />
            )}
          </View>

          <Text style={[styles.checkboxLabel, { color: colors.primaryText }]}>
            Save my payment information
          </Text>
        </TouchableOpacity>

        {/* Section Divider before payment action */}
        <View
          style={[
            styles.sectionDivider,
            { borderBottomColor: colors.sectionDivider },
          ]}
        />

        {/* Security Note: Payment encryption message from design */}
        <Text style={[styles.encryptedText, { color: colors.primaryText }]}>
          Your payment information is encrypted
        </Text>

        {/* Submit payment button */}
        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: colors.green }]}
          onPress={handlePayNow}>
          <Text style={[styles.payButtonText, { color: colors.white }]}>
            Pay Now
          </Text>
        </TouchableOpacity>

        {/* Footer: Payment provider */}
        <Text style={[styles.poweredText, { color: colors.primaryText }]}>
          Powered by <Text style={styles.poweredBold}>stripe</Text>
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    fontFamily: Fonts?.serif,
    letterSpacing: 0.2,
  },
  itemsSection: {
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  itemText: {
    fontSize: 16,
    fontFamily: Fonts?.sans,
  },
  subText: {
    fontSize: 14,
    marginTop: 2,
    fontStyle: 'italic',
    fontFamily: Fonts?.sans,
  },
  summaryBox: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: Fonts?.sans,
  },
  summaryValue: {
    fontSize: 16,
    fontStyle: 'italic',
    fontFamily: Fonts?.sans,
  },
  totalDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#91B78B',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: Fonts?.sans,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'italic',
    fontFamily: Fonts?.sans,
  },
  sectionDivider: {
    borderBottomWidth: 1,
    marginVertical: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    fontFamily: Fonts?.sans,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    fontSize: 16,
    fontFamily: Fonts?.sans,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 6,
    fontFamily: Fonts?.sans,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 14,
    fontFamily: Fonts?.sans,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#4D8B3B',
    borderColor: '#4D8B3B',
  },
  checkboxLabel: {
    fontSize: 16,
    fontFamily: Fonts?.sans,
  },
  encryptedText: {
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 16,
    fontFamily: Fonts?.sans,
  },
  payButton: {
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    marginHorizontal: 18,
  },
  payButtonText: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: Fonts?.sans,
  },
  poweredText: {
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 30,
    fontSize: 14,
    fontFamily: Fonts?.sans,
  },
  poweredBold: {
    fontWeight: '700',
    fontFamily: Fonts?.sans,
  },
});