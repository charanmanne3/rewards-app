import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CreditCardCatalogRow } from "@/components/cards/CreditCardCatalogRow";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ApiError } from "@/services/api";
import { useCardsWithRewards } from "@/services/queries";
import { colors, spacing, typography } from "@/theme";

export default function CardsScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useCardsWithRewards();

  if (isLoading) return <LoadingState message="Loading credit cards..." />;

  if (isError) {
    const message = error instanceof ApiError ? error.message : "Failed to load cards";
    return <ErrorState message={message} onRetry={() => refetch()} />;
  }

  const cards = data ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Text style={styles.subtitle}>
        All supported cards with active cashback categories and reward types
      </Text>
      <FlatList
        data={cards}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CreditCardCatalogRow
            card={item}
            onStorePress={(storeName) =>
              router.push({
                pathname: "/stores",
                params: { q: storeName },
              })
            }
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No cards in catalog</Text>}
      />
    </SafeAreaView>
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
  empty: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xxl,
  },
});
