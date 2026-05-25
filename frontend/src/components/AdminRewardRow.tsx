import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import type { Reward } from "@/types/api";

interface AdminRewardRowProps {
  reward: Reward;
  onEdit: () => void;
  onDeactivate: () => void;
}

export function AdminRewardRow({ reward, onEdit, onDeactivate }: AdminRewardRowProps) {
  const eligible = reward.is_currently_eligible;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {reward.store_name} · {reward.card_name}
        </Text>
        <View style={[styles.chip, eligible ? styles.chipLive : styles.chipOff]}>
          <Text style={styles.chipText}>{eligible ? "LIVE" : "OFF"}</Text>
        </View>
      </View>
      <Text style={styles.meta}>
        {reward.cashback_percent}% · {reward.reward_type}
        {reward.end_date ? ` · ends ${reward.end_date}` : ""}
      </Text>
      <View style={styles.actions}>
        <Pressable style={styles.btn} onPress={onEdit}>
          <Text style={styles.btnText}>Edit</Text>
        </Pressable>
        {reward.is_active ? (
          <Pressable style={[styles.btn, styles.btnDanger]} onPress={onDeactivate}>
            <Text style={styles.btnTextDanger}>Deactivate</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: colors.text, fontWeight: "600", fontSize: 14, flex: 1 },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  chipLive: { backgroundColor: "#064E3B" },
  chipOff: { backgroundColor: colors.surfaceElevated },
  chipText: { color: colors.accent, fontSize: 10, fontWeight: "700" },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
  },
  btnDanger: { backgroundColor: colors.errorBg },
  btnText: { color: colors.primary, fontWeight: "600", fontSize: 13 },
  btnTextDanger: { color: colors.error, fontWeight: "600", fontSize: 13 },
});
