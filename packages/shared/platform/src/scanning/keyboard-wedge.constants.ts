/** Hardware scanners send a whole code in a few milliseconds per key; even fast typists leave 60 ms+ gaps. */
export const WEDGE_MAX_GAP_MS = 40;
/** Same bounds as `parseBarcode` (4–32), with headroom: the intake validates the final code. */
export const WEDGE_MIN_LENGTH = 4;
export const WEDGE_MAX_LENGTH = 64;
export const WEDGE_TERMINATORS: ReadonlySet<string> = new Set(['Enter', 'Tab', 'NumpadEnter']);

/** Physical punctuation keys a barcode may contain (`[A-Za-z0-9_.-]`), unshifted / shifted. */
export const WEDGE_PUNCTUATION: Readonly<Record<string, readonly [string, string]>> = {
  Minus: ['-', '_'],
  Period: ['.', '.'],
  NumpadSubtract: ['-', '-'],
  NumpadDecimal: ['.', '.'],
};
