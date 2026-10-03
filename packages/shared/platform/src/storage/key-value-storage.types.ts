/** Port for small per-device preferences (last store, filters). Never for money, stock or tokens. */
export type KeyValueStorage = {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
};
