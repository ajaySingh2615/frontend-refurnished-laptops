"use client";

import { API_BASE_URL, TOKEN_KEYS } from "./constants";

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEYS.ACCESS);
}

function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEYS.REFRESH);
}

function setTokens(accessToken, refreshToken) {
  localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
  localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
}

let isRefreshing = false;
let refreshPromise = null;

async function attemptRefresh() {
  if (isRefreshing) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      return false;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        clearTokens();
        return false;
      }

      const json = await res.json();
      const { accessToken: newAccess, refreshToken: newRefresh } =
        json.data || {};

      if (newAccess && newRefresh) {
        setTokens(newAccess, newRefresh);
        return true;
      }

      clearTokens();
      return false;
    } catch {
      clearTokens();
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const accessToken = getAccessToken();
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await attemptRefresh();

    if (refreshed) {
      headers["Authorization"] = `Bearer ${getAccessToken()}`;
      res = await fetch(url, { ...options, headers });
    }
  }

  return res;
}

export async function apiUpload(path, formData) {
  const url = `${API_BASE_URL}${path}`;

  const headers = {};
  const accessToken = getAccessToken();
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, { method: "POST", headers, body: formData });

  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getAccessToken()}`;
      res = await fetch(url, { method: "POST", headers, body: formData });
    }
  }

  return res;
}

export { setTokens, clearTokens, getRefreshToken };
