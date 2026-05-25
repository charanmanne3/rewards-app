/**
 * Legacy API client — admin routes only.
 * Public store/recommendation flows use `@/services/api` + React Query.
 */

import { env } from "@/config/env";
import type {
  ApiError,
  BestCardRecommendation,
  CreditCard,
  PaginatedRewards,
  Reward,
  RewardCreatePayload,
  RewardUpdatePayload,
  Store,
} from "@/types/api";

export class ApiClientError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  adminKey?: string;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, adminKey } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body) headers["Content-Type"] = "application/json";
  if (adminKey) headers["X-Admin-API-Key"] = adminKey;

  const response = await fetch(`${env.apiUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const errBody = (await response.json()) as ApiError;
      if (typeof errBody.detail === "string") message = errBody.detail;
    } catch {
      /* default */
    }
    throw new ApiClientError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  getStores: () => request<Store[]>("/stores"),
  getCards: () => request<CreditCard[]>("/cards"),
  getBestCard: (storeName: string) =>
    request<BestCardRecommendation>(`/best-card/${encodeURIComponent(storeName)}`),
  adminListRewards: (
    adminKey: string,
    params?: { page?: number; page_size?: number; eligible_only?: boolean }
  ) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.page_size) q.set("page_size", String(params.page_size));
    if (params?.eligible_only) q.set("eligible_only", "true");
    const query = q.toString() ? `?${q}` : "";
    return request<PaginatedRewards>(`/admin/rewards${query}`, { adminKey });
  },
  adminCreateReward: (adminKey: string, payload: RewardCreatePayload) =>
    request<Reward>("/admin/rewards", { method: "POST", body: payload, adminKey }),
  adminUpdateReward: (adminKey: string, id: number, payload: RewardUpdatePayload) =>
    request<Reward>(`/admin/rewards/${id}`, { method: "PATCH", body: payload, adminKey }),
  adminDeactivateReward: (adminKey: string, id: number) =>
    request<{ id: number; is_active: boolean; message: string }>(
      `/admin/rewards/${id}/deactivate`,
      { method: "POST", adminKey }
    ),
  adminRunExpirationJob: (adminKey: string) =>
    request<{ deactivated_count: number; message: string }>("/admin/rewards/jobs/expire", {
      method: "POST",
      adminKey,
    }),
};
