import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { createMenuItem, CreateMenuItemInput, MenuCategory, MenuItemData } from '@/lib/menu';

type Props = {
  visible: boolean;
  categories: MenuCategory[];
  onClose: () => void;
  onCreated: (item: MenuItemData) => void;
};

export default function NewMenuItemModal({ visible, categories, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [available, setAvailable] = useState(true);
  const [allergens, setAllergens] = useState('');
  const [prepTime, setPrepTime] = useState('10');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setPrice('');
    setCategoryId('');
    setAvailable(true);
    setAllergens('');
    setPrepTime('10');
    setImageUrl('');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Price must be a valid non-negative number.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }
    const parsedPrep = parseInt(prepTime, 10);
    if (prepTime && (isNaN(parsedPrep) || parsedPrep <= 0)) {
      setError('Prep time must be a positive number.');
      return;
    }

    const input: CreateMenuItemInput = {
      name: name.trim(),
      price: parsedPrice,
      category_id: categoryId,
      available,
      allergens: allergens.trim()
        ? allergens.split(',').map((a) => a.trim()).filter(Boolean)
        : null,
      prep_time_minutes: prepTime ? parsedPrep : 10,
      image_url: imageUrl.trim() || null,
    };

    try {
      setSubmitting(true);
      const newItem = await createMenuItem(input);
      reset();
      onCreated(newItem);
    } catch (e) {
      console.error('[NewMenuItemModal] createMenuItem error:', e);
      setError('Failed to create item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>New Menu Item</Text>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Grilled Chicken Sandwich"
              placeholderTextColor={Colors.mutedGray}
              maxLength={255}
            />

            <Text style={styles.label}>Price ($) *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              placeholderTextColor={Colors.mutedGray}
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryRow}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[styles.categoryPill, categoryId === cat.id && styles.categoryPillSelected]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      categoryId === cat.id && styles.categoryPillTextSelected,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Availability</Text>
            <View style={styles.toggleRow}>
              <Pressable
                style={[styles.toggleButton, available && styles.toggleButtonActive]}
                onPress={() => setAvailable(true)}
              >
                <Text style={[styles.toggleText, available && styles.toggleTextActive]}>
                  In Stock
                </Text>
              </Pressable>
              <Pressable
                style={[styles.toggleButton, !available && styles.toggleButtonActive]}
                onPress={() => setAvailable(false)}
              >
                <Text style={[styles.toggleText, !available && styles.toggleTextActive]}>
                  Out of Stock
                </Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Prep Time (minutes)</Text>
            <TextInput
              style={styles.input}
              value={prepTime}
              onChangeText={setPrepTime}
              placeholder="10"
              placeholderTextColor={Colors.mutedGray}
              keyboardType="number-pad"
            />

            <Text style={styles.label}>Allergens (comma-separated)</Text>
            <TextInput
              style={styles.input}
              value={allergens}
              onChangeText={setAllergens}
              placeholder="e.g. gluten, dairy, nuts"
              placeholderTextColor={Colors.mutedGray}
            />

            <Text style={styles.label}>Image URL (optional)</Text>
            <TextInput
              style={styles.input}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://..."
              placeholderTextColor={Colors.mutedGray}
              autoCapitalize="none"
              keyboardType="url"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={handleClose} disabled={submitting}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={Colors.light.secondaryText} />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  title: {
    fontFamily: Typography.heading.fontFamily,
    fontWeight: 'bold',
    fontSize: 20,
    color: Colors.light.text,
    marginBottom: 16,
  },
  label: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.mutedGray,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontFamily: Typography.body.fontFamily,
    fontSize: 15,
    color: Colors.light.text,
    backgroundColor: '#fff',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    borderWidth: 1,
    borderColor: Colors.mutedGray,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  categoryPillSelected: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  categoryPillText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
    color: Colors.light.text,
  },
  categoryPillTextSelected: {
    color: Colors.light.secondaryText,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.mutedGray,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  toggleText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 14,
    color: Colors.light.text,
  },
  toggleTextActive: {
    color: Colors.light.secondaryText,
    fontWeight: '600',
  },
  errorText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
    color: '#E53935',
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.mutedGray,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: Typography.button.fontFamily,
    fontWeight: '600',
    fontSize: 15,
    color: Colors.light.text,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primaryGreen,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontFamily: Typography.button.fontFamily,
    fontWeight: '600',
    fontSize: 15,
    color: Colors.light.secondaryText,
  },
});
