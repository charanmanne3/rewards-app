/** Backward-compatible re-exports — prefer `@/config/env` */
import { env } from "./config/env";

export { env };
export const API_URL = env.apiUrl;
export const ADMIN_API_KEY = env.adminApiKey;
