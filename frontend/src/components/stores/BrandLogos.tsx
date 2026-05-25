import type { ComponentType } from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";

interface LogoProps {
  size: number;
}

/** Simplified brand marks — recognizable silhouettes in official brand colors */
export function AmazonLogo({ size }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect width={48} height={48} rx={12} fill="#FF9900" />
      <Path
        d="M10 28c6 4 12 6 18 6 4 0 7-1 10-2"
        stroke="#131921"
        strokeWidth={2.2}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M36 26l4 2-4 2v-4z" fill="#131921" />
      <Path
        d="M14 16h20M14 21h14"
        stroke="#131921"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function WalmartLogo({ size }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect width={48} height={48} rx={12} fill="#0071CE" />
      <Path
        d="M24 8l2.5 7.5H34l-6 4.5 2.5 7.5L24 23l-6.5 4.5 2.5-7.5-6-4.5h7.5L24 8z"
        fill="#FFC220"
      />
    </Svg>
  );
}

export function CostcoLogo({ size }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect width={48} height={48} rx={12} fill="#005DAA" />
      <Rect x={8} y={14} width={32} height={20} rx={4} fill="#E31837" />
      <Path
        d="M14 24h20M24 18v12"
        stroke="#FFFFFF"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function StarbucksLogo({ size }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect width={48} height={48} rx={12} fill="#00704A" />
      <Circle cx={24} cy={24} r={12} fill="none" stroke="#FFFFFF" strokeWidth={2} />
      <Path
        d="M24 14c-3 3-3 7 0 10 3-3 3-7 0-10zM24 24c-3 3-3 7 0 10 3-3 3-7 0-10z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

export function TargetLogo({ size }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect width={48} height={48} rx={12} fill="#CC0000" />
      <Circle cx={24} cy={24} r={14} fill="none" stroke="#FFFFFF" strokeWidth={3} />
      <Circle cx={24} cy={24} r={6} fill="#FFFFFF" />
    </Svg>
  );
}

export function BestBuyLogo({ size }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect width={48} height={48} rx={12} fill="#0046BE" />
      <Path d="M12 14h18l-4 20H8l4-20z" fill="#FFF200" />
      <Path d="M28 14h8v20h-8V14z" fill="#FFFFFF" />
    </Svg>
  );
}

export function KrogerLogo({ size }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect width={48} height={48} rx={12} fill="#0066CC" />
      <Path
        d="M14 32V16h6c4 0 7 2 7 6s-3 6-7 6h-2v4H14zm6-8c2 0 3-1 3-2s-1-2-3-2h-2v4h2z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

export function CvsLogo({ size }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect width={48} height={48} rx={12} fill="#CC0000" />
      <Path
        d="M12 24c0-6 5-10 12-10s12 4 12 10-5 10-12 10-12-4-12-10z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={2.5}
      />
      <Path d="M24 18v12M18 24h12" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

export function WalgreensLogo({ size }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect width={48} height={48} rx={12} fill="#E31837" />
      <Path
        d="M24 12c-4 0-7 3-7 7 0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

export function SevenElevenLogo({ size }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect width={48} height={48} rx={12} fill="#008060" />
      <Rect x={10} y={14} width={28} height={20} rx={4} fill="#FF6600" />
      <Path
        d="M18 24h12M24 18v12"
        stroke="#FFFFFF"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function HomeDepotLogo({ size }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect width={48} height={48} rx={12} fill="#F96302" />
      <Path d="M24 10L38 22v16H10V22L24 10z" fill="#FFFFFF" />
      <Rect x={20} y={26} width={8} height={12} fill="#F96302" />
    </Svg>
  );
}

export type BrandLogoComponent = ComponentType<LogoProps>;

export const BRAND_LOGOS: Record<string, BrandLogoComponent> = {
  Amazon: AmazonLogo,
  Walmart: WalmartLogo,
  Costco: CostcoLogo,
  Starbucks: StarbucksLogo,
  Target: TargetLogo,
  "Best Buy": BestBuyLogo,
  Kroger: KrogerLogo,
  CVS: CvsLogo,
  Walgreens: WalgreensLogo,
  "Home Depot": HomeDepotLogo,
  "7-Eleven": SevenElevenLogo,
};

export function hasBrandLogo(name: string): boolean {
  return name in BRAND_LOGOS;
}
