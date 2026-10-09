import type { Status } from '../lib/types';

export const BOX_STATUS: Record<Status, string> = {
  default:
    'border-line focus-within:border-focus focus-within:shadow-[inset_0_0_0_1px_var(--dukani-color-border-focus)]',
  error: 'border-invalid focus-within:shadow-[inset_0_0_0_1px_var(--dukani-color-border-invalid)]',
  warning: 'border-warning focus-within:shadow-[inset_0_0_0_1px_var(--dukani-color-border-warning)]',
  success: 'border-success focus-within:shadow-[inset_0_0_0_1px_var(--dukani-color-border-success)]',
  info: 'border-info focus-within:shadow-[inset_0_0_0_1px_var(--dukani-color-status-info)]',
};

export const MESSAGE_STATUS: Record<Status, string> = {
  default: 'text-fg-secondary',
  error: 'text-danger',
  warning: 'text-warning',
  success: 'text-success',
  info: 'text-info',
};

export const MESSAGE_ICON = {
  error: 'alert-danger',
  warning: 'alert-warning',
  success: 'check-circle',
  info: 'info',
} as const;
