import { Platform } from "react-native";

const font = Platform.select({
  ios: "System",
  default: "System",
});

/** SF Pro–style scale */
export const typography = {
  hero: {
    fontFamily: font,
    fontSize: 34,
    fontWeight: "700" as const,
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  title: {
    fontFamily: font,
    fontSize: 22,
    fontWeight: "600" as const,
    letterSpacing: -0.4,
  },
  headline: {
    fontFamily: font,
    fontSize: 17,
    fontWeight: "600" as const,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: font,
    fontSize: 16,
    fontWeight: "400" as const,
    letterSpacing: -0.1,
    lineHeight: 22,
  },
  subhead: {
    fontFamily: font,
    fontSize: 15,
    fontWeight: "400" as const,
    letterSpacing: -0.1,
    lineHeight: 20,
  },
  /** @deprecated use subhead */
  subtitle: {
    fontFamily: font,
    fontSize: 15,
    fontWeight: "400" as const,
    letterSpacing: -0.1,
    lineHeight: 20,
  },
  caption: {
    fontFamily: font,
    fontSize: 13,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 18,
  },
  micro: {
    fontFamily: font,
    fontSize: 11,
    fontWeight: "600" as const,
    letterSpacing: 0.6,
    textTransform: "uppercase" as const,
  },
  tab: {
    fontFamily: font,
    fontSize: 10,
    fontWeight: "500" as const,
  },
  cashback: {
    fontFamily: font,
    fontSize: 28,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
};
