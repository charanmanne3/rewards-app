import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppIcon, Icons } from "@/components/ui/AppIcon";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { runAIAssistantQuery } from "@/services/ai";
import { colors, radius, spacing, typography } from "@/theme";
import { hapticLight, hapticSuccess } from "@/utils/haptics";

interface FloatingAIAssistantProps {
  ownedCards?: string[];
  fallbackStore?: string;
  onStoreResolved?: (storeName: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingAIAssistant({
  ownedCards = [],
  fallbackStore,
  onStoreResolved,
}: FloatingAIAssistantProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scale = useSharedValue(1);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ask = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSummary(null);
    try {
      const result = await runAIAssistantQuery(query, {
        ownedCards,
        fallbackStore,
      });
      setSummary(result.summary);
      if (result.storeName) {
        hapticSuccess();
        onStoreResolved?.(result.storeName);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatedPressable
        style={[styles.fab, fabStyle]}
        onPress={() => {
          hapticLight();
          setOpen(true);
        }}
        onPressIn={() => {
          scale.value = withSpring(0.92);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
      >
        <AppIcon name={Icons.sparkles} size={24} color={colors.gold} />
      </AnimatedPressable>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <BlurView intensity={80} tint="dark" style={styles.modal}>
          <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
              <Text style={styles.title}>AI Cashback Assistant</Text>
              <Pressable onPress={() => setOpen(false)}>
                <AppIcon name={Icons.close} size={22} color={colors.text} />
              </Pressable>
            </View>
            <Text style={styles.hint}>
              Try: “Best card near me for gas” or “What should I use at Starbucks?”
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ask anything…"
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            <PrimaryButton
              label={loading ? "Thinking…" : "Get recommendation"}
              onPress={() => void ask()}
            />
            {summary ? (
              <View style={styles.result}>
                <Text style={styles.resultText}>{summary}</Text>
              </View>
            ) : null}
          </SafeAreaView>
        </BlurView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: spacing.screen,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  modal: { flex: 1 },
  safe: { flex: 1, padding: spacing.screen },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: { ...typography.title, color: colors.text },
  hint: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.md },
  input: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.text,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  result: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.goldSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  resultText: { ...typography.body, color: colors.text, lineHeight: 22 },
});
