import { useCallback, useEffect, useRef, useState } from 'react';
import type { SetStateAction } from 'react';

const SYNC_EVENT = 'ovara:storage';

function read<T>(key: string, initial: T | (() => T)): T {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored !== null) return JSON.parse(stored) as T;
  } catch {
    // Storage can be unavailable or hold invalid JSON. Fall back to the default.
  }
  return typeof initial === 'function' ? (initial as () => T)() : initial;
}

/**
 * State backed by localStorage.
 * - Writes only happen when the value is set, never on mount, so a screen that
 *   only reads a key can no longer overwrite it with an empty default.
 * - Components using the same key stay in sync, including across tabs.
 */
export function usePersistentState<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => read(key, initial));
  const latest = useRef(value);
  const instance = useRef(Symbol(key));
  const initialRef = useRef(initial);
  latest.current = value;

  const set = useCallback((next: SetStateAction<T>) => {
    const resolved = typeof next === 'function' ? (next as (previous: T) => T)(latest.current) : next;
    latest.current = resolved;
    setValue(resolved);
    try {
      window.localStorage.setItem(key, JSON.stringify(resolved));
    } catch {
      // The app keeps working in memory if storage is full or blocked.
    }
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { key, source: instance.current } }));
  }, [key]);

  useEffect(() => {
    const refresh = () => {
      const next = read(key, initialRef.current);
      latest.current = next;
      setValue(next);
    };
    const onSync = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; source: symbol }>).detail;
      if (detail.key === key && detail.source !== instance.current) refresh();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) refresh();
    };
    window.addEventListener(SYNC_EVENT, onSync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SYNC_EVENT, onSync);
      window.removeEventListener('storage', onStorage);
    };
  }, [key]);

  return [value, set] as const;
}
