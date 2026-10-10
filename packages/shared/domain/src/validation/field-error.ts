import type { FieldError } from './field-error.types';

export const fieldError = (code: string, reason?: string, params?: FieldError['params']): FieldError => ({
  code,
  ...(reason ? { reason } : {}),
  ...(params ? { params } : {}),
});
