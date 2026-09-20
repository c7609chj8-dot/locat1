"use client";

import { useCallback, useEffect, useState } from "react";

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) setValue(JSON.parse(stored));
    } catch (error) {
      console.warn(`Could not read localStorage key: ${key}`, error);
    } finally {
      setIsReady(true);
    }
  }, [key]);

  const setStoredValue = useCallback((nextValue) => {
    setValue((previousValue) => {
      const resolvedValue = typeof nextValue === "function" ? nextValue(previousValue) : nextValue;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolvedValue));
      } catch (error) {
        console.warn(`Could not write localStorage key: ${key}`, error);
      }
      return resolvedValue;
    });
  }, [key]);

  return [value, setStoredValue, isReady];
}
