import { AppIcon, Icons } from "@/components/ui/AppIcon";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { getNetworkStyle } from "@/components/stores/StoreBrandLogo";
import { colors, issuerColors, radius, shadow, spacing, typography } from "@/theme";
import type { StoreCardMatch } from "@/types/models";
import { formatAnnualFee, formatExpiry } from "@/utils/cardBadges";
import { hapticSelect } from "@/utils/haptics";

const GRADIENTS = [colors.cardGold, colors.cardBlue, colors.cardPurple, colors.cardTeal];
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PremiumWalletCardProps {
  card: StoreCardMatch;
  index: number;
  isBestMatch?: boolean;
  compareMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  providerSource?: string;
  isOwned?: boolean;
}

function issuerInitials(issuer: string): string {
  return issuer
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ChipIcon() {
  return (
    <View style={styles.chipIcon}>
      <View style={styles.chipLine} />
      <View style={styles.chipLine} />
      <View style={styles.chipLine} />
    </View>
  );
}

export function PremiumWalletCard({
  card,
  index,
  isBestMatch,
  compareMode,
  selected,
  onToggleSelect,
  providerSource,
  isOwned,
}: PremiumWalletCardProps) {
  const scale = useSharedValue(1);
  const gradient = isBestMatch ? colors.cardGold : GRADIENTS[index % GRADIENTS.length];
  const brandColor = issuerColors[card.issuer] ?? colors.primary;
  const network = getNetworkStyle(card.network);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (compareMode && onToggleSelect) {
      hapticSelect();
      onToggleSelect();
    }
  };

  return (
    <Animated.View style={[styles.wrap, animStyle, shadow.card]}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={() => {
          scale.value = withSpring(0.975, { damping: 14, stiffness: 280 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 200 });
        }}
        disabled={!compareMode}
      >
        <LinearGradient
          colors={[...gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, selected && styles.cardSelected]}
        >
          <View style={styles.glossTop} />
          <View style={styles.glossSheen} />

          <View style={styles.topRow}>
            <View style={[styles.issuerLogo, { backgroundColor: `${brandColor}44` }]}>
              <Text style={[styles.issuerText, { color: brandColor }]}>
                {issuerInitials(card.issuer)}
              </Text>
            </View>
            <View style={styles.networkBadge}>
              <Text style={styles.networkText}>{network.label}</Text>
            </View>
          </View>

          <Text style={styles.cardName} numberOfLines={1}>
            {card.card_name}
          </Text>
          <Text style={styles.issuerName}>{card.issuer}</Text>

          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.cashbackLabel}>Cashback</Text>
              <Text style={styles.cashback}>{card.cashback_percent}%</Text>
            </View>
            <ChipIcon />
          </View>

          <View style={styles.metaRow}>
            {providerSource ? <ProviderBadge provider={providerSource} compact /> : null}
            {isOwned ? (
              <View style={styles.ownedPill}>
                <Text style={styles.ownedText}>Your card</Text>
              </View>
            ) : null}
            <MetaPill
              label={card.annual_fee === 0 ? "No fee" : formatAnnualFee(card.annual_fee)}
              accent={card.annual_fee === 0}
            />
            <MetaPill label={card.reward_type} />
            {card.signup_bonus ? <MetaPill label="Bonus" /> : null}
            {card.expires_at ? (
              <MetaPill label={`Exp ${formatExpiry(card.expires_at) ?? "—"}`} />
            ) : null}
          </View>

          {isBestMatch ? (
            <View style={styles.bestBadge}>
              <Text style={styles.bestText}>Best Match</Text>
            </View>
          ) : null}

          {compareMode ? (
            <View style={styles.selectBadge}>
              <AppIcon
                name={selected ? Icons.checkmarkFilled : Icons.circle}
                size={22}
                color={selected ? colors.accent : colors.textMuted}
              />
            </View>
          ) : null}
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  );
}

function MetaPill({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <View style={[styles.pill, accent && styles.pillAccent]}>
      <Text style={[styles.pillText, accent && styles.pillTextAccent]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  card: {
    borderRadius: radius.xl,
    padding: spacing.md,
    minHeight: 120,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
  },
  cardSelected: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  glossTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.06)",
    height: "50%",
  },
  glossSheen: {
    position: "absolute",
    top: -40,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.08)",
    transform: [{ rotate: "25deg" }],
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  issuerLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  issuerText: { fontSize: 12, fontWeight: "800" },
  networkBadge: {
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  networkText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: 0.8,
  },
  cardName: {
    ...typography.headline,
    color: colors.text,
    marginTop: spacing.sm,
    fontSize: 17,
  },
  issuerName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: spacing.sm,
  },
  cashbackLabel: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: "none",
    letterSpacing: 0,
    fontWeight: "500",
  },
  cashback: {
    ...typography.cashback,
    fontSize: 32,
    color: colors.text,
    lineHeight: 36,
  },
  chipIcon: {
    width: 36,
    height: 26,
    borderRadius: 5,
    backgroundColor: "rgba(255,215,100,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    padding: 4,
    gap: 2,
    justifyContent: "center",
  },
  chipLine: {
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  pill: {
    backgroundColor: "rgba(0,0,0,0.28)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    maxWidth: "48%",
  },
  pillAccent: { backgroundColor: colors.accentSoft },
  pillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  pillTextAccent: { color: colors.accent },
  ownedPill: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  ownedText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 11,
    fontWeight: "600",
  },
  bestBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  bestText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gold,
    letterSpacing: 0.4,
  },
  selectBadge: {
    position: "absolute",
    bottom: spacing.md,
    right: spacing.md,
  },
});
