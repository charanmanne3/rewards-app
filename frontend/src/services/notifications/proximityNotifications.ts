import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { loadWalletProfile } from "@/services/wallet";

const COOLDOWN_KEY = "@rewards/notify_cooldown";
const COOLDOWN_MS = 30 * 60 * 1000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function isQuietHours(start: number | null, end: number | null): boolean {
  if (start == null || end == null) return false;
  const hour = new Date().getHours();
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

async function canNotify(storeName: string): Promise<boolean> {
  const profile = await loadWalletProfile();
  if (!profile.notificationsEnabled) return false;
  if (isQuietHours(profile.quietHoursStart, profile.quietHoursEnd)) return false;

  try {
    const raw = await AsyncStorage.getItem(COOLDOWN_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    const last = map[storeName] ?? 0;
    if (Date.now() - last < COOLDOWN_MS) return false;
    map[storeName] = Date.now();
    await AsyncStorage.setItem(COOLDOWN_KEY, JSON.stringify(map));
    return true;
  } catch {
    return true;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/** Geofencing-ready: call when user enters proximity of a store */
export async function notifyNearStore(
  storeName: string,
  cardName: string,
  cashbackPercent: number
): Promise<void> {
  if (!(await canNotify(storeName))) return;

  const granted = await requestNotificationPermission();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `You're near ${storeName}`,
      body: `Use ${cardName} for ${cashbackPercent}% cashback`,
      data: { storeName, cardName },
    },
    trigger: null,
  });
}

/** Future: register geofence regions per NearbyStore */
export interface GeofenceRegion {
  identifier: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export function buildGeofenceRegions(
  stores: Array<{ id: string; name: string; coordinates: { latitude: number; longitude: number } }>
): GeofenceRegion[] {
  return stores.map((s) => ({
    identifier: s.id,
    latitude: s.coordinates.latitude,
    longitude: s.coordinates.longitude,
    radius: 120,
  }));
}
