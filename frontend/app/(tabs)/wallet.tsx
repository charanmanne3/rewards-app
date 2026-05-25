import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icons } from "@/components/ui/AppIcon";
import { ErrorState } from "@/components/ui/ErrorState";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { ApiError } from "@/services/api";
import { usePromotionalOffers } from "@/services/queries";
import { colors, radius, spacing, typography } from "@/theme";
import type { PromotionalOffer } from "@/types/models";
import { dedupeOffers, offerRowKey } from "@/utils/listKeys";
import { hapticSelect } from "@/utils/haptics";

export default function WalletScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = usePromotionalOffers();
  const offers = dedupeOffers(data ?? []);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Wallet</Text>
          <Text style={styles.subtitle}>Live offers across your cards</Text>
        </View>

        {isLoading ? (
          <View style={styles.pad}>
            <CardSkeleton count={4} />
          </View>
        ) : isError ? (
          <View style={styles.pad}>
            <ErrorState
              message={error instanceof ApiError ? error.message : "Failed to load offers"}
              onRetry={() => refetch()}
            />
          </View>
        ) : (
          <FlatList
            data={offers}
            keyExtractor={(item) => offerRowKey(item)}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                icon={Icons.wallet}
                title="No active offers"
                message="Promotional rewards will appear here when available."
              />
            }
            renderItem={({ item }) => (
              <OfferRow
                offer={item}
                onPress={() => {
                  hapticSelect();
                  router.push({
                    pathname: "/(tabs)/search",
                    params: { q: item.store_name },
                  });
                }}
              />
            )}
          />
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

function OfferRow({ offer, onPress }: { offer: PromotionalOffer; onPress: () => void }) {
  if (!offer?.store_name) return null;

  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Text style={styles.store}>{offer.store_name}</Text>
        <Text style={styles.card}>{offer.card_name ?? "Card"}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.pct}>{offer.cashback_percent ?? 0}%</Text>
        {offer.end_date ? (
          <Text style={styles.expires}>Until {offer.end_date}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.subhead, color: colors.textMuted, marginTop: 4 },
  pad: { paddingHorizontal: spacing.screen },
  list: { paddingHorizontal: spacing.screen, paddingBottom: spacing.xxl, gap: spacing.sm },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  pressed: { opacity: 0.88 },
  rowLeft: { flex: 1 },
  store: { ...typography.headline, color: colors.text, fontSize: 16 },
  card: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  rowRight: { alignItems: "flex-end" },
  pct: { ...typography.cashback, fontSize: 22, color: colors.accent },
  expires: { ...typography.caption, color: colors.textMuted, fontSize: 11, marginTop: 2 },
});
