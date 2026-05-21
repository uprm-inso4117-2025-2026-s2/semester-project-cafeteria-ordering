import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { Colors, Typography } from '../constants/theme';
import { deleteMenuItem, MenuCategory, MenuItemData, updateMenuItem } from '../lib/menu';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type Props = {
  item: MenuItemData;
  categories: MenuCategory[];
  categoryName: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onUpdate: (updated: MenuItemData) => void;
  onDeleted: (id: string) => void;
};

export default function StaffMenuItemRow({
  item,
  categories,
  categoryName,
  isExpanded,
  onToggle,
  onUpdate,
  onDeleted,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editPrice, setEditPrice] = useState(String(item.price));
  const [editCategoryId, setEditCategoryId] = useState(item.category_id);
  const [editAvailable, setEditAvailable] = useState(item.available);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [toastMessage, setToastMessage] = useState('');
  const [toastIsSuccess, setToastIsSuccess] = useState(true);

  const showToast = (message: string, success: boolean, afterHide?: () => void) => {
    setToastMessage(message);
    setToastIsSuccess(success);
    toastOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(1300),
      Animated.timing(toastOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => {
      setToastMessage('');
      afterHide?.();
    });
  };

  const handleToggle = () => {
    if (isEditing) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle(item.id);
  };

  const startEdit = () => {
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditCategoryId(item.category_id);
    setEditAvailable(item.available);
    setEditError(null);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsEditing(false);
    setEditError(null);
  };

  const handleFinish = async () => {
    setEditError(null);
    if (!editName.trim()) {
      setEditError('Name is required.');
      return;
    }
    const parsedPrice = parseFloat(editPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setEditError('Price must be a valid non-negative number.');
      return;
    }
    if (!editCategoryId) {
      setEditError('Please select a category.');
      return;
    }
    try {
      setSaving(true);
      const updated = await updateMenuItem(item.id, {
        name: editName.trim(),
        price: parsedPrice,
        category_id: editCategoryId,
        available: editAvailable,
      });
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsEditing(false);
      onUpdate(updated);
      showToast('✓  Changes saved', true);
    } catch (e) {
      console.error('[StaffMenuItemRow] updateMenuItem error:', e);
      setEditError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteMenuItem(item.id);
      setShowDeleteConfirm(false);
      showToast('Item removed', false, () => onDeleted(item.id));
    } catch (e) {
      console.error('[StaffMenuItemRow] deleteMenuItem error:', e);
      setDeleting(false);
      setShowDeleteConfirm(false);
      showToast('Delete failed', false);
    }
  };

  return (
    <>
      <View style={styles.card}>
        {/* Header — always visible */}
        <Pressable style={styles.row} onPress={handleToggle}>
          <View style={styles.imagePlaceholder} />
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {!isEditing && (
            <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
          )}
        </Pressable>

        {/* Read-only expanded details */}
        {isExpanded && !isEditing && (
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price</Text>
              <Text style={styles.detailValue}>${Number(item.price).toFixed(2)}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{categoryName}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Availability</Text>
              <View style={[styles.badge, item.available ? styles.badgeAvailable : styles.badgeUnavailable]}>
                <Text style={[styles.badgeText, item.available ? styles.badgeTextAvailable : styles.badgeTextUnavailable]}>
                  {item.available ? 'Available' : 'Unavailable'}
                </Text>
              </View>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={[styles.detailValue, !item.description && styles.detailValueMuted]} numberOfLines={3}>
                {item.description ?? 'No description available'}
              </Text>
            </View>

            {/* Edit / Delete action buttons */}
            <View style={styles.actionRow}>
              <Pressable style={styles.editButton} onPress={startEdit}>
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
              <Pressable style={styles.deleteButton} onPress={() => setShowDeleteConfirm(true)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Inline edit form */}
        {isExpanded && isEditing && (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
              style={styles.editForm}
              contentContainerStyle={styles.editFormContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.editLabel}>Name</Text>
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Item name"
                placeholderTextColor={Colors.mutedGray}
                maxLength={255}
              />

              <Text style={styles.editLabel}>Price ($)</Text>
              <TextInput
                style={styles.editInput}
                value={editPrice}
                onChangeText={setEditPrice}
                placeholder="0.00"
                placeholderTextColor={Colors.mutedGray}
                keyboardType="decimal-pad"
              />

              <Text style={styles.editLabel}>Category</Text>
              <View style={styles.categoryRow}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryPill,
                      editCategoryId === cat.id && styles.categoryPillSelected,
                    ]}
                    onPress={() => setEditCategoryId(cat.id)}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        editCategoryId === cat.id && styles.categoryPillTextSelected,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.editLabel}>Availability</Text>
              <View style={styles.toggleRow}>
                <Pressable
                  style={[styles.toggleButton, editAvailable && styles.toggleButtonAvailable]}
                  onPress={() => setEditAvailable(true)}
                >
                  <Text style={[styles.toggleText, editAvailable && styles.toggleTextAvailable]}>
                    Available
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.toggleButton, !editAvailable && styles.toggleButtonUnavailable]}
                  onPress={() => setEditAvailable(false)}
                >
                  <Text style={[styles.toggleText, !editAvailable && styles.toggleTextUnavailable]}>
                    Unavailable
                  </Text>
                </Pressable>
              </View>

              {editError ? <Text style={styles.errorText}>{editError}</Text> : null}

              <View style={styles.editActions}>
                <Pressable style={styles.cancelEditButton} onPress={cancelEdit} disabled={saving}>
                  <Text style={styles.cancelEditText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.finishButton, saving && styles.finishButtonDisabled]}
                  onPress={handleFinish}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={Colors.light.secondaryText} />
                  ) : (
                    <Text style={styles.finishButtonText}>✓  Finish</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}

        {/* Toast confirmation overlay */}
        {toastMessage !== '' && (
          <Animated.View
            style={[
              styles.toast,
              toastIsSuccess ? styles.toastSuccess : styles.toastDelete,
              { opacity: toastOpacity },
            ]}
            pointerEvents="none"
          >
            <Text style={styles.toastText}>{toastMessage}</Text>
          </Animated.View>
        )}
      </View>

      {/* Delete confirmation modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => !deleting && setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmSheet}>
            <Text style={styles.confirmTitle}>Delete item?</Text>
            <Text style={styles.confirmMessage}>
              <Text style={styles.confirmItemName}>&quot;{item.name}&quot;</Text>
              {' '}will be permanently removed from the menu. This cannot be undone.
            </Text>
            <View style={styles.confirmActions}>
              <Pressable
                style={[styles.confirmCancelButton, deleting && styles.confirmButtonDisabled]}
                onPress={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmDeleteButton, deleting && styles.confirmButtonDisabled]}
                onPress={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmDeleteText}>Delete</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.pastelSage,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 10,
  },
  imagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 6,
    backgroundColor: Colors.primaryGreen,
  },
  name: {
    flex: 1,
    fontFamily: Typography.heading.fontFamily,
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.light.text,
  },
  chevron: {
    fontSize: 13,
    color: Colors.primaryGreen,
    paddingHorizontal: 4,
    fontWeight: '600',
  },

  // Read-only details
  details: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.softGray,
  },
  detailLabel: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.icon,
    flex: 1,
  },
  detailValue: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 14,
    color: Colors.light.text,
    flex: 2,
    textAlign: 'right',
  },
  detailValueMuted: {
    color: Colors.mutedGray,
    fontStyle: 'italic',
  },
  badge: {
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  badgeAvailable: {
    backgroundColor: '#E8F5E9',
  },
  badgeUnavailable: {
    backgroundColor: '#FFEBEE',
  },
  badgeText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  badgeTextAvailable: {
    color: Colors.primaryGreen,
  },
  badgeTextUnavailable: {
    color: '#C62828',
  },

  // Action buttons (Edit / Delete)
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  editButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.primaryGreen,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editButtonText: {
    fontFamily: Typography.button.fontFamily,
    fontWeight: '600',
    fontSize: 14,
    color: Colors.primaryGreen,
  },
  deleteButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E53935',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontFamily: Typography.button.fontFamily,
    fontWeight: '600',
    fontSize: 14,
    color: '#E53935',
  },

  // Edit form
  editForm: {
    backgroundColor: Colors.light.background,
    maxHeight: 480,
  },
  editFormContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  editLabel: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.icon,
    marginTop: 14,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editInput: {
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
    fontWeight: '600',
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
  toggleButtonAvailable: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  toggleButtonUnavailable: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  toggleText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 14,
    color: Colors.light.text,
  },
  toggleTextAvailable: {
    color: Colors.light.secondaryText,
    fontWeight: '600',
  },
  toggleTextUnavailable: {
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 13,
    color: '#E53935',
    marginTop: 10,
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  cancelEditButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.mutedGray,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelEditText: {
    fontFamily: Typography.button.fontFamily,
    fontWeight: '600',
    fontSize: 15,
    color: Colors.light.text,
  },
  finishButton: {
    flex: 2,
    backgroundColor: Colors.primaryGreen,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  finishButtonDisabled: {
    opacity: 0.6,
  },
  finishButtonText: {
    fontFamily: Typography.button.fontFamily,
    fontWeight: '700',
    fontSize: 15,
    color: Colors.light.secondaryText,
  },

  // Toast overlay
  toast: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastSuccess: {
    backgroundColor: 'rgba(46,125,50,0.88)',
  },
  toastDelete: {
    backgroundColor: 'rgba(229,57,53,0.88)',
  },
  toastText: {
    fontFamily: Typography.button.fontFamily,
    fontWeight: '700',
    fontSize: 17,
    color: '#fff',
    letterSpacing: 0.3,
  },

  // Delete confirmation modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  confirmSheet: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    width: '100%',
  },
  confirmTitle: {
    fontFamily: Typography.heading.fontFamily,
    fontWeight: 'bold',
    fontSize: 20,
    color: Colors.light.text,
    marginBottom: 10,
  },
  confirmMessage: {
    fontFamily: Typography.body.fontFamily,
    fontSize: 15,
    color: Colors.light.icon,
    lineHeight: 22,
    marginBottom: 24,
  },
  confirmItemName: {
    fontWeight: '600',
    color: Colors.light.text,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.mutedGray,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontFamily: Typography.button.fontFamily,
    fontWeight: '600',
    fontSize: 15,
    color: Colors.light.text,
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: '#E53935',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmDeleteText: {
    fontFamily: Typography.button.fontFamily,
    fontWeight: '700',
    fontSize: 15,
    color: '#fff',
  },
});
