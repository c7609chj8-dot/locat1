"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

const cache = new Map();
const subscribeToNothing = () => () => {};

function readStoredValue(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    const cached = cache.get(key);
    if (cached?.raw === raw) return cached.value;

    const value = raw === null ? fallback : JSON.parse(raw);
    cache.set(key, { raw, value });
    return value;
  } catch (error) {
    console.warn(`Could not read localStorage key: ${key}`, error);
    return fallback;
  }
}

function subscribeToStorage(key, onStoreChange) {
  function onStorage(event) {
    if (event.key === key || event.key === null) onStoreChange();
  }

  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

export default function useLocalStorage(key, initialValue) {
  const initialValueRef = useRef(initialValue);
  const fallback = initialValueRef.current;
  const subscribe = useCallback((onStoreChange) => subscribeToStorage(key, onStoreChange), [key]);
  const getSnapshot = useCallback(() => readStoredValue(key, fallback), [key, fallback]);
  const value = useSyncExternalStore(subscribe, getSnapshot, () => fallback);
  const isReady = useSyncExternalStore(subscribeToNothing, () => true, () => false);

  const setStoredValue = useCallback((nextValue) => {
    const currentValue = readStoredValue(key, fallback);
    const resolvedValue = typeof nextValue === "function" ? nextValue(currentValue) : nextValue;

    try {
      const raw = JSON.stringify(resolvedValue);
      window.localStorage.setItem(key, raw);
      cache.set(key, { raw, value: resolvedValue });
      window.dispatchEvent(new StorageEvent("storage", { key, newValue: raw, storageArea: window.localStorage }));
    } catch (error) {
      console.warn(`Could not write localStorage key: ${key}`, error);
    }
  }, [fallback, key]);

  return [value, setStoredValue, isReady];
}
