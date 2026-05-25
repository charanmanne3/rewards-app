/** Premium fintech palette — Apple Wallet × Robinhood × Amex */
export const colors = {
  bgTop: "#0A1628",
  bgBottom: "#050A14",
  background: "#060B14",
  backgroundElevated: "#0D1526",
  surface: "rgba(255, 255, 255, 0.06)",
  surfaceHover: "rgba(255, 255, 255, 0.09)",
  glass: "rgba(255, 255, 255, 0.08)",
  glassBorder: "rgba(255, 255, 255, 0.12)",
  surfaceBorder: "rgba(255, 255, 255, 0.08)",

  primary: "#5B8DEF",
  primarySoft: "rgba(91, 141, 239, 0.15)",
  accent: "#34D399",
  accentSoft: "rgba(52, 211, 153, 0.12)",

  gold: "#E8C872",
  goldSoft: "rgba(232, 200, 114, 0.15)",
  platinum: "#F1F5F9",

  text: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.72)",
  textMuted: "rgba(255, 255, 255, 0.42)",

  error: "#F87171",
  errorSoft: "rgba(248, 113, 113, 0.12)",
  tabInactive: "rgba(255, 255, 255, 0.35)",
  tabActive: "#FFFFFF",

  shadow: "rgba(0, 0, 0, 0.45)",

  /** Card gradients */
  cardBlue: ["#1A3A6B", "#0A1628"] as const,
  cardPurple: ["#2D1F5E", "#0F0A1E"] as const,
  cardGold: ["#3D3020", "#1A1408"] as const,
  cardTeal: ["#0F3D3A", "#061818"] as const,

  /** Legacy aliases */
  border: "rgba(255, 255, 255, 0.08)",
  surfaceElevated: "#0D1526",
  surfaceGlass: "rgba(255, 255, 255, 0.08)",
  primaryMuted: "#4A7BD9",
  primaryDark: "#4A7BD9",
  cardGradientStart: "#1A3A6B",
  cardGradientEnd: "#0A1628",
  cardGradientGoldStart: "#3D3020",
  cardGradientGoldEnd: "#1A1408",
  errorBg: "rgba(248, 113, 113, 0.12)",
  warning: "#F59E0B",
} as const;

export const issuerColors: Record<string, string> = {
  Chase: "#117ACA",
  Discover: "#FF6600",
  Citi: "#003B70",
  "American Express": "#006FCF",
  Amex: "#006FCF",
  "Capital One": "#D03027",
  "Goldman Sachs": "#FFFFFF",
  "Wells Fargo": "#D71E28",
};
