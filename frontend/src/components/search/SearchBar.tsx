import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = "Search stores — Amazon, Walmart…",
  autoFocus = true,
}: SearchBarProps) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={20} color={colors.textMuted} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="search"
        autoFocus={autoFocus}
        clearButtonMode="never"
      />
      {value.length > 0 ? (
        <Pressable onPress={onClear} hitSlop={12} style={styles.clearBtn}>
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  icon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  clearBtn: { marginLeft: spacing.sm },
});
