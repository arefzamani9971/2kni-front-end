import type { ReactNode } from 'react';

/** Figma `Toast` Status: Info / Success / Warning / Error. `neutral` and `danger` are kept as aliases. */
export type ToastTone = 'info' | 'success' | 'warning' | 'error' | 'neutral' | 'danger';

export type Status = 'info' | 'success' | 'warning' | 'error';

export type ToastOptions = {
  /** Errors persist until dismissed by default (Figma); others auto-hide after this many ms. */
  duration?: number;
};

export type ToastItem = { id: number; message: ReactNode; status: Status };

export type ShowToast = (message: ReactNode, tone?: ToastTone, options?: ToastOptions) => void;
