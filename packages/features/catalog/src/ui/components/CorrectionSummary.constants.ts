import type { BadgeProps } from '@dukani/ui-kit';
import type { CorrectionStatus } from '../../domain/correction.types';

/** Badge tone per status; the status is shown from the enum, never inferred from server text (F11 §9A). */
export const CORRECTION_STATUS_TONE: Record<CorrectionStatus, NonNullable<BadgeProps['tone']>> = {
  Draft: 'neutral',
  Submitted: 'info',
  Reviewing: 'info',
  NeedInfo: 'warning',
  Accepted: 'success',
  Rejected: 'danger',
  Appealed: 'info',
  Withdrawn: 'neutral',
};
