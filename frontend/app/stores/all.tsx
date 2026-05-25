import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { StoreListRow } from "@/components/stores/StoreListRow";
import { Icons } from "@/components/ui/AppIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PremiumSearchBar } from "@/components/ui/PremiumSearchBar";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { ApiError } from "@/services/api";
import { useStores } from "@/services/queries";
import { colors, spacing, typography } from "@/theme";
import type { Store } from "@/types/models";
import { storeRowKey } from "@/utils/listKeys";
import { hapticLight } from "@/utils/haptics";

type StoreSection = { title: string; data: Store[] };

function groupByLetter(stores: Store[]): StoreSection[] {
  const map = new Map<string, Store[]>();

  for (const store of stores) {
    const letter = store.name.charAt(0).toUpperCase();
    const key = /[A-Z]/.test(letter) ? letter : "#";
    const list = map.get(key) ?? [];
    list.push(store);
    map.set(key, list);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, data]) => ({ title, data }));
}

export default function AllStoresScreen() {
  // Expo Router requires default export
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim().toLowerCase(), 200);
  const { data, isLoading, isError, error, refetch, isRefetching } = useStores();

  const sortedStores = useMemo(
    () => [...(data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [data]
  );

  const filteredStores = useMemo(() => {
    if (!debouncedQuery) return sortedStores;
    return sortedStores.filter(
      (s) =>
        s.name.toLowerCase().includes(debouncedQuery) ||
        s.category.toLowerCase().includes(debouncedQuery)
    );
  }, [sortedStores, debouncedQuery]);

  const sections = useMemo(() => groupByLetter(filteredStores), [filteredStores]);

  const goToStore = (storeName: string) => {
    hapticLight();
    router.navigate({
      pathname: "/(tabs)/search",
      params: { q: storeName },
    });
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>All Stores</Text>
            <Pressable
              onPress={() => {
                hapticLight();
                router.back();
              }}
              hitSlop={12}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={styles.closeText}>Done</Text>
            </Pressable>
          </View>
          <PremiumSearchBar
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery("")}
            placeholder="Search all stores..."
          />
          <Text style={styles.count}>
            {filteredStores.length} store{filteredStores.length === 1 ? "" : "s"}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <ErrorState
              message={
                error instanceof ApiError ? error.message : "Failed to load stores"
              }
              onRetry={() => refetch()}
            />
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => storeRowKey(item)}
            renderItem={({ item }) => (
              <StoreListRow store={item} onPress={() => goToStore(item.name)} />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLetter}>{title}</Text>
              </View>
            )}
            stickySectionHeadersEnabled
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: insets.bottom + spacing.xl },
              sections.length === 0 && styles.listEmpty,
            ]}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => refetch()}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon={Icons.search}
                title="No stores found"
                message={
                  debouncedQuery
                    ? `No matches for "${query.trim()}".`
                    : "No stores available yet."
                }
              />
            }
          />
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glassBorder,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  closeBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  closeText: {
    ...typography.headline,
    color: colors.primary,
    fontSize: 16,
  },
  count: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
  },
  listEmpty: { flexGrow: 1 },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  sectionLetter: {
    ...typography.micro,
    color: colors.textMuted,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.screen,
  },
});
