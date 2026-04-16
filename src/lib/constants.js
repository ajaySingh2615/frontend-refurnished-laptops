export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const TOKEN_KEYS = {
  ACCESS: "rl_access_token",
  REFRESH: "rl_refresh_token",
};
