import { Ionicons } from "@expo/vector-icons";
import { StyleProp, TextStyle } from "react-native";

import { colors } from "@/theme";

/** Verified Ionicons names for Expo SDK 52 */
export const Icons = {
  // Tab bar
  home: "home-outline",
  homeFilled: "home",
  search: "search-outline",
  searchFilled: "search",
  wallet: "card-outline",
  walletFilled: "card",
  profile: "person-outline",
  profileFilled: "person",

  // UI
  close: "close-outline",
  closeCircle: "close-circle-outline",
  chevronDown: "chevron-down-outline",
  chevronUp: "chevron-up-outline",
  checkmark: "checkmark-circle-outline",
  checkmarkFilled: "checkmark-circle",
  circle: "ellipse-outline",
  time: "time-outline",
  cloudOffline: "cloud-offline-outline",

  // Stores
  package: "cube-outline",
  cart: "cart-outline",
  warehouse: "business-outline",
  coffee: "cafe-outline",
  storefront: "storefront-outline",
  tag: "pricetag-outline",
  electronics: "hardware-chip-outline",
  medical: "medical-outline",
  hammer: "hammer-outline",

  // Navigation
  chevronForward: "chevron-forward-outline",
  trending: "flame-outline",
  arrowBack: "chevron-back-outline",

  // Empty states
  sparkles: "sparkles-outline",
} as const;

export type IconName = (typeof Icons)[keyof typeof Icons];

interface AppIconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

/** Consistent icon wrapper — use Icons.* names only */
export function AppIcon({
  name,
  size = 22,
  color = colors.textSecondary,
  style,
}: AppIconProps) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}
