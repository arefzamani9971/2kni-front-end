import type { IconName } from '../icons/Icon.types';
import type { AlertTone } from './Alert.types';

export const TONES: Record<AlertTone, { box: string; iconClass: string; icon: IconName }> = {
  danger: {
    box: 'bg-danger-subtle border-danger text-danger',
    iconClass: 'text-danger',
    icon: 'alert-danger',
  },
  warning: {
    box: 'bg-surface border-warning text-fg-primary',
    iconClass: 'text-warning',
    icon: 'alert-warning',
  },
  info: { box: 'bg-surface border-info text-fg-primary', iconClass: 'text-info', icon: 'info' },
  success: {
    box: 'bg-surface border-success text-fg-primary',
    iconClass: 'text-success',
    icon: 'check-circle',
  },
};
