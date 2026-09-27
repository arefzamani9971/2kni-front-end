import { err, ok } from '../result';
import { collapseSpaces, normalizePersianLetters } from '../text/normalize';
import { fieldError, type ValidationResult } from './field-error';

/** Required, trimmed text up to `max` characters (backend `RequiredText(max, label)`). */
export const parseRequiredText = (raw: string, label: string, max: number): ValidationResult => {
  const s = collapseSpaces(normalizePersianLetters(raw));
  if (s === '') return err(fieldError('REQUIRED', `${label} را وارد کنید.`));
  if (s.length > max) return err(fieldError('TOO_LONG', `${label} حداکثر ${max} نویسه است.`));
  return ok(s);
};

/** Optional text: empty is fine, otherwise trimmed and limited (backend `OptionalText`). */
export const parseOptionalText = (raw: string, label: string, max: number): ValidationResult<string | null> => {
  const s = collapseSpaces(normalizePersianLetters(raw));
  if (s === '') return ok(null);
  if (s.length > max) return err(fieldError('TOO_LONG', `${label} حداکثر ${max} نویسه است.`));
  return ok(s);
};
