import { StyleSheet, View } from "react-native";

import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import { spacing } from "@/theme";

export function RecommendationSkeleton() {
  return (
    <View style={styles.wrap}>
      <ShimmerSkeleton height={168} style={styles.hero} />
      <ShimmerSkeleton count={2} height={88} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  hero: { marginBottom: spacing.sm },
});
