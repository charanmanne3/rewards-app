import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, ViewStyle } from "react-native";

import { colors } from "@/theme";

interface ScreenBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ScreenBackground({ children, style }: ScreenBackgroundProps) {
  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={[colors.bgTop, colors.bgBottom]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
