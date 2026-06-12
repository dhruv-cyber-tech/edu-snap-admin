import axios from "axios";
import {
  dashboardStats,
  resources as mockResources,
  mockUser,
} from "./mockData";

// Flip this to false when you are ready to connect the real Spring Boot API.
// Every API function keeps the same name and shape, so nothing else changes.
const USE_MOCK = true;

export const API_BASE_URL = "http://localhost:8080/api";

export const TOKEN_KEY = "token";

/**
 * Single shared axios instance.
 * - Attaches `Authorization: Bearer <token>` to every request automatically.
 * - On any 401 response, clears auth and redirects to /login.
 */
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

// ---------------------------------------------------------------------------
// Mock layer
// ---------------------------------------------------------------------------
// When USE_MOCK is true we shim `client.get` / `client.post` so they resolve
// with the same `{ data }` shape axios returns, using in-memory sample data.
// Setting USE_MOCK = false restores the real axios methods automatically.

function delay(value, ms = 350) {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ data: value }), ms),
  );
}

function normalize(url = "") {
  // Strip query string and trailing slash for matching.
  return url.split("?")[0].replace(/\/$/, "");
}

let mockResourceStore = [...mockResources];
let nextId = mockResourceStore.length + 1;

if (USE_MOCK) {
  client.get = (url) => {
    const path = normalize(url);
    if (path === "/dashboard/stats") return delay(dashboardStats);
    if (path === "/resources") return delay(mockResourceStore);
    return delay(null);
  };

  client.post = (url, body) => {
    const path = normalize(url);

    if (path === "/auth/login") {
      return delay({ token: "mock-jwt-token", user: mockUser });
    }

    if (path === "/resources") {
      // body is a FormData instance from the Upload form.
      const get = (k) =>
        body && typeof body.get === "function" ? body.get(k) : body?.[k];
      const created = {
        id: nextId++,
        title: get("title") ?? "Untitled",
        subject: get("subject") ?? "",
        description: get("description") ?? "",
        type: "Notes",
        standard: "Class 10",
        tags: ["practice"],
        downloads: 0,
        url: "#",
        uploadedAt: new Date().toISOString(),
      };
      mockResourceStore = [created, ...mockResourceStore];
      return delay(created);
    }

    return delay(null);
  };
}

export default client;
