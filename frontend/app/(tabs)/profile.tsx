import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { WalletOnboardingSheet } from "@/components/wallet/WalletOnboardingSheet";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { colors, radius, spacing, typography } from "@/theme";
import { useWalletProfile } from "@/hooks/useWalletProfile";
import type { WalletProfile } from "@/services/wallet";

export default function ProfileScreen() {
  const { profile, patch } = useWalletProfile();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!profile.onboarded) setShowOnboarding(true);
  }, [profile.onboarded]);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>R</Text>
          </View>
          <Text style={styles.name}>Rewards Member</Text>
          <Text style={styles.email}>
            {profile.ownedCards.length
              ? `${profile.ownedCards.length} cards in wallet`
              : "Add cards to personalize picks"}
          </Text>
        </View>

        <View style={styles.section}>
          <ProfileRow
            label="Owned cards"
            value={profile.ownedCards.length ? profile.ownedCards.join(", ") : "None"}
          />
          <ProfileRow
            label="Notifications"
            value={profile.notificationsEnabled ? "On" : "Off"}
          />
          <ProfileRow
            label="Quiet hours"
            value={
              profile.quietHoursStart != null
                ? `${profile.quietHoursStart}:00 – ${profile.quietHoursEnd}:00`
                : "Off"
            }
          />
          <Pressable
            style={styles.editBtn}
            onPress={() => setShowOnboarding(true)}
          >
            <Text style={styles.editText}>Edit wallet & preferences</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <WalletOnboardingSheet
        visible={showOnboarding}
        onComplete={(p: Partial<WalletProfile>) => {
          void patch(p);
          setShowOnboarding(false);
        }}
        onDismiss={() => setShowOnboarding(false)}
      />
    </ScreenBackground>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.screen,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  avatarText: { fontSize: 28, fontWeight: "600", color: colors.primary },
  name: { ...typography.title, color: colors.text },
  email: { ...typography.subhead, color: colors.textMuted, marginTop: 4, textAlign: "center" },
  section: {
    marginHorizontal: spacing.screen,
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glassBorder,
    gap: spacing.md,
  },
  rowLabel: { ...typography.body, color: colors.text, flex: 1 },
  rowValue: { ...typography.body, color: colors.textMuted, flex: 1, textAlign: "right" },
  editBtn: { padding: spacing.md, alignItems: "center" },
  editText: { ...typography.headline, color: colors.primary, fontSize: 15 },
});
