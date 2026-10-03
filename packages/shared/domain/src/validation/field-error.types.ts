import type { Result } from '../result.types';

/** A validation failure: a stable code (aligned with backend ErrorCodes where one exists) and Persian text. */
export type FieldError = { readonly code: string; readonly message: string };

export type ValidationResult<T = string> = Result<T, FieldError>;
