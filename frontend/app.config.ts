import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * Build-time configuration — set EXPO_PUBLIC_* in .env or EAS secrets.
 * No production API URL is hardcoded; cloud URL must be provided for release builds.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() ?? "";
  const isDev = process.env.NODE_ENV !== "production";
  const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? (isDev ? "development" : "production");

  return {
    ...config,
    name: "Rewards Optimizer",
    slug: "rewards-optimizer",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "rewards",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      resizeMode: "contain",
      backgroundColor: "#0F172A",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.rewards.optimizer",
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "Rewards Optimizer uses your location to find nearby stores and recommend the best cashback card.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "Optional background location enables proximity alerts when you're near partner stores.",
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#0F172A",
      },
      package: "com.rewards.optimizer",
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "POST_NOTIFICATIONS",
      ],
    },
    web: {
      bundler: "metro",
    },
    plugins: [
      "expo-router",
      "expo-asset",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow Rewards Optimizer to use your location for nearby store recommendations.",
        },
      ],
      [
        "expo-notifications",
        {
          color: "#5B8DEF",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true,
    },
    extra: {
      ...config.extra,
      apiUrl,
      appEnv,
      enableAnalytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === "true",
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
  };
};
