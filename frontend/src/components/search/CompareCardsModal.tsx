import { LinearGradient } from "expo-linear-gradient";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppIcon, Icons } from "@/components/ui/AppIcon";
import { colors, radius, spacing, typography } from "@/theme";
import type { StoreCardMatch } from "@/types/models";
import { formatAnnualFee, formatExpiry, getCardBadges, BADGE_LABELS } from "@/utils/cardBadges";
import { cardMatchKey, dedupeCardMatches } from "@/utils/listKeys";
import { hapticLight } from "@/utils/haptics";

interface CompareCardsModalProps {
  visible: boolean;
  onClose: () => void;
  cards: StoreCardMatch[];
  storeName: string;
}

export function CompareCardsModal({ visible, onClose, cards, storeName }: CompareCardsModalProps) {
  const top = dedupeCardMatches(cards).slice(0, 5);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient colors={[colors.bgTop, colors.bgBottom]} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <Animated.View entering={SlideInDown.springify().damping(20)} style={styles.header}>
            <View>
              <Text style={styles.title}>Compare Cards</Text>
              <Text style={styles.subtitle}>At {storeName}</Text>
            </View>
            <Pressable
              onPress={() => {
                hapticLight();
                onClose();
              }}
              hitSlop={12}
              style={styles.closeBtn}
            >
              <AppIcon name={Icons.close} size={22} color={colors.text} />
            </Pressable>
          </Animated.View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.table}
          >
            {top.map((card, index) => {
              const badges = getCardBadges(card, index);
              return (
                <Animated.View
                  key={cardMatchKey(card)}
                  entering={FadeIn.delay(index * 80).springify()}
                  style={styles.column}
                >
                  <Text style={styles.colRank}>#{index + 1}</Text>
                  <Text style={styles.colName} numberOfLines={2}>
                    {card.card_name}
                  </Text>
                  {badges.map((b, badgeIdx) => (
                    <Text key={`${cardMatchKey(card)}-badge-${b}-${badgeIdx}`} style={styles.colBadge}>
                      {BADGE_LABELS[b]}
                    </Text>
                  ))}
                  <CompareRow label="Cashback" value={`${card.cashback_percent}%`} highlight />
                  <CompareRow label="Annual fee" value={formatAnnualFee(card.annual_fee)} />
                  <CompareRow label="Network" value={card.network ?? "—"} />
                  <CompareRow label="Type" value={card.reward_type} />
                  <CompareRow label="Bonus" value={card.signup_bonus ?? "—"} />
                  <CompareRow label="Expires" value={formatExpiry(card.expires_at) ?? "—"} />
                </Animated.View>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
}

function CompareRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: { ...typography.title, color: colors.text },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glass,
    alignItems: "center",
    justifyContent: "center",
  },
  table: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  column: {
    width: 168,
    backgroundColor: colors.glass,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  colRank: { ...typography.micro, color: colors.gold },
  colName: {
    ...typography.headline,
    color: colors.text,
    fontSize: 14,
    marginVertical: spacing.sm,
  },
  colBadge: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: 2,
  },
  row: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glassBorder,
  },
  rowLabel: { ...typography.micro, color: colors.textMuted, textTransform: "uppercase" },
  rowValue: { ...typography.caption, color: colors.text, marginTop: 2, fontWeight: "600" },
  rowHighlight: { color: colors.gold, fontSize: 18, fontWeight: "800" },
});
