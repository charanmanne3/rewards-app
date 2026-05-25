import AsyncStorage from "@react-native-async-storage/async-storage";

const PROFILE_KEY = "@rewards/wallet_profile";

export interface WalletProfile {
  ownedCards: string[];
  favoriteStores: string[];
  spendingHabits: ("dining" | "gas" | "grocery" | "travel" | "online")[];
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  notificationsEnabled: boolean;
  onboarded: boolean;
}

export const DEFAULT_WALLET_PROFILE: WalletProfile = {
  ownedCards: [],
  favoriteStores: [],
  spendingHabits: [],
  quietHoursStart: 22,
  quietHoursEnd: 8,
  notificationsEnabled: true,
  onboarded: false,
};

export async function loadWalletProfile(): Promise<WalletProfile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) return { ...DEFAULT_WALLET_PROFILE };
    return { ...DEFAULT_WALLET_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_WALLET_PROFILE };
  }
}

export async function saveWalletProfile(profile: WalletProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function updateWalletProfile(
  patch: Partial<WalletProfile>
): Promise<WalletProfile> {
  const current = await loadWalletProfile();
  const next = { ...current, ...patch };
  await saveWalletProfile(next);
  return next;
}
