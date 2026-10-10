import type { Result } from '../result.types';

/**
 * A validation failure: a stable code (aligned with backend ErrorCodes where one exists), the precise reason and the
 * values a message needs. No user copy: the presentation layer translates `code` + `reason` (forms `codes.*`).
 */
export type FieldError = {
  readonly code: string;
  readonly reason?: string;
  readonly params?: Readonly<Record<string, string | number>>;
};

export type ValidationResult<T = string> = Result<T, FieldError>;
