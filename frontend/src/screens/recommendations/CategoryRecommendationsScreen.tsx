import { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { CategoryDropdown, type CategoryOption } from "@/components/category/CategoryDropdown";
import { RecommendedCard } from "@/components/category/RecommendedCard";
import { PremiumSearchBar } from "@/components/ui/PremiumSearchBar";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { LoadingView } from "@/components/LoadingView";
import { ErrorView } from "@/components/ErrorView";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icons } from "@/components/ui/AppIcon";

import type { CategoryRecommendItem } from "@/types/models";
import { fetchCategoryRecommendations } from "@/services/recommendations/categoryRecommendationsService";
import { colors, radius, spacing, typography } from "@/theme";
import { navigateToCardDetails } from "@/navigation/recommendationNavigation";

const CATEGORY_OPTIONS: CategoryOption[] = [
  { label: "Dining", value: "dining" },
  { label: "Grocery", value: "grocery" },
  { label: "Pharmacy", value: "pharmacy" },
  { label: "Home Improvement", value: "home" },
  { label: "Coffee", value: "coffee" },
  { label: "Online Retail", value: "online" },
  { label: "Electronics", value: "electronics" },
  { label: "Convenience", value: "convenience" },
  { label: "Department Store", value: "department" },
  { label: "Warehouse Club", value: "warehouse" },
];

/**
 * Category-based recommendations screen.
 *
 * Requirements:
 * - dropdown for spending category
 * - search bar for filtering results
 * - loading + error state
 * - dark fintech UI
 */
export function CategoryRecommendationsScreen() {
  const router = useRouter();

  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]!.value);
  const [query, setQuery] = useState("");

  const [items, setItems] = useState<CategoryRecommendItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.card_name.toLowerCase().includes(q));
  }, [items, query]);

  async function loadRecommendations(nextCategory = category) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCategoryRecommendations(nextCategory);
      setItems(res);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // When the user changes category, reload recommendations.
    void loadRecommendations(category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const selectedLabel = useMemo(() => {
    return CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? category;
  }, [category]);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]} className="flex-1">
        <View style={styles.header} className="px-6 pt-4 pb-3">
          <Text style={styles.title}>Recommendations</Text>
          <Text style={styles.subtitle}>
            Best rewards cards for <Text style={{ color: colors.primary }}>{selectedLabel}</Text>
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await loadRecommendations(category);
                setRefreshing(false);
              }}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.controls}>
            <CategoryDropdown value={category} options={CATEGORY_OPTIONS} onChange={setCategory} />

            <PremiumSearchBar
              value={query}
              onChangeText={setQuery}
              onClear={() => setQuery("")}
              placeholder="Search cards"
              large
            />
          </View>

          {loading ? <LoadingView message="Loading recommendations..." /> : null}

          {error ? (
            <ErrorView
              message={error}
              onRetry={() => {
                void loadRecommendations(category);
              }}
            />
          ) : null}

          {!loading && !error ? (
            filtered.length ? (
              <View style={{ marginTop: spacing.md }}>
                {filtered.map((it) => (
                  <RecommendedCard
                    key={`${it.card_name}-${it.reward_category}`}
                    item={it}
                    onPress={() => {
                      // Navigate with fully-typed data (via helper) so the details screen is stateless.
                      navigateToCardDetails(router, it);
                    }}
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                icon={Icons.sparkles}
                title="No matches"
                message="Try a different search term or category."
              />
            )
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
    fontSize: 26,
  },
  subtitle: {
    ...typography.subhead,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  controls: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  pill: {
    borderRadius: radius.xl,
  },
});

