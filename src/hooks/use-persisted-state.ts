import { useHydrated } from "@tanstack/react-router";
import { useEffect, useState } from "react";

/** Like useState, but persists the value to localStorage under the given key. */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const hydrated = useHydrated();
  const [value, setValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored) as T);
      }
    } catch {
      // Corrupt JSON -- will be overwritten on next set
    }
    setLoaded(true);
  }, [key, hydrated]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value, loaded]);

  return [value, setValue];
}
