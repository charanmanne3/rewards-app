import { useEffect } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { colors, radius, spacing } from "@/theme";

interface ShimmerSkeletonProps {
  count?: number;
  height?: number;
  style?: ViewStyle;
}

export function ShimmerSkeleton({ count = 3, height = 112, style }: ShimmerSkeletonProps) {
  return (
    <View style={[styles.wrap, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <ShimmerBlock key={i} height={height} delay={i * 100} />
      ))}
    </View>
  );
}

function ShimmerBlock({ height, delay }: { height: number; delay: number }) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withRepeat(
        withTiming(0.75, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay, opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.block, { height }, animStyle]}>
      <View style={styles.lineWide} />
      <View style={styles.lineMed} />
      <View style={styles.lineShort} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  block: {
    backgroundColor: colors.glass,
    borderRadius: radius.xl,
    padding: spacing.md,
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  lineWide: {
    width: "52%",
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.surfaceHover,
  },
  lineMed: {
    width: "34%",
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceHover,
  },
  lineShort: {
    width: "22%",
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceHover,
  },
});
