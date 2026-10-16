import { normalizeDigits } from '@dukani/domain';
import {
  WEDGE_MAX_GAP_MS,
  WEDGE_MAX_LENGTH,
  WEDGE_MIN_LENGTH,
  WEDGE_PUNCTUATION,
  WEDGE_TERMINATORS,
} from './keyboard-wedge.constants';
import type { KeyboardWedgeDetector, KeyboardWedgeOptions, WedgeKey } from './keyboard-wedge.types';

/** Character of one key: physical code first (independent of the OS keyboard layout), then the typed key. */
function charOf(event: WedgeKey): string | null {
  const digit = /^(?:Digit|Numpad)([0-9])$/.exec(event.code);
  if (digit) return digit[1]!;
  const letter = /^Key([A-Z])$/.exec(event.code);
  if (letter) return event.shiftKey ? letter[1]! : letter[1]!.toLowerCase();
  const punctuation = WEDGE_PUNCTUATION[event.code];
  if (punctuation) return punctuation[event.shiftKey ? 1 : 0];
  if (event.key.length === 1) return normalizeDigits(event.key);
  return null;
}

/**
 * Recognises a keyboard-wedge barcode scanner (USB/Bluetooth scanners type the code and press Enter) by timing:
 * a burst of keys with tiny gaps that ends in Enter/Tab. Slow keys start over, so a person typing is never taken
 * for a scan. Pure and clock-free: time comes from the events.
 */
export function createKeyboardWedgeDetector({
  maxGapMs = WEDGE_MAX_GAP_MS,
  minLength = WEDGE_MIN_LENGTH,
  maxLength = WEDGE_MAX_LENGTH,
}: KeyboardWedgeOptions = {}): KeyboardWedgeDetector {
  let buffer = '';
  let last = Number.NEGATIVE_INFINITY;
  const reset = () => {
    buffer = '';
    last = Number.NEGATIVE_INFINITY;
  };
  return {
    reset,
    feed(event) {
      if (event.ctrlKey || event.altKey || event.metaKey || event.isComposing) {
        reset();
        return { code: null, consumed: false };
      }
      const fast = event.timeStamp - last <= maxGapMs;
      if (WEDGE_TERMINATORS.has(event.key)) {
        const code = fast && buffer.length >= minLength ? buffer : null;
        reset();
        return { code, consumed: code !== null };
      }
      const char = charOf(event);
      if (char === null) return { code: null, consumed: false };
      buffer = fast ? (buffer + char).slice(-maxLength) : char;
      last = event.timeStamp;
      return { code: null, consumed: false };
    },
  };
}
