import { env } from "@/config/env";
import type { CategoryRecommendItem } from "@/types/models";
import axios from "axios";

/**
 * Fetch category recommendations from the backend.
 *
 * Backend endpoint:
 *   GET /recommend?category=<category>
 *
 * Note: You requested a specific Render URL; we use env.apiUrl when configured,
 * but fall back to the provided endpoint so the app works out of the box.
 */
const DEFAULT_API_BASE = "https://rewards-app-u7pb.onrender.com";

function resolveApiBaseUrl(): string {
  const configured = env.apiUrl?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return DEFAULT_API_BASE.replace(/\/+$/, "");
}

export async function fetchCategoryRecommendations(
  category: string
): Promise<CategoryRecommendItem[]> {
  const base = resolveApiBaseUrl();
  const trimmed = category.trim();

  const url = `${base}/recommend`;

  try {
    const res = await axios.get(url, {
      params: { category: trimmed },
      headers: { Accept: "application/json" },
      timeout: 15000,
    });

    const json = res.data as unknown;
    if (!Array.isArray(json)) throw new Error("Invalid API response: expected an array");
    return json as CategoryRecommendItem[];
  } catch (e) {
    // Axios error shape:
    // - response?.data?.detail (Render/FastAPI)
    // - message for network errors
    if (e instanceof Error) {
      const maybeAny = e as unknown as {
        message: string;
        response?: { data?: unknown; status?: number };
      };
      const detail =
        typeof maybeAny.response?.data === "object" &&
        maybeAny.response?.data &&
        "detail" in maybeAny.response.data &&
        typeof (maybeAny.response.data as any).detail === "string"
          ? (maybeAny.response.data as any).detail
          : maybeAny.message;

      throw new Error(detail);
    }
    throw new Error("Request failed");
  }
}

