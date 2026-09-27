/** FNV-1a 32-bit. */
const fnv = (s: string, seed: number): number => {
  let h = 0x811c9dc5 ^ seed;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

/** Deterministic UUID for seed rows so ids stay stable across reloads and between tabs. */
export const seedId = (key: string): string => {
  const hex = [1, 2, 3, 4].map((salt) => fnv(key, salt * 0x9e3779b1).toString(16).padStart(8, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};

export const randomId = (): string => globalThis.crypto.randomUUID();
