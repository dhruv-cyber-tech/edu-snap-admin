import axios from "axios";
import {
  dashboardStats,
  resources as mockResources,
  mockUser,
  tags as mockTags,
  mockStandards,
  mockSubjects,
  mockChapters,
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

function parseParams(url = "") {
  const qs = url.split("?")[1] ?? "";
  return Object.fromEntries(new URLSearchParams(qs));
}

let mockResourceStore = [...mockResources];
let nextId = mockResourceStore.length + 1;

// Entity stores for Standards / Subjects / Chapters management.
let standardStore = mockStandards.map((s) => ({ ...s }));
let subjectStore = mockSubjects.map((s) => ({ ...s }));
let chapterStore = mockChapters.map((c) => ({ ...c }));
let nextStandardId = standardStore.length + 1;
let nextSubjectId = subjectStore.length + 1;
let nextChapterId = chapterStore.length + 1;

function withSubjectCount(std) {
  return {
    ...std,
    subjectCount: subjectStore.filter((s) => s.standardId === std.id).length,
  };
}
function withChapterCount(subj) {
  return {
    ...subj,
    chapterCount: chapterStore.filter((c) => c.subjectId === subj.id).length,
  };
}

function matchesFilters(r, p) {
  if (p.standard && r.standard !== p.standard) return false;
  if (p.subject && r.subject !== p.subject) return false;
  if (p.chapter && r.chapter !== p.chapter) return false;
  if (p.type && r.type !== p.type) return false;
  if (p.search) {
    const q = p.search.toLowerCase();
    const hay = `${r.title} ${r.subject} ${r.chapter} ${(r.tags ?? []).join(" ")}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

if (USE_MOCK) {
  client.get = (url) => {
    const path = normalize(url);
    if (path === "/dashboard/stats") return delay(dashboardStats);

    if (path === "/resources") {
      const p = parseParams(url);
      const filtered = mockResourceStore.filter((r) => matchesFilters(r, p));
      const page = Number(p.page ?? 0);
      const size = Number(p.size ?? 20);
      const start = page * size;
      const content = filtered.slice(start, start + size);
      // Spring-style Page response.
      return delay({
        content,
        totalElements: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / size)),
        number: page,
        size,
      });
    }

    if (path === "/standards") {
      const sorted = [...standardStore].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      );
      return delay(sorted.map(withSubjectCount));
    }

    if (path === "/tags") {
      return delay([...mockTags]);
    }

    let m = path.match(/^\/standards\/(\d+)\/subjects$/);
    if (m) {
      const sid = Number(m[1]);
      return delay(
        subjectStore
          .filter((s) => s.standardId === sid)
          .map(withChapterCount),
      );
    }

    m = path.match(/^\/subjects\/(\d+)\/chapters$/);
    if (m) {
      const sid = Number(m[1]);
      return delay(
        chapterStore
          .filter((c) => c.subjectId === sid)
          .sort((a, b) => a.number - b.number),
      );
    }

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
      let tagList = ["practice"];
      const rawTags = get("tags");
      if (rawTags) {
        try {
          const parsed = JSON.parse(rawTags);
          if (Array.isArray(parsed)) tagList = parsed;
        } catch {
          tagList = String(rawTags)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        }
      }
      const created = {
        id: nextId++,
        title: get("title") ?? "Untitled",
        subject: get("subject") ?? "",
        description: get("description") ?? "",
        chapter: get("chapter") ?? "",
        type: get("type") ?? "Notes",
        standard: get("standard") ?? "",
        tags: tagList,
        downloads: 0,
        url: "#",
        uploadedAt: new Date().toISOString(),
      };
      mockResourceStore = [created, ...mockResourceStore];
      return delay(created);
    }

    if (path === "/standards") {
      const created = {
        id: nextStandardId++,
        name: body?.name ?? "Untitled",
        sortOrder: Number(body?.sortOrder ?? standardStore.length + 1),
      };
      standardStore = [...standardStore, created];
      return delay(withSubjectCount(created));
    }

    if (path === "/subjects") {
      const created = {
        id: nextSubjectId++,
        name: body?.name ?? "Untitled",
        standardId: Number(body?.standardId),
      };
      subjectStore = [...subjectStore, created];
      return delay(withChapterCount(created));
    }

    if (path === "/chapters") {
      const created = {
        id: nextChapterId++,
        number: Number(body?.number ?? 1),
        name: body?.name ?? "Untitled",
        subjectId: Number(body?.subjectId),
      };
      chapterStore = [...chapterStore, created];
      return delay(created);
    }

    return delay(null);
  };

  client.put = (url, body) => {
    const path = normalize(url);
    const match = path.match(/^\/resources\/(\d+)$/);
    if (match) {
      const id = Number(match[1]);
      mockResourceStore = mockResourceStore.map((r) =>
        r.id === id ? { ...r, ...body } : r,
      );
      return delay(mockResourceStore.find((r) => r.id === id));
    }
    return delay(null);
  };

  client.delete = (url) => {
    const path = normalize(url);
    let match = path.match(/^\/resources\/(\d+)$/);
    if (match) {
      const id = Number(match[1]);
      mockResourceStore = mockResourceStore.filter((r) => r.id !== id);
      return delay({ success: true });
    }

    match = path.match(/^\/standards\/(\d+)$/);
    if (match) {
      const id = Number(match[1]);
      const subjectIds = subjectStore
        .filter((s) => s.standardId === id)
        .map((s) => s.id);
      standardStore = standardStore.filter((s) => s.id !== id);
      subjectStore = subjectStore.filter((s) => s.standardId !== id);
      chapterStore = chapterStore.filter(
        (c) => !subjectIds.includes(c.subjectId),
      );
      return delay({ success: true });
    }

    match = path.match(/^\/subjects\/(\d+)$/);
    if (match) {
      const id = Number(match[1]);
      subjectStore = subjectStore.filter((s) => s.id !== id);
      chapterStore = chapterStore.filter((c) => c.subjectId !== id);
      return delay({ success: true });
    }

    match = path.match(/^\/chapters\/(\d+)$/);
    if (match) {
      const id = Number(match[1]);
      chapterStore = chapterStore.filter((c) => c.id !== id);
      return delay({ success: true });
    }

    return delay(null);
  };
}

export default client;

