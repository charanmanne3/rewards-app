/** Admin & legacy types — public models live in `models.ts` */
import type { RewardType } from "./models";

export * from "./models";

export interface Reward {
  id: number;
  store_id: number;
  card_id: number;
  cashback_percent: number;
  reward_type: RewardType;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  store_name?: string | null;
  card_name?: string | null;
  issuer?: string | null;
  is_currently_eligible?: boolean | null;
}

export interface PaginatedRewards {
  items: Reward[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface RewardCreatePayload {
  store_id: number;
  card_id: number;
  cashback_percent: number;
  reward_type: RewardType;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
}

export interface RewardUpdatePayload {
  cashback_percent?: number;
  reward_type?: RewardType;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
}

export interface ApiError {
  detail: string | { msg: string }[];
}
