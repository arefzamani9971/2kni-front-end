import type { FieldError } from './field-error.types';

export const fieldError = (code: string, message: string): FieldError => ({ code, message });
