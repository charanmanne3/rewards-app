/** Brand styling for major retailers — monogram marks in premium containers */
export interface StoreBrandStyle {
  background: string;
  foreground: string;
  accent?: string;
  monogram: string;
}

export const STORE_BRANDS: Record<string, StoreBrandStyle> = {
  Amazon: { background: "#FF9900", foreground: "#131921", monogram: "a" },
  Walmart: { background: "#0071CE", foreground: "#FFFFFF", accent: "#FFC220", monogram: "W" },
  Costco: { background: "#E31837", foreground: "#FFFFFF", accent: "#005DAA", monogram: "C" },
  Starbucks: { background: "#00704A", foreground: "#FFFFFF", monogram: "★" },
  Target: { background: "#CC0000", foreground: "#FFFFFF", monogram: "◎" },
  "Best Buy": { background: "#0046BE", foreground: "#FFF200", monogram: "B" },
  Kroger: { background: "#0066CC", foreground: "#FFFFFF", monogram: "K" },
  CVS: { background: "#CC0000", foreground: "#FFFFFF", monogram: "CVS" },
  Walgreens: { background: "#E31837", foreground: "#FFFFFF", monogram: "W" },
  "Home Depot": { background: "#F96302", foreground: "#FFFFFF", monogram: "HD" },
  "7-Eleven": { background: "#008060", foreground: "#FFFFFF", accent: "#FF6600", monogram: "7" },
};

export function getStoreBrand(name: string): StoreBrandStyle {
  return (
    STORE_BRANDS[name] ?? {
      background: "rgba(91, 141, 239, 0.35)",
      foreground: "#FFFFFF",
      monogram: name.charAt(0).toUpperCase(),
    }
  );
}

export const FEATURED_STORE_NAMES = [
  "7-Eleven",
  "Amazon",
  "Walmart",
  "Costco",
  "Starbucks",
  "Target",
  "Best Buy",
] as const;

export const TRENDING_STORE_NAMES = FEATURED_STORE_NAMES;
