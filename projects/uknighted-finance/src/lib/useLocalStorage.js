import { useEffect, useState } from "react";

// useState that is saved to localStorage. Falls back to memory when storage is
// unavailable (private windows, blocked site data).
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) return JSON.parse(saved);
    } catch {
      // Ignore unreadable or blocked storage.
    }
    return typeof initialValue === "function" ? initialValue() : initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage that is full or blocked.
    }
  }, [key, value]);

  return [value, setValue];
}
