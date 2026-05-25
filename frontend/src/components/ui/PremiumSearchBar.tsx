import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { AppIcon, Icons } from "@/components/ui/AppIcon";
import { colors, radius, shadow, spacing, typography } from "@/theme";

interface PremiumSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  onSubmit?: () => void;
  placeholder?: string;
  large?: boolean;
  floating?: boolean;
  autoFocus?: boolean;
}

export function PremiumSearchBar({
  value,
  onChangeText,
  onClear,
  onSubmit,
  placeholder = "Search stores",
  large = false,
  floating = false,
  autoFocus = false,
}: PremiumSearchBarProps) {
  return (
    <View
      style={[
        styles.wrap,
        large && styles.wrapLarge,
        floating && styles.wrapFloating,
        shadow.soft,
      ]}
    >
      <AppIcon
        name={Icons.search}
        size={large ? 22 : 20}
        color={colors.textMuted}
      />
      <TextInput
        style={[styles.input, large && styles.inputLarge]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
      />
      {value.length > 0 && onClear ? (
        <Pressable onPress={onClear} hitSlop={12}>
          <AppIcon name={Icons.closeCircle} size={20} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  wrapLarge: {
    minHeight: 54,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
  },
  wrapFloating: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  inputLarge: {
    fontSize: 17,
    fontWeight: "400",
  },
});
