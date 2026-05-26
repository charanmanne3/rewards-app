import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radius, spacing, typography } from "@/theme";

export type CategoryOption = { label: string; value: string };

interface CategoryDropdownProps {
  value: string;
  options: CategoryOption[];
  onChange: (value: string) => void;
}

/**
 * Simple category dropdown implemented via a modal.
 *
 * Using a custom component keeps dependencies small and works across iOS sizes.
 */
export function CategoryDropdown({ value, options, onChange }: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    return options.find((o) => o.value === value)?.label ?? value;
  }, [options, value]);

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.trigger, pressed && { opacity: 0.9 }]}
        className="flex-row items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Select category"
      >
        <Text style={styles.triggerText}>{selectedLabel}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View
          style={styles.sheet}
          className="absolute left-3 right-3 top-24 rounded-3xl border border-white/10 bg-[#0D1526] px-6 py-6"
        >
          <Text style={styles.sheetTitle}>Select category</Text>
          <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 12 }}>
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <Pressable
                  key={opt.value}
                  style={({ pressed }) => [
                    styles.row,
                    isSelected && styles.rowSelected,
                    pressed && { opacity: 0.95 },
                  ]}
                  className={isSelected ? "bg-[#1A3A6B]/30" : "bg-transparent"}
                  onPress={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.rowText, isSelected && styles.rowTextSelected]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable
            style={styles.closeBtn}
            className="mt-4 items-center rounded-xl border border-white/10 bg-white/5 px-6 py-3"
            onPress={() => setOpen(false)}
          >
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  triggerText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    paddingRight: 12,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 16,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 120,
    borderRadius: radius.xl,
    backgroundColor: colors.backgroundElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    padding: spacing.lg,
  },
  sheetTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.md,
  },
  list: {
    maxHeight: 420,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: radius.lg,
    backgroundColor: "transparent",
  },
  rowSelected: {
    backgroundColor: colors.primarySoft,
  },
  rowText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 15,
  },
  rowTextSelected: {
    color: colors.text,
    fontWeight: "600",
  },
  closeBtn: {
    marginTop: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    alignItems: "center",
  },
  closeText: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },
});

