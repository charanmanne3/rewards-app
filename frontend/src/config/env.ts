import Constants from "expo-constants";

export type AppEnvironment = "development" | "staging" | "production";

const DEV_FALLBACK_API = "http://127.0.0.1:8000";

function normalizeApiUrl(url: string): string {
  return url
    .trim()
    .replace(/\/$/, "")
    .replace(/\/\/localhost\b/i, "//127.0.0.1")
    .replace(/\/\/localhost:/i, "//127.0.0.1:");
}

function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return normalizeApiUrl(fromEnv);

  const fromExtra = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  if (fromExtra?.trim()) return normalizeApiUrl(fromExtra);

  if (__DEV__) {
    return DEV_FALLBACK_API;
  }

  console.error(
    "[Rewards] EXPO_PUBLIC_API_URL is not set. Configure it in EAS secrets or .env before production builds."
  );
  return "";
}

function resolveAppEnv(): AppEnvironment {
  const raw =
    (process.env.EXPO_PUBLIC_APP_ENV as AppEnvironment | undefined) ??
    (Constants.expoConfig?.extra?.appEnv as AppEnvironment | undefined);
  if (raw === "production" || raw === "staging" || raw === "development") {
    return raw;
  }
  return __DEV__ ? "development" : "production";
}

const appEnv = resolveAppEnv();

export const env = {
  apiUrl: resolveApiUrl(),
  appEnv,
  isProduction: appEnv === "production",
  isDevelopment: appEnv === "development" || __DEV__,
  adminApiKey: process.env.EXPO_PUBLIC_ADMIN_API_KEY ?? "",
  googlePlacesApiKey: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? "",
  yelpApiKey: process.env.EXPO_PUBLIC_YELP_API_KEY ?? "",
  foursquareApiKey: process.env.EXPO_PUBLIC_FOURSQUARE_API_KEY ?? "",
  enableAnalytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === "true",
  isDev: __DEV__,
} as const;

export function assertApiConfigured(): void {
  if (!env.apiUrl) {
    throw new Error(
      "API URL is not configured. Set EXPO_PUBLIC_API_URL to your deployed backend (e.g. https://rewards-api.onrender.com)."
    );
  }
}

if (__DEV__ && env.apiUrl) {
  console.log("[Rewards] API:", env.apiUrl, "| env:", env.appEnv);
}
