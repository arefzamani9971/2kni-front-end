/** Port for small per-device preferences (last store, filters). Never for money, stock or tokens. */
export type KeyValueStorage = {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
};

const safe = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export const createWebStorage = (kind: 'local' | 'session', prefix = 'dukani:'): KeyValueStorage => {
  const store = () => (typeof window === 'undefined' ? null : kind === 'local' ? window.localStorage : window.sessionStorage);
  return {
    get: <T,>(key: string) => safe(() => {
      const raw = store()?.getItem(prefix + key);
      return raw ? (JSON.parse(raw) as T) : null;
    }, null),
    set: (key, value) => safe(() => store()?.setItem(prefix + key, JSON.stringify(value)), undefined),
    remove: (key) => safe(() => store()?.removeItem(prefix + key), undefined),
  };
};

export const createMemoryStorage = (): KeyValueStorage => {
  const map = new Map<string, string>();
  return {
    get: <T,>(key: string) => (map.has(key) ? (JSON.parse(map.get(key)!) as T) : null),
    set: (key, value) => void map.set(key, JSON.stringify(value)),
    remove: (key) => void map.delete(key),
  };
};
