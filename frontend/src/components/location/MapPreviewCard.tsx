import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { AppIcon, Icons } from "@/components/ui/AppIcon";
import { GlassCard } from "@/components/ui/GlassCard";
import { colors, spacing, typography } from "@/theme";
import type { Coordinates } from "@/services/location/types";

interface MapPreviewCardProps {
  coords: Coordinates | null;
  storeName?: string;
}

/** Static map-style preview — swap for react-native-maps in production */
export function MapPreviewCard({ coords, storeName }: MapPreviewCardProps) {
  return (
    <GlassCard style={styles.wrap} intensity={35}>
      <LinearGradient
        colors={["rgba(91,141,239,0.25)", "rgba(6,11,20,0.9)"]}
        style={styles.map}
      >
        <View style={styles.pin}>
          <AppIcon name={Icons.storefront} size={20} color={colors.gold} />
        </View>
        <View style={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={`grid-${i}`} style={styles.gridLine} />
          ))}
        </View>
      </LinearGradient>
      <View style={styles.footer}>
        <Text style={styles.label}>
          {storeName ? `Near ${storeName}` : "Your area"}
        </Text>
        {coords ? (
          <Text style={styles.coords}>
            {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
          </Text>
        ) : (
          <Text style={styles.coords}>Waiting for GPS…</Text>
        )}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: "hidden", marginBottom: spacing.md },
  map: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  pin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.goldSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.gold,
    zIndex: 2,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    flexWrap: "wrap",
    opacity: 0.15,
  },
  gridLine: {
    width: "33.33%",
    height: "50%",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.text,
  },
  footer: {
    padding: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { ...typography.caption, color: colors.text },
  coords: { ...typography.micro, color: colors.textMuted },
});
