/** `empty` no text · `short` below the minimum (no request; show a hint, not «no result») · `waiting` debounce running. */
export type SearchTermState = 'empty' | 'short' | 'waiting' | 'ready';

export type SearchTermOptions = {
  /** Default `SEARCH_MIN_LENGTH` (3 meaningful characters). */
  readonly minLength?: number;
  /** Default `SEARCH_DEBOUNCE_MS` (300). */
  readonly delayMs?: number;
};

export type SearchTerm = {
  /** Last settled trimmed text at or above the minimum, '' when there is none. Key the requests with it. */
  readonly term: string;
  readonly state: SearchTermState;
  /** Explicit submission (Enter, a scanner's trailing Enter): settles the current text without the debounce. */
  readonly flush: () => void;
};
