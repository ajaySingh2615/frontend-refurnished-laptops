"use client";

import { createContext, useReducer, useEffect, useCallback } from "react";
import { apiFetch, setTokens, clearTokens, getRefreshToken } from "./api";
import { TOKEN_KEYS } from "./constants";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, loading: false };
    case "LOGOUT":
      return { ...state, user: null, loading: false };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const hydrate = useCallback(async () => {
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem(TOKEN_KEYS.ACCESS)
        : null;

    if (!accessToken) {
      dispatch({ type: "LOGOUT" });
      return;
    }

    try {
      const res = await apiFetch("/api/auth/me");

      if (res.ok) {
        const json = await res.json();
        dispatch({ type: "SET_USER", payload: json.data });
      } else {
        clearTokens();
        dispatch({ type: "LOGOUT" });
      }
    } catch {
      clearTokens();
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback((data) => {
    const { accessToken, refreshToken, user } = data;
    setTokens(accessToken, refreshToken);
    dispatch({ type: "SET_USER", payload: user });
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = getRefreshToken();
      await apiFetch("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // logout even if request fails
    } finally {
      clearTokens();
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const value = {
    user: state.user,
    loading: state.loading,
    login,
    logout,
    hydrate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
