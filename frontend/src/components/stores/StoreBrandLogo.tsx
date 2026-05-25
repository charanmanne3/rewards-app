import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { BRAND_LOGOS } from "@/components/stores/BrandLogos";
import { colors, shadow } from "@/theme";
import { getStoreBrand } from "@/utils/storeBrands";

const SIZE = 48;

interface StoreBrandLogoProps {
  name: string;
  size?: number;
  style?: ViewStyle;
}

export function StoreBrandLogo({ name, size = SIZE, style }: StoreBrandLogoProps) {
  const brand = getStoreBrand(name);
  const cornerRadius = size * 0.28;
  const Logo = BRAND_LOGOS[name];

  if (Logo) {
    return (
      <View
        style={[
          styles.logoWrap,
          shadow.soft,
          { width: size, height: size, borderRadius: cornerRadius },
          style,
        ]}
      >
        <Logo size={size} />
        <View style={[styles.gloss, { borderRadius: cornerRadius }]} />
      </View>
    );
  }

  const fontSize = brand.monogram.length > 2 ? size * 0.22 : size * 0.38;

  return (
    <View
      style={[
        styles.wrap,
        shadow.soft,
        {
          width: size,
          height: size,
          borderRadius: cornerRadius,
          backgroundColor: brand.background,
        },
        style,
      ]}
    >
      <View style={[styles.gloss, { borderRadius: cornerRadius }]} />
      <Text
        style={[styles.monogram, { color: brand.foreground, fontSize }]}
        numberOfLines={1}
      >
        {brand.monogram}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoWrap: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
  },
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
  },
  gloss: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: 0,
    height: "42%",
    pointerEvents: "none",
  },
  monogram: {
    fontWeight: "800",
    letterSpacing: -0.5,
  },
});

/** Network badge colors for card UI */
export const NETWORK_STYLES: Record<string, { bg: string; label: string }> = {
  Visa: { bg: "rgba(26, 31, 113, 0.85)", label: "VISA" },
  Mastercard: { bg: "rgba(235, 0, 27, 0.75)", label: "MC" },
  Amex: { bg: "rgba(0, 111, 207, 0.85)", label: "AMEX" },
  Discover: { bg: "rgba(255, 102, 0, 0.85)", label: "DISC" },
};

export function getNetworkStyle(network: string | null | undefined) {
  if (!network) return { bg: colors.glass, label: "CARD" };
  const key = Object.keys(NETWORK_STYLES).find((k) =>
    network.toLowerCase().includes(k.toLowerCase())
  );
  return key ? NETWORK_STYLES[key] : { bg: colors.glass, label: network.toUpperCase().slice(0, 4) };
}
