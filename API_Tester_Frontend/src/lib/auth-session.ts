import { useSyncExternalStore } from "react";

export type SessionUser = {
  userId: number;
  name: string;
  email: string;
};

const STORAGE_KEY = "apiTesterUser";
const SESSION_CHANGE_EVENT = "api-tester-session-change";
let cachedRaw = "";
let cachedParsed: SessionUser | null = null;

export function saveSessionUser(user: SessionUser): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY) ?? "";
  if (raw === cachedRaw) {
    return cachedParsed;
  }

  cachedRaw = raw;

  if (!raw) {
    cachedParsed = null;
    return null;
  }

  try {
    cachedParsed = JSON.parse(raw) as SessionUser;
    return cachedParsed;
  } catch {
    cachedParsed = null;
    return null;
  }
}

export function clearSessionUser(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener(SESSION_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(SESSION_CHANGE_EVENT, handleChange);
  };
}

export function useSessionUser(): SessionUser | null {
  return useSyncExternalStore(subscribe, getSessionUser, () => null);
}
