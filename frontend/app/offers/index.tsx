import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ApiError } from "@/services/api";
import { usePromotionalOffers } from "@/services/queries";
import { colors, radius, spacing, typography } from "@/theme";
import type { PromotionalOffer } from "@/types/models";

function formatExpiry(iso: string | null): string {
  if (!iso) return "No expiration";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function OffersScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = usePromotionalOffers();

  if (isLoading) return <LoadingState message="Loading live offers..." />;

  if (isError) {
    const message = error instanceof ApiError ? error.message : "Failed to load offers";
    return <ErrorState message={message} onRetry={() => refetch()} />;
  }

  const offers = data ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Text style={styles.subtitle}>Active promotional rewards with expiration dates</Text>
      <FlatList
        data={offers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <PromotionalOfferCard
            offer={item}
            onPress={() =>
              router.push({
                pathname: "/stores",
                params: { q: item.store_name },
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="flash-off-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No live promotional offers</Text>
            <Text style={styles.emptyText}>Check back later or add offers in admin.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function PromotionalOfferCard({
  offer,
  onPress,
}: {
  offer: PromotionalOffer;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.cardTop}>
        <View style={styles.flashBadge}>
          <Ionicons name="flash" size={12} color={colors.accent} />
          <Text style={styles.flashText}>PROMO</Text>
        </View>
        <Text style={styles.pct}>{offer.cashback_percent}%</Text>
      </View>
      <Text style={styles.store}>{offer.store_name}</Text>
      <Text style={styles.cardName}>{offer.card_name}</Text>
      <Text style={styles.issuer}>{offer.issuer}</Text>
      <View style={styles.expiryRow}>
        <Ionicons name="time-outline" size={14} color={colors.gold} />
        <Text style={styles.expiry}>Expires {formatExpiry(offer.end_date)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  flashBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  flashText: {
    ...typography.micro,
    color: colors.accent,
  },
  pct: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.accent,
  },
  store: {
    ...typography.subtitle,
    color: colors.text,
  },
  cardName: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  issuer: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  expiryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  expiry: {
    ...typography.caption,
    color: colors.gold,
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: spacing.xxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
});
