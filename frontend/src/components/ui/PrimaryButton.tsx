import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

import { AppIcon, Icons, type IconName } from "@/components/ui/AppIcon";
import { colors, radius, shadow, spacing, typography } from "@/theme";
import { hapticLight } from "@/utils/haptics";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: IconName;
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  icon = Icons.storefront,
  style,
}: PrimaryButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed, style]}
      onPress={() => {
        hapticLight();
        onPress();
      }}
    >
      <LinearGradient
        colors={["#1E3A6E", "#152A52"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.inner}>
          <View style={styles.iconBadge}>
            <AppIcon name={icon} size={20} color={colors.gold} />
          </View>
          <Text style={styles.label}>{label}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadow.soft,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  gradient: {
    borderRadius: radius.xl,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.goldSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...typography.headline,
    color: colors.text,
    fontSize: 17,
    letterSpacing: -0.3,
  },
});
