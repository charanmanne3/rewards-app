import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { colors, radius, spacing, typography } from "@/theme";
import type { WalletProfile } from "@/services/wallet";

const CARD_OPTIONS = [
  "Chase Freedom Flex",
  "Discover IT",
  "Apple Card",
  "Amex Gold",
  "Citi Double Cash",
  "Capital One Venture X",
];

const HABITS = ["dining", "gas", "grocery", "travel", "online"] as const;

interface WalletOnboardingSheetProps {
  visible: boolean;
  onComplete: (profile: Partial<WalletProfile>) => void;
  onDismiss: () => void;
}

export function WalletOnboardingSheet({
  visible,
  onComplete,
  onDismiss,
}: WalletOnboardingSheetProps) {
  const [owned, setOwned] = useState<string[]>([]);
  const [habits, setHabits] = useState<WalletProfile["spendingHabits"]>([]);

  const toggle = (list: string[], item: string, setter: (n: string[]) => void) => {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Build your wallet</Text>
        <Text style={styles.sub}>
          We&apos;ll prioritize cards you own and maximize cashback near you.
        </Text>
        <ScrollView style={styles.scroll}>
          <Text style={styles.section}>Cards you own</Text>
          {CARD_OPTIONS.map((card) => (
            <Pressable
              key={`onboard-card-${card}`}
              style={[styles.chip, owned.includes(card) && styles.chipOn]}
              onPress={() => toggle(owned, card, setOwned)}
            >
              <Text style={styles.chipText}>{card}</Text>
            </Pressable>
          ))}
          <Text style={styles.section}>Spending habits</Text>
          <View style={styles.row}>
            {HABITS.map((h) => (
              <Pressable
                key={`habit-${h}`}
                style={[styles.chip, habits.includes(h) && styles.chipOn]}
                onPress={() =>
                  toggle(habits, h, setHabits as (n: string[]) => void)
                }
              >
                <Text style={styles.chipText}>{h}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        <PrimaryButton
          label="Save wallet"
          onPress={() =>
            onComplete({
              ownedCards: owned,
              spendingHabits: habits,
              onboarded: true,
            })
          }
        />
        <Pressable onPress={onDismiss} style={styles.skip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: spacing.screen, backgroundColor: colors.background },
  title: { ...typography.title, color: colors.text },
  sub: { ...typography.subhead, color: colors.textMuted, marginVertical: spacing.sm },
  scroll: { flex: 1, marginBottom: spacing.md },
  section: {
    ...typography.micro,
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  chip: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.glass,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  chipOn: { borderColor: colors.gold, backgroundColor: colors.goldSoft },
  chipText: { ...typography.body, color: colors.text },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  skip: { alignItems: "center", marginTop: spacing.sm },
  skipText: { ...typography.caption, color: colors.primary },
});
