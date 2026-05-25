import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export function hapticLight() {
  if (Platform.OS === "ios") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

export function hapticSelect() {
  if (Platform.OS === "ios") {
    Haptics.selectionAsync().catch(() => {});
  }
}

export function hapticSuccess() {
  if (Platform.OS === "ios") {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }
}
