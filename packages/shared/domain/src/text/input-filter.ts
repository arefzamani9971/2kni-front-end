import type { FilterCheck, InputFilter } from './input-filter.types';
import { INPUT_FILTER_MESSAGES, PATTERNS } from './input-filter.constants';

/** Checks a whole candidate value (after typing, paste or autofill) against a filter. */
export const checkInputFilter = (filter: InputFilter | undefined, candidate: string): FilterCheck => {
  if (!filter || filter === 'any') return { accepted: true };
  if (typeof filter === 'object') {
    return filter.pattern.test(candidate) ? { accepted: true } : { accepted: false, message: filter.message };
  }
  return PATTERNS[filter].test(candidate)
    ? { accepted: true }
    : { accepted: false, message: INPUT_FILTER_MESSAGES[filter] };
};

/** `inputMode` hint that matches a filter (keyboard only; never a validator). */
export const inputModeFor = (filter: InputFilter | undefined): 'numeric' | 'decimal' | 'email' | 'text' => {
  if (filter === 'digits') return 'numeric';
  if (filter === 'decimal') return 'decimal';
  if (filter === 'email') return 'email';
  return 'text';
};
