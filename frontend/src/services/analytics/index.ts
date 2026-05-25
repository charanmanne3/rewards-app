import { env } from "@/config/env";

type EventProps = Record<string, string | number | boolean | undefined>;

/** Lightweight analytics facade — wire Segment/Amplitude in production */
export const analytics = {
  track(event: string, props?: EventProps) {
    if (!env.enableAnalytics) return;
    if (__DEV__) console.log("[Analytics]", event, props);
  },
  error(error: Error, context?: EventProps) {
    if (__DEV__) console.error("[Analytics error]", error.message, context);
  },
};
