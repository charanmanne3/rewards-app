import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api, ApiClientError } from "@/api/client";
import { AdminRewardRow } from "@/components/AdminRewardRow";
import { ErrorView } from "@/components/ErrorView";
import { LoadingView } from "@/components/LoadingView";
import { ADMIN_API_KEY } from "@/config";
import { colors } from "@/theme/colors";
import type { CreditCard, Reward, Store } from "@/types/api";

export default function AdminRewardsScreen() {
  const [adminKey, setAdminKey] = useState(ADMIN_API_KEY);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editReward, setEditReward] = useState<Reward | null>(null);
  const [cashback, setCashback] = useState("");
  const [endDate, setEndDate] = useState("");

  const load = useCallback(async () => {
    if (!adminKey.trim()) {
      setError("Set EXPO_PUBLIC_ADMIN_API_KEY or enter admin key below");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [rewardPage, storeList, cardList] = await Promise.all([
        api.adminListRewards(adminKey, { page_size: 50 }),
        api.getStores(),
        api.getCards(),
      ]);
      setRewards(rewardPage.items);
      setStores(storeList);
      setCards(cardList);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (reward: Reward) => {
    setEditReward(reward);
    setCashback(String(reward.cashback_percent));
    setEndDate(reward.end_date ?? "");
  };

  const saveEdit = async () => {
    if (!editReward) return;
    try {
      await api.adminUpdateReward(adminKey, editReward.id, {
        cashback_percent: parseFloat(cashback),
        end_date: endDate || null,
      });
      setEditReward(null);
      load();
    } catch (e) {
      Alert.alert("Update failed", e instanceof Error ? e.message : "Unknown error");
    }
  };

  const deactivate = (reward: Reward) => {
    Alert.alert("Deactivate reward?", `${reward.store_name} / ${reward.card_name}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Deactivate",
        style: "destructive",
        onPress: async () => {
          await api.adminDeactivateReward(adminKey, reward.id);
          load();
        },
      },
    ]);
  };

  const runCleanup = async () => {
    try {
      const result = await api.adminRunExpirationJob(adminKey);
      Alert.alert("Cleanup done", `Deactivated ${result.deactivated_count} reward(s)`);
      load();
    } catch (e) {
      Alert.alert("Cleanup failed", e instanceof Error ? e.message : "Error");
    }
  };

  if (loading) return <LoadingView message="Loading rewards admin..." />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <View style={styles.toolbar}>
        <TextInput
          style={styles.keyInput}
          placeholder="Admin API key"
          placeholderTextColor={colors.textMuted}
          value={adminKey}
          onChangeText={setAdminKey}
          secureTextEntry
          autoCapitalize="none"
        />
        <Pressable style={styles.toolBtn} onPress={load}>
          <Text style={styles.toolBtnText}>Refresh</Text>
        </Pressable>
        <Pressable style={styles.toolBtn} onPress={runCleanup}>
          <Text style={styles.toolBtnText}>Expire job</Text>
        </Pressable>
      </View>

      <Text style={styles.hint}>
        Edit cashback % and end dates without redeploying. {stores.length} stores, {cards.length}{" "}
        cards loaded.
      </Text>

      <FlatList
        data={rewards}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <AdminRewardRow reward={item} onEdit={() => openEdit(item)} onDeactivate={() => deactivate(item)} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No rewards found</Text>}
      />

      <Modal visible={!!editReward} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Edit reward</Text>
            <Text style={styles.modalSub}>
              {editReward?.store_name} · {editReward?.card_name} ({editReward?.reward_type})
            </Text>
            <Text style={styles.label}>Cashback %</Text>
            <TextInput
              style={styles.input}
              value={cashback}
              onChangeText={setCashback}
              keyboardType="decimal-pad"
            />
            <Text style={styles.label}>End date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="2026-03-31"
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setEditReward(null)}>
                <Text style={styles.cancel}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={saveEdit}>
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  toolbar: { flexDirection: "row", gap: 8, padding: 16, flexWrap: "wrap" },
  keyInput: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolBtn: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  toolBtnText: { color: colors.primary, fontWeight: "600" },
  hint: { color: colors.textMuted, fontSize: 12, paddingHorizontal: 16, marginBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 40 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: { color: colors.text, fontSize: 20, fontWeight: "700" },
  modalSub: { color: colors.textMuted, marginTop: 4, marginBottom: 16 },
  label: { color: colors.textMuted, fontSize: 12, marginTop: 8 },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  cancel: { color: colors.textMuted, fontSize: 16 },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveText: { color: colors.background, fontWeight: "700" },
});
