import type { IconName } from '../icons/Icon.types';
import type { Status, ToastTone } from './Toast.types';

export const STATUS_OF: Record<ToastTone, Status> = {
  info: 'info',
  neutral: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
  danger: 'error',
};

export const STATUS_ICON: Record<Status, { icon: IconName; className: string }> = {
  info: { icon: 'info', className: 'text-info' },
  success: { icon: 'check-circle', className: 'text-success' },
  warning: { icon: 'alert-warning', className: 'text-warning' },
  error: { icon: 'alert-danger', className: 'text-danger' },
};

export const AUTO_HIDE_MS = 4000;
