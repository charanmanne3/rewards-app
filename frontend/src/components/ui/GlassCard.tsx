import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";

import { colors, radius } from "@/theme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  blur?: boolean;
}

export function GlassCard({ children, style, intensity = 40, blur = true }: GlassCardProps) {
  if (blur && Platform.OS !== "web") {
    return (
      <View style={[styles.wrap, style]}>
        <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.overlay} />
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  return <View style={[styles.wrap, styles.fallback, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  fallback: {
    backgroundColor: colors.glass,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  content: {
    position: "relative",
    zIndex: 1,
  },
});
