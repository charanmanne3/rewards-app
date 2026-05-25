import { Pressable, StyleSheet, View } from "react-native";

import { PremiumWalletCard } from "@/components/premium/PremiumWalletCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import { AppIcon, Icons } from "@/components/ui/AppIcon";
import { useRecommendations } from "@/hooks/useRecommendations";
import { colors, spacing } from "@/theme";
import type { RecommendationMatch } from "@/types/models";
import { dedupeRecommendationMatches, recommendationMatchKey } from "@/utils/listKeys";
import { recommendationToCardMatch } from "@/utils/recommendations";
import { hapticSelect } from "@/utils/haptics";

interface TopCashbackSectionProps {
  storeName?: string;
}

export function TopCashbackSection({ storeName = "Amazon" }: TopCashbackSectionProps) {
  const { data, isLoading, isError } = useRecommendations(storeName);
  const top = dedupeRecommendationMatches(data?.all_matches ?? []).slice(0, 3);

  if (isError) return null;

  if (!isLoading && top.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader
        title="Top Cashback"
        subtitle={data ? `Best at ${data.store_name}` : `Loading ${storeName}…`}
        icon={<AppIcon name={Icons.trending} size={14} color={colors.gold} />}
      />
      {isLoading ? (
        <ShimmerSkeleton count={2} height={120} />
      ) : (
        top.map((match: RecommendationMatch, index: number) => (
          <Pressable
            key={recommendationMatchKey(match)}
            onPress={() => hapticSelect()}
          >
            <PremiumWalletCard
              card={recommendationToCardMatch(match)}
              index={index}
              isBestMatch={index === 0}
              providerSource={match.provider_source}
              isOwned={match.is_owned}
            />
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.lg },
});
