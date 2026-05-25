import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon, Icons } from "@/components/ui/AppIcon";
import { GlassCard } from "@/components/ui/GlassCard";
import { colors, spacing, typography } from "@/theme";
import type { LocationPermissionStatus } from "@/services/location";
import { formatDistance } from "@/services/location";

interface LocationStatusBarProps {
  permission: LocationPermissionStatus;
  isLoading: boolean;
  storeCount: number;
  closestName?: string;
  closestDistanceM?: number;
  onRequestPermission?: () => void;
  onRefresh?: () => void;
}

export function LocationStatusBar({
  permission,
  isLoading,
  storeCount,
  closestName,
  closestDistanceM,
  onRequestPermission,
  onRefresh,
}: LocationStatusBarProps) {
  let message = "Detecting nearby stores…";
  if (permission === "denied") {
    message = "Location off — enable to find stores near you";
  } else if (!isLoading && storeCount > 0 && closestName) {
    message = `${storeCount} nearby · Closest: ${closestName}${
      closestDistanceM != null ? ` (${formatDistance(closestDistanceM)})` : ""
    }`;
  } else if (!isLoading && storeCount === 0) {
    message = "No supported stores in range — try a larger radius";
  }

  return (
    <GlassCard style={styles.card} intensity={40}>
      <View style={styles.row}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <AppIcon name={Icons.storefront} size={16} color={colors.accent} />
        )}
        <Text style={styles.text} numberOfLines={2}>
          {message}
        </Text>
        {permission === "denied" && onRequestPermission ? (
          <Pressable onPress={onRequestPermission} hitSlop={8}>
            <Text style={styles.action}>Enable</Text>
          </Pressable>
        ) : onRefresh ? (
          <Pressable onPress={onRefresh} hitSlop={8}>
            <Text style={styles.action}>Refresh</Text>
          </Pressable>
        ) : null}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.sm + 2, marginBottom: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  text: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  action: { ...typography.caption, color: colors.primary, fontWeight: "600" },
});
