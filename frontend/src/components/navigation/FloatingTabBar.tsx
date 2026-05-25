import { Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Icons } from "@/components/ui/AppIcon";
import { colors, radius, spacing, typography } from "@/theme";
import { hapticSelect } from "@/utils/haptics";

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  index: { active: Icons.homeFilled, inactive: Icons.home },
  nearby: { active: Icons.storefront, inactive: Icons.storefront },
  search: { active: Icons.searchFilled, inactive: Icons.search },
  wallet: { active: Icons.walletFilled, inactive: Icons.wallet },
  profile: { active: Icons.profileFilled, inactive: Icons.profile },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function TabItem({
  label,
  routeName,
  focused,
  onPress,
}: {
  label: string;
  routeName: string;
  focused: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const icons = TAB_ICONS[routeName] ?? TAB_ICONS.index;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.tab, animStyle]}
      onPress={() => {
        hapticSelect();
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.88, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12 });
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
    >
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <Ionicons
          name={(focused ? icons.active : icons.inactive) as keyof typeof Ionicons.glyphMap}
          size={22}
          color={focused ? colors.text : colors.tabInactive}
        />
      </View>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </AnimatedPressable>
  );
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <BlurView intensity={65} tint="dark" style={styles.blur}>
        <View style={styles.inner}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.title ?? route.name;
            const focused = state.index === index;

            return (
              <TabItem
                key={route.key}
                label={label}
                routeName={route.name}
                focused={focused}
                onPress={() => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing.screen,
    right: spacing.screen,
    bottom: 0,
  },
  blur: {
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  inner: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: "rgba(6, 11, 20, 0.55)",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: spacing.xs,
  },
  iconWrap: {
    width: 40,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  iconWrapActive: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  label: {
    ...typography.tab,
    color: colors.tabInactive,
  },
  labelActive: {
    color: colors.text,
    fontWeight: "600",
  },
});
