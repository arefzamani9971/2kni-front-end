import type { FieldError } from './field-error.types';

export const fieldError = (code: string, message: string, reason?: string): FieldError =>
  reason ? { code, message, reason } : { code, message };
