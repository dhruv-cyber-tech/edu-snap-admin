import { create } from "zustand";
import { TOKEN_KEY } from "@/api/client";

function readToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

function readUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Global auth state. Token mirrored in localStorage so the axios
 * interceptor and a fresh page load can both read it.
 */
export const useAuthStore = create((set) => ({
  token: readToken(),
  user: readUser(),

  isAuthenticated: () => Boolean(readToken()),

  login: ({ token, user }) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_KEY, token);
      window.localStorage.setItem("user", JSON.stringify(user ?? null));
    }
    set({ token, user: user ?? null });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem("user");
    }
    set({ token: null, user: null });
  },
}));
