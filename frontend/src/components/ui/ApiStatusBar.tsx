import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon, Icons } from "@/components/ui/AppIcon";
import { colors, radius, spacing, typography } from "@/theme";
import type { ApiHealthResponse } from "@/types/models";
import { hapticLight } from "@/utils/haptics";

interface ApiStatusBarProps {
  health: ApiHealthResponse | undefined;
  isLoading?: boolean;
  isError?: boolean;
  isStale?: boolean;
  onRefresh?: () => void;
}

export function ApiStatusBar({
  health,
  isLoading,
  isError,
  isStale,
  onRefresh,
}: ApiStatusBarProps) {
  const reachable = !isError && health != null;
  const online = reachable && (health.status === "ok" || health.status === "degraded");
  const degraded = health?.status === "degraded";
  const dotColor = online
    ? degraded
      ? colors.gold
      : colors.accent
    : isError
      ? colors.error
      : colors.textMuted;
  const label = isLoading
    ? "Syncing offers…"
    : online
      ? degraded
        ? `Connected · DB ${health.database} · v${health.version}`
        : `Live · v${health?.version ?? "—"}`
      : health?.version === "mock"
        ? "Demo mode · mock data"
      : isStale
        ? "Offline · showing cached"
        : "API unavailable";

  const enabledProviders =
    health?.providers.filter((p) => p.enabled).map((p) => p.display_name).join(", ") ?? "";

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={styles.label}>{label}</Text>
        {onRefresh ? (
          <Pressable
            onPress={() => {
              hapticLight();
              onRefresh();
            }}
            hitSlop={8}
            style={styles.refreshBtn}
          >
            <AppIcon name={Icons.time} size={14} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>
      {enabledProviders && online ? (
        <Text style={styles.sub} numberOfLines={1}>
          Sources: {enabledProviders}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.glass,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    fontWeight: "500",
  },
  sub: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    marginLeft: 16,
  },
  refreshBtn: {
    padding: 4,
  },
});
