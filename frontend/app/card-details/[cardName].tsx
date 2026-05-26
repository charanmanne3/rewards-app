import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icons, AppIcon } from "@/components/ui/AppIcon";
import { colors, radius, spacing, typography } from "@/theme";
import { ErrorView } from "@/components/ErrorView";

type Params = {
  cardName?: string;
  rewardCategory?: string;
  rewardRate?: string;
  annualFee?: string;
};

function parseAnnualFee(raw: string | undefined): number | null {
  if (!raw || raw === "null") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * Card details screen for recommendations.
 *
 * We display the recommendation fields passed via route params.
 */
export default function CardDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();

  const cardName = useMemo(() => {
    if (!params.cardName) return "";
    try {
      return decodeURIComponent(params.cardName);
    } catch {
      return params.cardName;
    }
  }, [params.cardName]);

  const rewardCategory = params.rewardCategory ?? "";
  const rewardRate = params.rewardRate ?? "";
  const annualFee = parseAnnualFee(params.annualFee);

  if (!cardName) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.safe}>
          <ErrorView message="Missing card details. Please go back and select a card." onRetry={() => router.back()} />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.9 }]}
            className="flex-row items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            accessibilityRole="button"
          >
            <AppIcon name={Icons.arrowBack} size={22} color={colors.text} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <GlassCard style={styles.card} intensity={42}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{cardName}</Text>
              <Text style={styles.meta} numberOfLines={2}>
                {rewardCategory || "Reward category"}
              </Text>
            </View>

            <View style={styles.bigRateRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionLabel}>Reward rate</Text>
                <Text style={styles.bigRate}>{rewardRate || "—"}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <View style={styles.footerRow}>
                <Text style={styles.footerLabel}>Annual fee</Text>
                <Text style={styles.footerValue}>
                  {annualFee === null ? "N/A" : `$${annualFee}`}
                </Text>
              </View>
            </View>
          </GlassCard>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    width: 110,
  },
  backText: {
    ...typography.body,
    color: colors.textMuted,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  card: {
    padding: spacing.lg,
  },
  cardHeader: {},
  title: {
    ...typography.title,
    color: colors.text,
    fontSize: 24,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  bigRateRow: {
    marginTop: spacing.md,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  bigRate: {
    ...typography.headline,
    color: colors.primary,
    fontSize: 38,
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    padding: spacing.md,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  footerValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: "700",
  },
});

