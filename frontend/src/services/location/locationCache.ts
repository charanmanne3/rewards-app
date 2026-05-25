import AsyncStorage from "@react-native-async-storage/async-storage";

import type { CachedLocation } from "./types";

const CACHE_KEY = "@rewards/last_location";
const MAX_AGE_MS = 15 * 60 * 1000;

export async function getCachedLocation(): Promise<CachedLocation | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedLocation;
    if (Date.now() - parsed.timestamp > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setCachedLocation(location: CachedLocation): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(location));
  } catch {
    /* ignore */
  }
}

export async function clearCachedLocation(): Promise<void> {
  await AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
}
