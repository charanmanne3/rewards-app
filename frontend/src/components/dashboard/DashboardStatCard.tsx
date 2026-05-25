import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";

interface DashboardStatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
  accent?: string;
}

export function DashboardStatCard({
  icon,
  label,
  value,
  onPress,
  accent = colors.gold,
}: DashboardStatCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 50, bounciness: 0 }),
      Animated.timing(opacity, { toValue: 0.82, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }),
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={animateIn}
      onPressOut={animateOut}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value}`}
      style={styles.hit}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }], opacity }]}>
        <View style={[styles.iconBadge, { backgroundColor: `${accent}22` }]}>
          <Ionicons name={icon} size={18} color={accent} />
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={styles.chevron} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { flex: 1 },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    minHeight: 108,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  value: {
    ...typography.title,
    color: colors.text,
    fontSize: 18,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
  },
});
