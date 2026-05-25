import { ReactNode } from "react";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

interface FadeInViewProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down";
}

export function FadeInView({ children, delay = 0, direction = "up" }: FadeInViewProps) {
  const entering =
    direction === "down"
      ? FadeInDown.delay(delay).springify().damping(18)
      : FadeInUp.delay(delay).springify().damping(18);

  return <Animated.View entering={entering}>{children}</Animated.View>;
}
