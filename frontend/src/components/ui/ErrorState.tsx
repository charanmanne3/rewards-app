import { AppIcon, Icons } from "@/components/ui/AppIcon";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";
import { hapticLight } from "@/utils/haptics";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.wrap}>
      <AppIcon name={Icons.cloudOffline} size={28} color={colors.error} />
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable
          style={styles.btn}
          onPress={() => {
            hapticLight();
            onRetry();
          }}
        >
          <Text style={styles.btnText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    padding: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.errorSoft,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  message: { ...typography.subhead, color: colors.error, textAlign: "center" },
  btn: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.glass,
    borderRadius: radius.full,
  },
  btnText: { ...typography.headline, color: colors.text, fontSize: 15 },
});
