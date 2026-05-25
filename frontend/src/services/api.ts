import { env } from "@/config/env";
import { getMockHealth, getMockRecommendations } from "@/services/mockData";
import type {
  ApiErrorBody,
  ApiHealthResponse,
  BestCardRecommendation,
  CreditCardDetail,
  PromotionalOffer,
  RecommendationRequest,
  RecommendationResponse,
  Store,
  StoreCardsResponse,
} from "@/types/models";

export class ApiError extends Error {
  readonly status: number;
  readonly isNetworkError: boolean;

  constructor(message: string, status: number, isNetworkError = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

type RequestConfig = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
  /** Use mock payload when request fails (dev fallback) */
  useMockOnFailure?: boolean;
  mockStoreName?: string;
};

function isNetworkFailure(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (error instanceof ApiError && error.isNetworkError) return true;
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("Network request failed") ||
    msg.includes("Failed to fetch") ||
    msg.includes("Cannot reach API")
  );
}

function logRequestFailure(
  method: string,
  url: string,
  status: number,
  message: string,
  body?: unknown
) {
  console.error("[Rewards API] Request failed", {
    method,
    url,
    status,
    message,
    body: body ? JSON.stringify(body).slice(0, 200) : undefined,
  });
}

async function request<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { method = "GET", body, headers = {}, useMockOnFailure, mockStoreName } = config;

  if (!env.apiUrl) {
    throw new ApiError(
      "API URL is not configured. Set EXPO_PUBLIC_API_URL to your deployed backend URL.",
      0,
      true
    );
  }

  const url = `${env.apiUrl}${path}`;

  if (__DEV__) {
    console.log(`[Rewards API] ${method} ${url}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    const message = `Cannot reach API at ${env.apiUrl}. Is uvicorn running on port 8000?`;
    logRequestFailure(method, url, 0, message, body);

    if (useMockOnFailure && __DEV__) {
      console.warn("[Rewards API] Using mock fallback for", path);
      if (path === "/health") return getMockHealth() as T;
      if (path === "/recommendations" && mockStoreName) {
        return getMockRecommendations(mockStoreName) as T;
      }
    }

    throw new ApiError(message, 0, true);
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const err = (await response.json()) as ApiErrorBody;
      if (typeof err.detail === "string") message = err.detail;
    } catch {
      if (response.status >= 500) {
        message = `Server error at ${env.apiUrl} (${response.status})`;
      }
    }

    logRequestFailure(method, url, response.status, message, body);

    if (useMockOnFailure && __DEV__ && (response.status >= 500 || response.status === 0)) {
      if (path === "/health") return getMockHealth() as T;
      if (path === "/recommendations" && mockStoreName) {
        return getMockRecommendations(mockStoreName) as T;
      }
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

/** Public rewards API */
export const rewardsApi = {
  getHealth: () =>
    request<ApiHealthResponse>("/health", { useMockOnFailure: true }),

  getStores: () => request<Store[]>("/stores"),

  getRecommendations: (body: RecommendationRequest) =>
    request<RecommendationResponse>("/recommendations", {
      method: "POST",
      body,
      useMockOnFailure: true,
      mockStoreName: body?.store ?? "",
    }),

  getBestCardForStore: (storeName: string) =>
    request<BestCardRecommendation>(`/best-card/${encodeURIComponent(storeName)}`),

  getStoreCards: (storeName: string) =>
    request<StoreCardsResponse>(`/cards/${encodeURIComponent(storeName)}`, {
      useMockOnFailure: true,
      mockStoreName: storeName,
    }),

  getCardsWithRewards: () => request<CreditCardDetail[]>("/cards/details"),

  getPromotionalOffers: () => request<PromotionalOffer[]>("/offers/promotional"),
};

export { isNetworkFailure };
