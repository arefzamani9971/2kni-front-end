/** The fields of a keydown the detector needs (a real `KeyboardEvent` satisfies it). */
export type WedgeKey = {
  readonly key: string;
  /** Physical key (`Digit7`, `KeyA`): layout-independent, so a Persian keyboard layout cannot change the code. */
  readonly code: string;
  readonly timeStamp: number;
  readonly shiftKey?: boolean;
  readonly ctrlKey?: boolean;
  readonly altKey?: boolean;
  readonly metaKey?: boolean;
  readonly isComposing?: boolean;
};

export type KeyboardWedgeOptions = {
  /** Longest pause between two keys of one scan; people type slower than this. */
  readonly maxGapMs?: number;
  readonly minLength?: number;
  readonly maxLength?: number;
};

export type WedgeResult = {
  /** The scanned code when a fast burst ended with Enter/Tab. */
  readonly code: string | null;
  /** The key belonged to a scan and must not reach the page (e.g. Enter must not press a focused button). */
  readonly consumed: boolean;
};

export type KeyboardWedgeDetector = {
  readonly feed: (event: WedgeKey) => WedgeResult;
  readonly reset: () => void;
};
