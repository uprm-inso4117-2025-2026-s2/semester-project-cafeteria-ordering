import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type ConfirmationModeProps = {
  visible: boolean;
  orderNumber: number;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirmCancel: (reason?: string) => void;
  onGoBack: () => void;
};

export default function ConfirmationMode({
  visible,
  orderNumber,
  reason,
  onReasonChange,
  onConfirmCancel,
  onGoBack,
}: ConfirmationModeProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.confirmationOverlay}>
        <View style={styles.confirmationCard}>
          <Text style={styles.confirmationTitle}>
            Close Order #{orderNumber}?
          </Text>

          <Text style={styles.confirmationMessage}>
            This action will close the order. Please confirm only if this order is ready or
            should no longer be prepared.
          </Text>

          <TextInput
            value={reason}
            onChangeText={onReasonChange}
            placeholder="Optional reason for closing"
            placeholderTextColor="#8a8a8a"
            style={styles.reasonInput}
            multiline
          />

          <View style={styles.confirmationActions}>
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.goBackButton}
              onPress={onGoBack}
            >
              <Text style={styles.goBackButtonText}>Go back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.confirmCancelButton}
              onPress={() => onConfirmCancel(reason.trim() || undefined)}
            >
              <Text style={styles.confirmCancelButtonText}>
                Confirm close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  confirmationOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  confirmationCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 22,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },

  confirmationTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },

  confirmationMessage: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
    textAlign: "center",
    marginTop: 12,
  },

  reasonInput: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    marginTop: 18,
    textAlignVertical: "top",
    backgroundColor: "#f9fafb",
  },

  confirmationActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  goBackButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
  },

  goBackButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  confirmCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#dc2626",
    alignItems: "center",
  },

  confirmCancelButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
});